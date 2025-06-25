
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  Notification,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  LoggingMessageNotification,
  ToolListChangedNotification,
  JSONRPCNotification,
  JSONRPCError,Tool,
  InitializeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import { Request, Response } from "express";

import { ApplicationConfiger } from "./configer.application.js";
import { Dictionary, MCPAgentModel, MCPToolModel } from "./models.js";
import { RunActionforAgent } from "./launcher.js";

const SESSION_ID_HEADER_NAME = "mcp-session-id";
const JSON_RPC = "2.0";


export class MCPServer {
  private _server?: Server;
  private _projectID: string
  private _agentID: string
  private _configer: ApplicationConfiger
  private _model: MCPAgentModel | undefined
  private _tools:Tool[]=[]
  transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  
  constructor(projectID: string, actionID: string) {
    this._projectID = projectID;
    this._agentID = actionID;
    this._configer = ApplicationConfiger.GetInstance(this._projectID);
  }
  async init() {
    this._model = await this._configer.GetMcpAgentModel(this._agentID);

    this._server = new Server({
      name: this._model?.Name ? this._model?.Name : "",
      version: this._model?.Version ? this._model?.Version : ""
    }, {
      capabilities: {
        tools: {},
        logging: {},
      },
    })

    if (this._server && this._model?.Tools && this._model?.Tools.length > 0) {
      for (var i in this._model?.Tools) {

        var toolModel = this._model.Tools[i];
        if (toolModel && toolModel.AcionModel) {
          this._tools.push(this._getTool(toolModel))
        }
      }

    }


    this._server?.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this._tools
      };

    });


    this._server?.setRequestHandler(
      CallToolRequestSchema,
      async (request, extra) => {
        const args = request.params.arguments;
        const toolName = request.params.name;
        console.log("Received request for tool with argument:", toolName, args);

        if (!args) {
          throw new Error("arguments undefined");
        }

        if (!toolName) {
          throw new Error("tool name undefined");
        }

        var toolModel = this._model?.Tools?.find(x => x.ToolName === toolName)
        if (toolModel) {

          if (toolModel.AcionModel) {

            var result = await RunActionforAgent(this._configer, this._projectID, toolModel, args);

            var rtn;
            if (result && (result.constructor === Object || result.constructor === Array)) {
              rtn = JSON.stringify(result)
            }
            else {
              rtn = result?.toString()
            }
          }
          return {
            content:
              [{
                type: "text",
                text: rtn
              }
              ]

          }
        }


        throw new Error("Tool not found");
      }
    );

  }

  private _getTool (toolModel:MCPToolModel){

  
    const tool: Tool = {
      name: toolModel.ToolName ? toolModel.ToolName : "",
      description: toolModel.ToolDesc,
      inputSchema: {
        type: "object",
        properties: {
        },
        required: [],
      },
    };
    if (toolModel.MappingParam && toolModel.MappingParam.length > 0) {
      for (var j in toolModel.MappingParam) {
        var param = toolModel.MappingParam[j];

        if (param && param.InputColName && tool.inputSchema.properties && tool.inputSchema.required) {
          var vType = param.ValueType;
          if (param.ValueType !== "string" && param.ValueType !== "number" && param.ValueType !== "boolean") {
            vType = "any"
          }
          tool.inputSchema.properties[param.InputColName] = { type: vType, description: param.ValueDesc ? param.ValueDesc : "" };
          tool.inputSchema.required.push(param.InputColName)
        }
      }
    }


    return tool;
  }

  async handleGetRequest(req: Request, res: Response) {
    // if server does not offer an SSE stream at this endpoint.
    // res.status(405).set('Allow', 'POST').send('Method Not Allowed')
console.log("handleGetRequest")
    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;
    if (!sessionId || !this.transports[sessionId]) {
      res
        .status(400)
        .json(
          this.createErrorResponse("Bad Request: invalid session ID or method.")
        );
      return;
    }

    console.log(`Establishing SSE stream for session ${sessionId}`);
    const transport = this.transports[sessionId];
    await transport.handleRequest(req, res);
    await this.streamMessages(transport);

    return;
  }

  async handlePostRequest(req: Request, res: Response) {

    console.log("HandelPost")
    const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    try {
      // reuse existing transport
      if (sessionId && this.transports[sessionId]) {
        transport = this.transports[sessionId];
        await transport.handleRequest(req, res, req.body);
        return;
      }

      // create new transport
      if (!sessionId && this.isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
        });

        await this._server?.connect(transport);
        await transport.handleRequest(req, res, req.body);

        // session ID will only be available (if in not Stateless-Mode)
        // after handling the first request
        const sessionId = transport.sessionId;
        if (sessionId) {
          this.transports[sessionId] = transport;
        }

        return;
      }

      res
        .status(400)
        .json(
          this.createErrorResponse("Bad Request: invalid session ID or method.")
        );
      return;
    } catch (error) {
      console.error("Error handling MCP request:", error);
      res.status(500).json(this.createErrorResponse("Internal server error."));
      return;
    }
  }


  async cleanup() {
    await this._server?.close();
  }

 

  // send message streaming message every second
  private async streamMessages(transport: StreamableHTTPServerTransport) {
    try {
      // based on LoggingMessageNotificationSchema to trigger setNotificationHandler on client
      const message: LoggingMessageNotification = {
        method: "notifications/message",
        params: { level: "info", data: "SSE Connection established" },
      };

      this.sendNotification(transport, message);

      let messageCount = 0;

      const interval = setInterval(async () => {
        messageCount++;

        const data = `Message ${messageCount} at ${new Date().toISOString()}`;

        const message: LoggingMessageNotification = {
          method: "notifications/message",
          params: { level: "info", data: data },
        };

        try {
          this.sendNotification(transport, message);

          if (messageCount === 2) {
            clearInterval(interval);

            const message: LoggingMessageNotification = {
              method: "notifications/message",
              params: { level: "info", data: "Streaming complete!" },
            };

            this.sendNotification(transport, message);
          }
        } catch (error) {
          console.error("Error sending message:", error);
          clearInterval(interval);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  private async sendNotification(
    transport: StreamableHTTPServerTransport,
    notification: Notification
  ) {
    const rpcNotificaiton: JSONRPCNotification = {
      ...notification,
      jsonrpc: JSON_RPC,
    };
    await transport.send(rpcNotificaiton);
  }

  private createErrorResponse(message: string): JSONRPCError {
    return {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: message,
      },
      id: randomUUID(),
    };
  }

  private isInitializeRequest(body: any): boolean {
    const isInitial = (data: any) => {
      const result = InitializeRequestSchema.safeParse(data);
      return result.success;
    };
    if (Array.isArray(body)) {
      return body.some((request) => isInitial(request));
    }
    return isInitial(body);
  }
}


async function CreateInstance(projectID: string, actionID: string) {
  var instance = new MCPServer(projectID, actionID)
  await instance.init();
  return instance;
}

const mcpServerFactory: Dictionary<MCPServer> = {}

export async function GetInstance(projectID: string, actionID: string) {
  var instance = mcpServerFactory[projectID + actionID];
  if (!instance) {
    instance = await CreateInstance(projectID, actionID)
    mcpServerFactory[projectID + actionID]  = instance;
  }
  
    return instance
  
}

export async function Cleanup() {
  var ps = Object.getOwnPropertyNames(mcpServerFactory)
  if (ps && ps.length > 0) {
    for (var i in ps) {
      var name = ps[i]
      var instance = mcpServerFactory[name]
      if (instance) {
        await instance.cleanup();
      }
    }
  }

}