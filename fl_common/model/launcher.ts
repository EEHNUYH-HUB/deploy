import { ActionAuth, ActionModel, ActionParam, ColumnMappingModel, IFlowConfiger, MCPToolModel } from "./models.js"
import { exec, spawn } from "child_process";
import path from 'path'
import { FlowCommonPath } from "./util.server.js";
import { BindingMappingValue, ConvertJsonModelToKeyValue, ConvertJsonModelToObj2, ConvertJsonToKeyValueObject, ConvertKeyValueObjectToObject, Guid, TryParseJson } from "./util.common.js";
import fs  from 'fs'
import { GetPromptInputs } from "./util.server.js"
import { LauncherInAndOut } from "./launcher.in.out.js";
import { LauncherFactory } from "./launcher.factory.js";
import { LauncherBase } from "./launcher.base.js";
import { BuilderConfiger } from "./configer.builder.js";


export const RunCommand = async (configer: IFlowConfiger, prjID: string, userID: string, cmd: string, onMessageHandler: Function) => {
    try {

        var absolutePath: string | URL | undefined = undefined;
        if (cmd?.toLowerCase().includes("flowline reset")) {
            await (configer as BuilderConfiger).Reset(userID, prjID, (msg) => {
                onMessageHandler('res_out', "Install", "Install", msg);
            })

            onMessageHandler('res_close', "Install", "Install", 0);
        }
        else {
            //pip 명령인 경우
            if (cmd.startsWith('pip ')) {
                //absolutePath = undefined;
                //kbh: 각 프로젝트 가상환경의 pip 실행경로를 가져온다. 프로젝트 ID값을 가져와야 한다.
                var pipPath = FlowCommonPath.GetPipRunPathByProjectId(prjID);


                cmd = cmd.replace("pip", pipPath ? pipPath : "")


            } else if (cmd.startsWith('npm ')) { //npm 명령인 경우
                //npm 패키지 설치 경로 지정
                absolutePath = FlowCommonPath.GetNodejsDir(prjID);

                

                await FlowCommonPath.WriteNodePackage(prjID,absolutePath);
                


                if (!cmd.includes('--save') && !cmd.includes('-S')) {
                    cmd += " --save";
                }
            }

            else { //지원 안하는 명령어

                if (onMessageHandler)
                    onMessageHandler('res_err', "Install", "Install", "Not supported command");
                return;
            }


            var child = exec(cmd, { cwd: absolutePath });

            child.stdout?.on('data', function (data) {
                if (onMessageHandler)
                    onMessageHandler('res_out', "Install", "Install", data);
            });
            child.stderr?.on('data', function (data) {
                if (onMessageHandler)
                    onMessageHandler('res_err', "Install", "Install", data);
            });
            child.on('close', function (code) {
                if (onMessageHandler)
                    onMessageHandler('res_close', "Install", "Install", code);
            });
        }
    }
    catch (err) {
        if (onMessageHandler) {
            onMessageHandler('res_err', "Install", "Install", JSON.stringify(err));
            onMessageHandler('res_close', "Install", "Install", 0);
        }
    }
}

export const RunChatCoder = async (configer: IFlowConfiger, aiID: string, message: string, prompt: string, auth: ActionAuth
    , onMessageHandler: Function) => {


    try {


        var aiModel = await configer.GetOpenAIModel(aiID,auth.prjID, auth.userID);

        var envs = await configer.GetProjectDefaultEnvs(auth.userID,auth.prjID);

        if (aiModel) {
            var id = aiID;
            var name = aiModel?.Name

            var runPath = FlowCommonPath.GetPythonRunPathByProjectId(aiModel.ProjectID);
            var sourcePath = `${FlowCommonPath.GetRootDir()}/openAIStream.py`;
            var args = [sourcePath];
            var promInput = GetPromptInputs(auth, aiModel, undefined, envs);

            promInput.in_prompt_content = (prompt ? prompt + " " : "") + message;//+"에 대하여 "+ languge +"를 MarkDown형식으로 생성해줘." 

            var id = Guid();

            await LauncherInAndOut.WriteInput(id, JSON.stringify(promInput))

            args.push(id);

            const net = spawn(runPath, args);

            net.stdout.on('data', function (chunk) {
                var str = chunk.toString();

                var msgType = 'res_out';
                var newMsg = str;

                if (str && str.constructor === String) {
                    var flIndex = str?.indexOf('@fl:');

                    if (flIndex > -1) {
                        msgType = 'res_stream';
                        newMsg = str?.toString()?.replaceAll('@fl:', '');
                    }

                }
                onMessageHandler(msgType, id, name, newMsg);


            })
            net.stderr.on('data', function (chunk) {
                //isActionResult = true;
                var str = chunk.toString();

                onMessageHandler('res_err', id, name, str);

            })
            net.on('exit', async function () {

                var result = await LauncherInAndOut.GetOutput(id)


                if (!result) {
                    onMessageHandler('res_close', "Error", "Error", 0);
                }
                else {
                    TryParseJson(result, (ex: any, jsonObj: any) => {

                        if (!ex) {
                            onMessageHandler("res_result", id, name, jsonObj.result);
                        }
                        else {

                            onMessageHandler("res_result", id, name, result);
                        }

                        onMessageHandler('res_close', id, name, 0);
                    })
                }

            })
        }




    }
    catch (err) {
        onMessageHandler('res_err', "Error", "Error", err);
        onMessageHandler('res_close', "Error", "Error", 0);

    }
}

export const RunAction = async (configer: IFlowConfiger, param: ActionParam, auth: ActionAuth
    , onMessageHandler: Function) => {

    try {


        var rauncherInstance = await LauncherFactory.GetInstance(configer, param, auth);



        if (rauncherInstance) {


            // var id = rauncherInstance.Model.ID;
            // var name = rauncherInstance.Model.Name;



            LauncherFactory.Run(rauncherInstance,
                (pid: string, pname: string, pmsgType: string, msg: any) => {

                    if (msg) {
                        var msgType = 'res_out';

                        if (pmsgType === "MESSAGE") {
                            msgType = 'res_out';
                        }
                        if (pmsgType === "INPUT") {
                            msgType = 'res_input';
                        }
                        if (pmsgType === "ERROR") {
                            msgType = 'res_err';
                        }
                        if (pmsgType === "RESULT") {
                            msgType = 'res_sub_result';

                        }
                        var newMsg = msg;

                        if (msg.constructor === String) {
                            var flIndex = msg?.indexOf('@fl:');

                            if (flIndex > -1) {
                                msgType = 'res_stream';

                                newMsg = msg?.toString()?.substring(flIndex, msg.length).replaceAll('@fl:', '');
                            }
                            else {
                                flIndex = msg?.indexOf('@flsts:');
                                if (flIndex === 0) {
                                    msgType = 'res_state';
                                    newMsg = msg?.toString()?.substring(flIndex, msg.length).replaceAll('@flsts:', '');
                                }
                            }
                        }
                        if (msgType === 'res_stream' || msgType === 'res_state')
                            onMessageHandler(msgType, pid, pname, newMsg);
                    }

                }
                , (pid: string, pname: string, err: any) => {

                    onMessageHandler('res_err', pid, pname, err);
                    onMessageHandler('res_close', pid, pname, rauncherInstance?.Log.loggingid);

                }
                , (pid: string, pname: string, input: any) => {
                    onMessageHandler('res_input', pid, pname, input);
                }
                , (pid: string, pname: string, result: any) => {

                    onMessageHandler("res_result", pid, pname, result);
                    onMessageHandler('res_close', pid, pname, rauncherInstance?.Log.loggingid);

                }
            )
        }
        else {
            onMessageHandler('res_err', "Error", "Error", { type: "ERROR", content: "Not found Model", name: "", id: "" });
            onMessageHandler('res_close', "Error", "Error", "");

        }


    }
    catch (err) {
        onMessageHandler('res_err', "Error", "Error", { type: "ERROR", content: err, name: "", id: "" });
        onMessageHandler('res_close', "Error", "Error", "");
    }


}



export const RunActionforAgent = async (configer: IFlowConfiger, projectID: string, tool: MCPToolModel, inputs: any): Promise<any> => {

    return new Promise(async (resolve, reject) => {

        var isEnd = false;
        var error = "";
        if (tool.ActionID && tool.AcionModel && tool.AcionModel.Inputs) {

            var inputValue = ConvertJsonModelToKeyValue(tool.AcionModel.Inputs)

            BindingMappingValue(inputs, inputValue, tool.MappingParam as ColumnMappingModel[])


            var auth: ActionAuth = { userID: "", token: "", prjID: projectID }

            RunAction(configer, { actionid: tool.ActionID, inputs: ConvertKeyValueObjectToObject(inputValue) }
                , auth, (type: string, actionID: string, actionName: string, obj: any) => {

                    if (!isEnd) {
                        if (type === 'res_result') {
                            isEnd = true;
                            resolve(obj)
                        } else if (type === 'res_err') {
                            error += obj;
                        }
                        else if (type === 'res_close') {
                            isEnd = true;
                            resolve({ error: error })
                        }

                    }
                })

        }

    });
}