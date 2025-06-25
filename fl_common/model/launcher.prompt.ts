import { ActionAuth, ActionModel, EnvModel, IFlowConfiger } from "./models.js"

import { FlowCommonPath, GetPromptInputs } from "./util.server.js";

import { LauncherBase } from "./launcher.base.js";

export class LauncherPrompt extends LauncherBase{

    constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: EnvModel[]) {
        super(configer,auth,model,inputValue,envs)
    }
 
    protected Action = async () => {
        
        var processPath = FlowCommonPath.GetPythonRunPathByProjectId(this.Model.ProjectID);
        var functionPath = `${FlowCommonPath.GetRootDir()}/openAIInvoke.py`;
        if (this.Model.SupportOpenAIStream) {
            functionPath = `${FlowCommonPath.GetRootDir()}/openAIStream.py`;
        }
      

        var strParams =(JSON.stringify(GetPromptInputs(this.Auth, this.Model, this.InputValue, this.Envs)));

        await this.ProcessRun(processPath, functionPath,strParams)
        
   }
}