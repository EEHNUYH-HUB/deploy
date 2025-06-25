
import { ActionAuth, ActionModel, ActionParam, EnvModel, IFlowConfiger } from "./models.js"
import { ConvertJsonModelToObj2, ConvertObjectToStringFullKeyValue, SetKeyValueforObj } from "./util.common.js";

import { LauncherRestAPI } from "./launcher.restapi.js";
import { LauncherDatabase } from "./launcher.database.js";
import { LauncherFunc } from "./launcher.function.js";
import { LauncherFlow } from "./launcher.flow.js";

import { LauncherPrompt } from "./launcher.prompt.js";

import { LauncherBase } from "./launcher.base.js";
import { ChildProcessWithoutNullStreams } from "child_process";


export class LauncherFactory {

    static async GetInstance(configer: IFlowConfiger, param: ActionParam, auth: ActionAuth) {

        
        try {
            var actionModel = await configer.GetActionModel(param.actionid,auth.prjID, auth.userID);
            var envs = await configer.GetProjectDefaultEnvs(auth.userID,auth.prjID);
            if (actionModel) {

                var inputObj = ConvertJsonModelToObj2(actionModel.Inputs);

                if (param.inputs) {

                    var keyValue = ConvertObjectToStringFullKeyValue(param.inputs);


                    for (var i in keyValue) {
                        var k = keyValue[i].key;
                        var v = keyValue[i].value;


                        SetKeyValueforObj(k, v, inputObj);

                    }

                }
                return LauncherFactory.GetInstance2(actionModel, configer, auth, envs, inputObj)


            }
        } catch (ex) {
            console.log(ex)
        }
        return undefined;
    }

    static GetInstance2(model: ActionModel
        , configer: IFlowConfiger
        , auth: ActionAuth
        , envs: EnvModel[]
        , inputValue: any
    ) {

        if (model.ModelType === "FUNC") {
            return new LauncherFunc(configer, auth, model, inputValue, envs)
        }
        else if (model.ModelType === "RESTAPI") {
            return new LauncherRestAPI(configer, auth, model, inputValue, envs)
        }
        else if (model.ModelType === "PROC") {
            return new LauncherDatabase(configer, auth, model, inputValue, envs)
        }
        else if (model.ModelType === "PROMPT") {
            return new LauncherPrompt(configer, auth, model, inputValue, envs)
        }
        else if (model.ModelType === "OCST") {
                return new LauncherFlow(configer, auth, model, inputValue, envs)
        }



        return undefined;
    }
    static  Run(launcher: LauncherBase
        , onMessage: (id:string,name:string,msgType:string,value:any)=>void
        , onError: (id:string,name:string,value:any)=>void
        , onInput: (id:string,name:string,value:any)=>void
        , onResult: (id:string,name:string,value:any)=>void
        , sharedProcess?:ChildProcessWithoutNullStreams) {

        launcher.OnInput = onInput
        launcher.OnMessage = onMessage
        launcher.OnResult = onResult
        launcher.OnError = onError

        launcher.Run();
    }

    
    
    

   
      
      
}