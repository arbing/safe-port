import net from 'node:net';
import { COMMON_PORTS, DEFAULT_HOST, DEFAULT_MAX_PORT, DEFAULT_MIN_PORT } from './constants.js';

export type OutputFormat = 'plain' | 'json' | 'env';

export interface PickPortOptions {
  min?: number;
  max?: number;
  host?: string;
  count?: number;
  exclude?: Iterable<number>;
  avoidCommon?: boolean;
}

export interface NormalizedPickPortOptions {
  min: number;
  max: number;
  host: string;
  count: number;
  exclude: Set<number>;
  avoidCommon: boolean;
}

export class PortError extends Error {
  constructor(message: string, readonly exitCode: number) {
    super(message);
    this.name = 'PortError';
  }
}

export function normalizeOptions(options: PickPortOptions = {}): NormalizedPickPortOptions {
  const min = options.min ?? DEFAULT_MIN_PORT;
  const max = options.max ?? DEFAULT_MAX_PORT;
  const count = options.count ?? 1;
  const host = options.host ?? DEFAULT_HOST;
  const avoidCommon = options.avoidCommon ?? true;

  if (!Number.isInteger(min) || min < 1 || min > 65_535) {
    throw new PortError('The minimum port must be an integer between 1 and 65535.', 1);
  }

  if (!Number.isInteger(max) || max < 1 || max > 65_535) {
    throw new PortError('The maximum port must be an integer between 1 and 65535.', 1);
  }

  if (min > max) {
    throw new PortError('The minimum port must be less than or equal to the maximum port.', 1);
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new PortError('The port count must be a positive integer.', 1);
  }

  const exclude = new Set(options.exclude ?? []);

  for (const port of exclude) {
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new PortError(`Invalid excluded port: ${port}.`, 1);
    }
  }

  return { min, max, host, count, exclude, avoidCommon };
}

export function buildCandidatePorts(options: NormalizedPickPortOptions): number[] {
  const ports: number[] = [];

  for (let port = options.min; port <= options.max; port += 1) {
    if (options.exclude.has(port)) {
      continue;
    }

    if (options.avoidCommon && COMMON_PORTS.has(port)) {
      continue;
    }

    ports.push(port);
  }

  return shuffle(ports);
}

export async function isPortAvailable(port: number, host = DEFAULT_HOST): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.unref();

    server.once('error', () => {
      resolve(false);
    });

    server.listen({ port, host, exclusive: true }, () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

export async function pickPorts(options: PickPortOptions = {}): Promise<number[]> {
  const normalized = normalizeOptions(options);
  const candidates = buildCandidatePorts(normalized);
  const picked: number[] = [];

  for (const port of candidates) {
    if (picked.length >= normalized.count) {
      break;
    }

    if (await isPortAvailable(port, normalized.host)) {
      picked.push(port);
    }
  }

  if (picked.length < normalized.count) {
    throw new PortError(
      `Unable to find ${normalized.count} available port${normalized.count === 1 ? '' : 's'} in ${normalized.min}-${normalized.max}.`,
      2
    );
  }

  return picked;
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }

  return items;
}
