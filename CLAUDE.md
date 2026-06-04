# safe-port Agent Guide

## Project goal

`safe-port` is a small Node.js CLI that picks safe available ports for Docker and local development.

## Scope

Keep the CLI focused on local port selection:

- Prefer direct TypeScript and Node.js standard library APIs.
- Avoid heavy runtime dependencies.
- Keep output stable because it is designed for shell scripts.
- Add tests for every CLI behavior change.

## Commands

```bash
npm install
npm run lint
npm test
npm run build
```

## Structure

```text
src/constants.ts      Default port ranges and common service ports
src/port.ts           Port validation, candidate generation, availability checks
src/cli.ts            Argument parsing and CLI output formatting
src/index.ts          Public exports
test/*.test.ts        Unit tests and CLI behavior tests
docs/index.html       Single-file GitHub Pages website
```

## Release

- CI runs on push, pull request, and manual dispatch.
- npm publishing is manual through `.github/workflows/publish.yml`.
- The publish workflow requires the `NPM_TOKEN` repository secret.

## Documentation language

Code comments, documentation, commit messages, repository description, and release text should be written in English. The simplified Chinese README lives in `README.zh-CN.md`.
