#!/usr/bin/env node
import { pickPorts, PortError, type OutputFormat, type PickPortOptions } from './index.js';

interface CliOptions extends PickPortOptions {
  format: OutputFormat;
  help: boolean;
}

const HELP = `safe-port

Pick safe available ports for Docker and local development.

Usage:
  safe-port [options]

Options:
  --min <number>          Minimum port. Defaults to 20000.
  --max <number>          Maximum port. Defaults to 49151.
  --exclude <ports>       Comma-separated ports to exclude.
  --count <number>        Number of ports to return. Defaults to 1.
  --host <host>           Host to test. Defaults to 127.0.0.1.
  --format <format>       Output format: plain, json, or env. Defaults to plain.
  --no-avoid-common       Allow common service ports.
  --strict                Kept for script readability. Exhausted ranges already fail.
  -h, --help              Show this help message.
`;

export async function run(argv = process.argv.slice(2)): Promise<number> {
  try {
    const options = parseArgs(argv);

    if (options.help) {
      process.stdout.write(HELP);
      return 0;
    }

    const ports = await pickPorts(options);
    process.stdout.write(`${formatPorts(ports, options.format)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof PortError) {
      process.stderr.write(`${error.message}\n`);
      return error.exitCode;
    }

    if (error instanceof Error) {
      process.stderr.write(`${error.message}\n`);
      return 1;
    }

    process.stderr.write('Unknown error.\n');
    return 1;
  }
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    format: 'plain',
    help: false,
    avoidCommon: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '--min':
        options.min = parseNumberValue(arg, argv[++index]);
        break;
      case '--max':
        options.max = parseNumberValue(arg, argv[++index]);
        break;
      case '--count':
        options.count = parseNumberValue(arg, argv[++index]);
        break;
      case '--host':
        options.host = parseStringValue(arg, argv[++index]);
        break;
      case '--exclude':
        options.exclude = parsePortList(parseStringValue(arg, argv[++index]));
        break;
      case '--format':
        options.format = parseFormat(parseStringValue(arg, argv[++index]));
        break;
      case '--no-avoid-common':
        options.avoidCommon = false;
        break;
      case '--strict':
        break;
      default:
        throw new PortError(`Unknown option: ${arg}.`, 1);
    }
  }

  return options;
}

export function formatPorts(ports: number[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(ports.length === 1 ? { port: ports[0] } : { ports });
  }

  if (format === 'env') {
    return ports.length === 1 ? `PORT=${ports[0]}` : `PORTS=${ports.join(',')}`;
  }

  return ports.join('\n');
}

function parseNumberValue(flag: string, value: string | undefined): number {
  const raw = parseStringValue(flag, value);
  const parsed = Number(raw);

  if (!Number.isInteger(parsed)) {
    throw new PortError(`${flag} must be an integer.`, 1);
  }

  return parsed;
}

function parseStringValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith('-')) {
    throw new PortError(`${flag} requires a value.`, 1);
  }

  return value;
}

function parsePortList(value: string): number[] {
  return value.split(',').map((item) => {
    const parsed = Number(item.trim());

    if (!Number.isInteger(parsed)) {
      throw new PortError(`Invalid port in --exclude: ${item}.`, 1);
    }

    return parsed;
  });
}

function parseFormat(value: string): OutputFormat {
  if (value === 'plain' || value === 'json' || value === 'env') {
    return value;
  }

  throw new PortError('The output format must be plain, json, or env.', 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await run();
}
