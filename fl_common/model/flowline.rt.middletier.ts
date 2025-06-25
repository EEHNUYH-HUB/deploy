


import WebSocket from 'ws';

import { AzureKeyCredential } from '@azure/core-auth';

enum ToolResultDirection {
    TO_SERVER = 1,
    TO_CLIENT = 2,
}

class ToolResult {
    text: string | null;
    destination: ToolResultDirection;

    constructor(text: string | null, destination: ToolResultDirection) {
        this.text = text;
        this.destination = destination;
    }

    toText(): string {
        return this.text === null ? "" : (typeof this.text === 'string' ? this.text : JSON.stringify(this.text));
    }
}

class Tool {
    target: (args: any) => Promise<ToolResult>;
    schema: any;

    constructor(target: (args: any) => Promise<ToolResult>, schema: any) {
        this.target = target;
        this.schema = schema;
    }
}

class RTToolCall {
    toolCallId: string;
    previousId: string;

    constructor(toolCallId: string, previousId: string) {
        this.toolCallId = toolCallId;
        this.previousId = previousId;
    }
}

export class RTMiddleTier {
    endpoint: string;
    
    key: string | null;
    tools: { [key: string]: Tool };
    model: string | null;
    systemMessage: string | null;
    temperature: number | null;
    maxTokens: number | null;
    disableAudio: boolean | null;
    _toolsPending: { [key: string]: RTToolCall };
    

    constructor() {
        var apiEndPoint = 'https://aoai-spn-estus2.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=gpt-4o-realtime-preview'
        var apikey = '9f84277eccac458186c0f6a50e508223'
        
        
        this.endpoint = apiEndPoint;
        this.key = null;
        this.tools = {};
        this.model = null;
        this.systemMessage = null;
        this.temperature = null;
        this.maxTokens = null;
        this.disableAudio = null;
        this._toolsPending = {};
       
        this. key = new AzureKeyCredential(apikey).key
       
       
    }

    async _processMessageToClient(msg: string, clientWs: WebSocket, serverWs: WebSocket): Promise<string | null> {
        const message = JSON.parse(msg);
        let updatedMessage: string | null = msg;

        if (message) {
            switch (message.type) {
                case "session.created":
                    const session = message.session;
                    session.instructions = "";
                    session.tools = [];
                    session.tool_choice = "none";
                    session.max_response_output_tokens = null;
                    updatedMessage = JSON.stringify(message);
                    break;

                case "response.output_item.added":
                    if (message.item && message.item.type === "function_call") {
                        updatedMessage = null;
                    }
                    break;

                case "conversation.item.created":
                    if (message.item && message.item.type === "function_call") {
                        const item = message.item;
                        if (!this._toolsPending[item.call_id]) {
                            this._toolsPending[item.call_id] = new RTToolCall(item.call_id, message.previous_item_id);
                        }
                        updatedMessage = null;
                    } else if (message.item && message.item.type === "function_call_output") {
                        updatedMessage = null;
                    }
                    break;

                case "response.output_item.done":
                    if (message.item && message.item.type === "function_call") {
                        const item = message.item;
                        const toolCall = this._toolsPending[item.call_id];
                        const tool = this.tools[item.name];
                        const args = item.arguments;
                        const result = await tool.target(JSON.parse(args));
                        await serverWs.send(JSON.stringify({
                            type: "conversation.item.create",
                            item: {
                                type: "function_call_output",
                                call_id: item.call_id,
                                output: result.toText()
                            }
                        }));
                        if (result.destination === ToolResultDirection.TO_CLIENT) {
                            await clientWs.send(JSON.stringify({
                                type: "extension.middle_tier_tool_response",
                                previous_item_id: toolCall.previousId,
                                tool_name: item.name,
                                tool_result: result.toText()
                            }));
                        }
                        updatedMessage = null;
                    }
                    break;

                case "response.done":
                    if (Object.keys(this._toolsPending).length > 0) {
                        this._toolsPending = {};
                        await serverWs.send(JSON.stringify({ type: "response.create" }));
                    }
                    if (message.response) {
                        const replace = message.response.output.some((output: any, i: number) => {
                            if (output.type === "function_call") {
                                message.response.output.splice(i, 1);
                                return true;
                            }
                            return false;
                        });
                        if (replace) {
                            updatedMessage = JSON.stringify(message);
                        }
                    }
                    break;
            }
        }

        return updatedMessage;
    }

    async _processMessageToServer(msg: string, ws: WebSocket): Promise<string | null> {
        const message = JSON.parse(msg);
        let updatedMessage: string | null = msg;

        if (message) {
            switch (message.type) {
                case "session.update":
                    const session = message.session;
                    if (this.systemMessage) {
                        session.instructions = this.systemMessage;
                    }
                    if (this.temperature) {
                        session.temperature = this.temperature;
                    }
                    if (this.maxTokens) {
                        session.max_response_output_tokens = this.maxTokens;
                    }
                    if (this.disableAudio) {
                        session.disable_audio = this.disableAudio;
                    }
                    session.tool_choice = Object.keys(this.tools).length > 0 ? "auto" : "none";
                    session.tools = Object.values(this.tools).map(tool => tool.schema);
                    updatedMessage = JSON.stringify(message);
                    break;
            }
        }

        return updatedMessage;
    }

    async _forwardMessages(ws: WebSocket): Promise<void> {
        
        
        const targetWs = new WebSocket(this.endpoint,{
            headers: {
                'Authorization': `Bearer ${this.key}` ,
                "OpenAI-Beta": "realtime=v1",
            }});

        targetWs.on('open', () => {
            ws.on('message', async (msg: string) => {
                const newMsg = await this._processMessageToServer(msg, ws);
                if (newMsg) {
                    targetWs.send(newMsg);
                }
            });

            targetWs.on('message', async (msg: string) => {
                const newMsg = await this._processMessageToClient(msg, ws, targetWs);
                if (newMsg) {
                    ws.send(newMsg);
                }
            });
        });

        targetWs.on('error', (error: Error) => {
            console.error("WebSocket error:", error);
        });
    }

    async _websocketHandler(req: any, res: any): Promise<WebSocket> {
        const ws = new WebSocket(req);
        await this._forwardMessages(ws);
        return ws;
    }

    attachToApp(app: any, path: string): void {
        app.get(path,async (req: any, res: any) =>await this._websocketHandler(req, res));
    }
}

