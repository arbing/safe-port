import net from 'node:net';
import { describe, expect, it } from 'vitest';
import { COMMON_PORTS, DEFAULT_MAX_PORT, DEFAULT_MIN_PORT, buildCandidatePorts, isPortAvailable, normalizeOptions, pickPorts } from '../src/index.js';

async function listenOnLocalhost(port = 0): Promise<net.Server> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen({ port, host: '127.0.0.1' }, () => resolve());
  });
  return server;
}

function closeServer(server: net.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

describe('port picking', () => {
  it('returns a default port in the safe range', async () => {
    const [port] = await pickPorts();

    expect(port).toBeGreaterThanOrEqual(DEFAULT_MIN_PORT);
    expect(port).toBeLessThanOrEqual(DEFAULT_MAX_PORT);
    expect(COMMON_PORTS.has(port)).toBe(false);
  });

  it('honors min and max', async () => {
    const [port] = await pickPorts({ min: 35_000, max: 35_010 });

    expect(port).toBeGreaterThanOrEqual(35_000);
    expect(port).toBeLessThanOrEqual(35_010);
  });

  it('excludes custom ports from candidates', () => {
    const options = normalizeOptions({ min: 30_000, max: 30_003, exclude: [30_001, 30_002] });
    const candidates = buildCandidatePorts(options);

    expect(candidates.toSorted()).toEqual([30_000, 30_003]);
  });

  it('does not return occupied ports', async () => {
    const server = await listenOnLocalhost();
    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address.');
    }

    try {
      await expect(isPortAvailable(address.port)).resolves.toBe(false);
      await expect(pickPorts({ min: address.port, max: address.port })).rejects.toThrow(/Unable to find/);
    } finally {
      await closeServer(server);
    }
  });

  it('returns unique ports for count requests', async () => {
    const ports = await pickPorts({ min: 36_000, max: 36_020, count: 3 });

    expect(ports).toHaveLength(3);
    expect(new Set(ports).size).toBe(3);
  });

  it('rejects invalid ranges', async () => {
    await expect(pickPorts({ min: 50_000, max: 40_000 })).rejects.toThrow(/minimum port/);
  });
});
