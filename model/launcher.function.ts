import { ActionAuth, ActionModel, EnvModel, IFlowConfiger } from "./models.js"
import { FlowCommonPath } from "./util.server.js";
import { RunJavascriptActionModelInput } from "./util.common.js";
import { LauncherBase} from "./launcher.base.js";
import { ChildProcessWithoutNullStreams } from "child_process";

export class LauncherFunc extends LauncherBase{

    constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: EnvModel[]) {
        super(configer, auth, model, inputValue, envs)
    }

    protected Action = async () => {

        if (this.Model.CodeType === "python") {
            await this.PythonRun( this.Model.ID, JSON.stringify(this.InputValue))
        }
        else if(this.Model.CodeType === "nodejs"){
            await this.NodeJSRun(this.Model.ID, JSON.stringify(this.InputValue))
        }
        else if (this.Model.CodeType === "javascript") {

            var r = RunJavascriptActionModelInput(this.Model.Inputs, this.InputValue, this.Model.Code)
            this.OnResultHandler(r)

        }
    }



   
}