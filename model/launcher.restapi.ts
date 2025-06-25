import axios from 'axios';
import { LauncherBase } from "./launcher.base";
import { IFlowConfiger, ActionModel, ActionAuth, EnvModel } from "./models.js";

export class LauncherRestAPI extends LauncherBase{
    
    constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: EnvModel[]) {
        super(configer,auth,model,inputValue,envs)
    }
    protected Action = async() => {
        
        var url = this.Model.Url;
        if (this.Model.SubUrl) {
            url += this.Model.SubUrl;
        }

        if (url && this.InputValue && this.InputValue.Input) {
            var property = Object.getOwnPropertyNames(this.InputValue.Input);
            for (var i in property) {
                var pName = property[i];
                var str = `{${pName}}`;
                var findIndex = url.indexOf(str);
                if (findIndex > 0) {
                    url = url.replaceAll(str, this.InputValue.Input[pName]);
                    delete this.InputValue.Input[pName]
                }
            }
        }


        var method = this.Model.Method;

        var config = { params: this.InputValue.Input,   headers: this.InputValue.Header };
        var body = this.InputValue.Body;
        if (method === "GET") {
            axios.get(url ? url : "", config).then(response => {
    
                this.OnResultHandler(response.data);
            }).catch(ex => {
                
                this.OnErrorHandler(ex?.toString())
                
            });
        }
        else if (method === "DELETE") {
            axios.delete(url ? url : "", config).then(response => {
                this.OnResultHandler(response.data);
            }).catch(ex => {
                
                this.OnErrorHandler(ex?.toString())
                
            });
        }
        else if (method === "POST") {
            axios.post(url ? url : "", body, config).then(response => {
                this.OnResultHandler(response.data);
            }).catch(ex => {
                
                this.OnErrorHandler( ex?.toString())
                
            });
        }
        else if(method === "PATCH"){
            axios.patch(url ? url : "", body, config).then(response => {
                this.OnResultHandler(response.data);
            }).catch(ex => {
                
                this.OnErrorHandler( ex?.toString())
                
            });
        }
    
    }
}
