import { describe, expect, it } from 'vitest';
import { formatPorts, parseArgs } from '../src/cli.js';

describe('cli parsing', () => {
  it('parses numeric and list options', () => {
    const options = parseArgs([
      '--min',
      '30000',
      '--max',
      '30100',
      '--count',
      '2',
      '--exclude',
      '30001,30002',
      '--host',
      '0.0.0.0',
      '--format',
      'json'
    ]);

    expect(options).toMatchObject({
      min: 30_000,
      max: 30_100,
      count: 2,
      exclude: [30_001, 30_002],
      host: '0.0.0.0',
      format: 'json'
    });
  });

  it('rejects unknown options', () => {
    expect(() => parseArgs(['--bad'])).toThrow(/Unknown option/);
  });
});

describe('cli formatting', () => {
  it('formats plain output', () => {
    expect(formatPorts([30_001, 30_002], 'plain')).toBe('30001\n30002');
  });

  it('formats json output', () => {
    expect(JSON.parse(formatPorts([30_001], 'json'))).toEqual({ port: 30_001 });
    expect(JSON.parse(formatPorts([30_001, 30_002], 'json'))).toEqual({ ports: [30_001, 30_002] });
  });

  it('formats env output', () => {
    expect(formatPorts([30_001], 'env')).toBe('PORT=30001');
    expect(formatPorts([30_001, 30_002], 'env')).toBe('PORTS=30001,30002');
  });
});
