# safe-port

为 Docker 和本地开发挑选一个安全可用端口。

[English](./README.md) · [GitHub Pages](https://arbing.github.io/safe-port/)

## 为什么需要

部署 Docker 服务或启动本地服务时，经常需要选择一个宿主机端口。端口不能太低，不能和常见服务冲突，也不能和当前已监听端口冲突。`safe-port` 提供一个无需安装的 CLI，适合脚本和一次性命令使用。

## 使用方式

```bash
npx safe-port
```

配合 Docker 使用：

```bash
PORT=$(npx safe-port)
docker run -p "$PORT:80" nginx
```

返回多个端口：

```bash
npx safe-port --count 3 --format json
```

## 参数

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `--min <number>` | 最小端口 | `20000` |
| `--max <number>` | 最大端口 | `49151` |
| `--exclude <ports>` | 逗号分隔的排除端口 | 无 |
| `--count <number>` | 返回端口数量 | `1` |
| `--host <host>` | 检测主机 | `127.0.0.1` |
| `--format <format>` | `plain`、`json` 或 `env` | `plain` |
| `--no-avoid-common` | 允许常见服务端口 | 默认不允许 |
| `--strict` | 保留给脚本可读性；范围耗尽时本来就会失败 | 默认行为 |
| `-h, --help` | 显示帮助 | 无 |

## 输出格式

普通输出：

```bash
npx safe-port
# 23456
```

环境变量输出：

```bash
npx safe-port --format env
# PORT=23456
```

JSON 输出：

```bash
npx safe-port --count 2 --format json
# {"ports":[23456,23457]}
```

## 退出码

| 退出码 | 含义 |
| --- | --- |
| `0` | 找到可用端口 |
| `1` | 参数非法或非预期错误 |
| `2` | 请求范围内没有可用端口 |

## 注意

`safe-port` 会通过临时绑定 TCP server 检测候选端口，然后立即关闭。这个方式适合脚本使用，但任何端口选择工具都无法完全保证检测完成后端口不会被其他进程抢占。

## 开发

```bash
npm install
npm run lint
npm test
npm run build
```

## 发布

npm 发布通过 GitHub Actions 的 `Publish to npm` workflow 手动执行。执行前需要在仓库 secrets 中添加 `NPM_TOKEN`。

也可以使用本地 release 脚本：

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

## License

MIT
