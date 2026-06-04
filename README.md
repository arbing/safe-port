# safe-port

Pick a safe available port for Docker and local development.

[简体中文](./README.zh-CN.md) · [GitHub Pages](https://arbing.github.io/safe-port/)

## Why

Docker and local services often need a host port that is high enough, avoids common service ports, and is not currently in use. `safe-port` gives scripts a small zero-install CLI for that job.

## Usage

```bash
npx safe-port
```

Use it with Docker:

```bash
PORT=$(npx safe-port)
docker run -p "$PORT:80" nginx
```

Return multiple ports:

```bash
npx safe-port --count 3 --format json
```

## Options

| Option | Description | Default |
| --- | --- | --- |
| `--min <number>` | Minimum port | `20000` |
| `--max <number>` | Maximum port | `49151` |
| `--exclude <ports>` | Comma-separated ports to exclude | none |
| `--count <number>` | Number of ports to return | `1` |
| `--host <host>` | Host to test | `127.0.0.1` |
| `--format <format>` | `plain`, `json`, or `env` | `plain` |
| `--no-avoid-common` | Allow common service ports | disabled |
| `--strict` | Kept for readable scripts; exhausted ranges already fail | enabled behavior |
| `-h, --help` | Show help | none |

## Output formats

Plain output:

```bash
npx safe-port
# 23456
```

Environment output:

```bash
npx safe-port --format env
# PORT=23456
```

JSON output:

```bash
npx safe-port --count 2 --format json
# {"ports":[23456,23457]}
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | A port was found |
| `1` | Invalid arguments or unexpected error |
| `2` | No available port was found in the requested range |

## Notes

`safe-port` checks availability by binding a TCP server to the candidate port and closing it immediately. This is suitable for scripts, but no port picker can fully guarantee that another process will not claim the port after the check.

## Development

```bash
npm install
npm run lint
npm test
npm run build
```

## Publishing

Manual npm publishing is available through the `Publish to npm` GitHub Actions workflow. Add `NPM_TOKEN` to repository secrets before running it.

Local release scripts are also available:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

## License

MIT
