# Yapi MCP 服务器

[![MCP Status](https://img.shields.io/badge/MCP-Compatible-brightgreen)](https://modelcontext.protocol.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Yapi MCP Server** 是一个基于[模型上下文协议（MCP）](https://modelcontext.protocol.ai/)的强大工具服务器。它在您的 Yapi 实例和大型语言模型（LLM）之间架起了一座桥梁，以自动化方式根据您的 API 定义生成 TypeScript 接口。

## 它解决了什么问题

在现代开发流程中，保持前端 TypeScript 接口与后端 Yapi 定义的严格同步，是一项繁琐且容易出错的任务。开发者常常需要花费大量时间手动创建和更新 TS 类型，这不仅拖慢了开发效率，还可能引入潜在的 Bug。

本项目旨在通过一个智能、自动化的工作流来解决这一痛点。

## 工作原理

本服务并非一个独立的 HTTP 服务器，而是设计为一个通过 `stdio`（标准输入/输出）由 MCP 兼容的宿主应用（如 IDE 插件）管理的子进程。

其工作流程如下：

1.  **mcp client**: 在 chat 中通过调用 mcp 来调用。
2.  **Yapi 数据获取**: 服务器使用您提供的凭证登录到您的 Yapi 实例，并获取详细的 API 定义（包括请求和响应的结构）。
3.  **提示词生成**: 接着，它为大型语言模型（LLM）构建一个精确、详细的提示词（Prompt）。
4.  **LLM 驱动的代码生成**: 宿主将此提示词发送给 LLM，后者根据 Yapi 定义生成高质量的 TypeScript 接口和枚举。
5.  **结果展示**: 生成的代码被返回给宿主应用并呈现给您，通常以内联建议或悬浮提示面板的形式出现。

## 安装与设置

请遵循以下步骤来运行本服务器。

### 先决条件

- 一个兼容 MCP 的宿主应用（例如，特定的 IDE 插件）。
- [Bun](https://bun.sh/) (v1.0 或更高版本)。
- 一个拥有用户名和密码的 Yapi 账户。

### 安装步骤

#### npm 包安装（推荐）

1. **安装**

```sh
npm install @lstmxx/yapi-mcp-server -g
```

2. **配置**

`yapi-mcp-server` 的配置是在您的 mcp client 的设置中完成的（例如 cline 中的 `cline_mcp_settings.json`）。

请将以下 JSON 对象添加到 MCP 配置中：

```json
{
  "mcpServers": {
    "yapi-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@lstmxx/yapi-mcp-server"
      ],
      "disabled": false,
      "timeout": 60,
      "env": {
        "USERNAME": "你的Yapi用户名",
        "PASSWORD": "你的Yapi密码",
        "DOMAIN": "http://your-yapi-domain.com"
      }
    }
  }
}
```

#### 本地安装

1.  **克隆代码仓库：**

    ```bash
    git clone git@github.com:Lstmxx/yapi-mcp-server.git
    ```

2.  **进入项目目录：**

    ```bash
    cd yapi-mcp-server
    ```

3.  **安装依赖：**

    ```bash
    bun install
    ```

4.  **构建项目：**
    此命令会将 TypeScript 源码编译为宿主应用可执行的单个 JavaScript 文件。

    ```bash
    pnpm run build
    ```

    这将在 `dist/index.js` 路径下生成所需的文件。

5.  **配置**

`yapi-mcp-server` 的配置是在您的 mcp client 的设置中完成的（例如 cline 中的 `cline_mcp_settings.json`）。

请将以下 JSON 对象添加到 MCP 配置中：

```json
{
  "mcpServers": {
    "yapi-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": [
        // 重要：请将此路径替换为您构建出的文件的绝对路径
        "/path/to/your/yapi-mcp-server/dist/index.js"
      ],
      "disabled": false,
      "timeout": 60,
      "env": {
        "USERNAME": "你的Yapi用户名",
        "PASSWORD": "你的Yapi密码",
        "DOMAIN": "http://your-yapi-domain.com"
      }
    }
  }
}
```

## 使用方法

在您的宿主应用中完成安装和配置后：

1.  重启您的宿主应用（例如，您的 IDE），以确保它加载了新的 MCP 服务器配置。
2.  在 cline 中输入, 如下图所示。
    ![](https://raw.githubusercontent.com/Lstmxx/picx-images-hosting/refs/heads/master/20250730/2741753839066_.pic.2dp06hwaye.webp)
    ![](https://raw.githubusercontent.com/Lstmxx/picx-images-hosting/master/20250730/2721753772994_.pic.7axh0ddm7o.webp)
    ![](https://raw.githubusercontent.com/Lstmxx/picx-images-hosting/master/20250730/2731753773017_.pic.2a5e8t8pio.webp)
3.  宿主应用应会自动触发 `yapi-mcp-server`，后者将获取 API 定义，并利用 LLM 生成并显示相应的 TypeScript 类型。

## 贡献

欢迎各种形式的贡献！无论是提交拉取请求（Pull Request），还是报告错误、提出功能建议或改进意见，都非常欢迎。

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
