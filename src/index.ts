#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import APIClient from './core/APIClient';

const client = new APIClient();

const parseJSON = (jsonString: string): Record<string, any> => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return {};
  }
}

const getAPIDetail = async (docUrl: string) => {
  const docJSONData = await client.getAPIConfig(docUrl);
  return {
    method: docJSONData.method,
    path: docJSONData.path,
    /** 请求参数JSON字符串 */
    req_body_other: docJSONData.req_body_other,
    /** 响应参数JSON字符串 */
    res_body: docJSONData.res_body,
  };
}

const pathToTypeName = (path: string): string => {
  return path
    .split(/[\/\-_]/)
    .filter(Boolean)
    .map(segment => segment.replace(/[{}]/g, ''))
    .map(segment => (segment.charAt(0).toUpperCase() + segment.slice(1)))
    .join('');
}



// Create server instance
const server = new McpServer({
  name: "yapi-mcp-server",
  version: "1.0.0",
});

server.registerTool(
  'generate_ts_from_yapi',
  {
    title: "从YApi生成TypeScript接口",
    description: '当用户提供YApi的URL时调用此工具。此工具会获取API的详细信息，并生成一个用于创建TypeScript接口和枚举的提示。',
    inputSchema: {
      url: z.string().url().describe('YApi接口的URL'),
    },
  },
  async ({ url }) => {
    try {
      const apiDetail = await getAPIDetail(url);

      if (!apiDetail.path) {
        return { content: [
          {
            type: 'text',
            text: "未能从YApi获取API路径。请检查提供的URL是否正确。",
          }
        ]};
      }

      const typeName = pathToTypeName(apiDetail.path);

      const prompt = `
请根据以下YApi接口信息，完成代码生成任务：

**任务要求:**

1.  **生成TypeScript接口:**
    *   解析 \`req_body_other\` (请求体) 的JSON结构，并创建一个名为 \`${typeName}Req\` 的TypeScript接口。
    *   解析 \`res_body\` (响应体) 的JSON结构，并创建一个名为 \`${typeName}Res\` 的TypeScript接口。

2.  **添加字段注释:**
    *   在生成的接口中，为每个字段添加JSDoc注释，注释内容使用JSON中的 \`description\` 字段值。

3.  **生成TypeScript枚举:**
    *   检查每个字段的 \`description\`。如果描述中包含明确的键值对（例如：“状态：0-禁用；1-启用”），请为其创建一个TypeScript枚举。
    *   枚举的命名规则为 \`\${首字母大写的字段名}Enum\` (例如: \`StatusEnum\`)。

---

**接口信息:**

*   **接口路径:** \`${apiDetail.path}\`
*   **请求方法:** \`${apiDetail.method}\`

**请求体 (req_body_other):**
\`\`\`json
${apiDetail.req_body_other || '{}'}
\`\`\`

**响应体 (res_body):**
\`\`\`json
${apiDetail.res_body || '{}'}
\`\`\`
---

请开始生成代码。
`;
      return { content: [
        {
          type: 'text',
          text: prompt,
        }
      ] };
    } catch (error) {
      console.error("Error fetching API details from YApi:", error);
      return { content: [
        {
          type: 'text',
          text: "从YApi获取API详情时出错。请检查URL是否正确以及服务是否可用。",
        }
      ] };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  server.server.onerror = (error) => {
    console.error("Server error:", error);
  };
  // console.log(transport);
  // console.log("YApi MCP server running on stdio");  
}



main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
