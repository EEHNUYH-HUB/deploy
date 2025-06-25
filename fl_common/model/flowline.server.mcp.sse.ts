import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";



import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { ApplicationConfiger } from "./configer.application.js";
import { Express, Router } from "express";

import { z, ZodRawShape } from "zod";
import {  RunActionforAgent } from "./launcher.js";
import {  MCPAgentModel, MCPToolModel } from "./models.js";


export class FlowLineMcpServer {

  private _server: McpServer | undefined
  private _projectID: string
  private _agentID: string
  private _configer: ApplicationConfiger
  private _model: MCPAgentModel | undefined
  Transport : SSEServerTransport
  constructor(req: any,res:any) {
    this._projectID = req.params.projectid
    this._agentID = req.params.agentid
    this._configer = ApplicationConfiger.GetInstance(this._projectID);
    this.Transport = new SSEServerTransport(`/mcp/:${this._projectID}/:${this._agentID}/messages`, res);

  }

  Connect = async () => {
    this._model = await this._configer.GetMcpAgentModel(this._agentID);

    
    if(this._model){
      this._server = new McpServer({
        name: this._model?.Name ? this._model?.Name : "",
        version: this._model?.Version ? this._model?.Version : ""
      }, {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {}
        },

      });

      if (this._server && this._model?.Tools && this._model?.Tools.length > 0) {
        for (var i in this._model?.Tools) {

          var tool = this._model.Tools[i];
          if (tool && tool.AcionModel) {
              this._bindingTool(this._server,tool)
          }
        }

      }

      await this._server.connect(this.Transport);
    }
  }


  _bindingTool = (server: McpServer, tool: MCPToolModel) => {
    var desc = tool.ToolDesc ? tool.ToolDesc : "";
    desc += '\r\n\r\n'
    if (tool.MappingParam && tool.MappingParam.length > 0) {
      for (var j in tool.MappingParam) {
        var param = tool.MappingParam[j];
        if (param && param.ValueColName && param.ValueDesc)
          desc += ` ${param.ValueColName} : ${param.ValueDesc} \r\n`
      }
    }
    server.tool(tool.ToolName ? tool.ToolName : "", desc, this._getParams(tool)
      , async (param) => {

        
        var rtn = "";
        if (tool.AcionModel) {
          var result = await RunActionforAgent(this._configer, this._projectID, tool, param);

          
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
    )
  }

  _getParams = (tool: MCPToolModel) => {

    if (tool && tool.MappingParam && tool.MappingParam.length > 0) {
      var rtn:ZodRawShape = {}
     
      for (var i in tool.MappingParam) {
        var param = tool.MappingParam[i];
        if (param.ValueType === "string") {
          rtn[param.ValueColName] = z.string()
        }
        else if (param.ValueType === "number") {
          rtn[param.ValueColName] = z.number()
        }
        else if (param.ValueType === "boolean") {
          rtn[param.ValueColName] = z.boolean()
        }
        else {
          rtn[param.ValueColName] = z.any()
        }

      }
      return rtn;
    }

    return {}
    
  }
}

export function CreateMCPSSEServer(app: Express) {


  const mapAgents = new Map<string, FlowLineMcpServer>();

  app.get("/mcp/:projectid/:agentid/sse", async (req, res) => {

    const agent = new FlowLineMcpServer(req, res);
    
    mapAgents.set(agent.Transport.sessionId, agent);
    await agent.Connect();
  });

  app.post("/mcp/:projectid/:agentid/messages", (req, res) => {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      console.error('Message received without sessionId');
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    const agent = mapAgents.get(sessionId);

    if (agent) {
      agent.Transport.handlePostMessage(req, res);
    }
  });

  app.post("/mcp/:projectid/apply",async (req, res) => {
    try {
    var projectID = req.params.projectid
    if(projectID){
      var configer = ApplicationConfiger.GetInstance(projectID);
      if(configer){
        await configer.Clear();
      }
    }

    
    res.send({ status: 'success', error: "" })
     }
    catch (ex) {
        res.send({ status: 'error', info: null, error: ex })
    }
  });

  return app;
}