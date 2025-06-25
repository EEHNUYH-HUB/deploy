import { ActionAuth, ActionModel, DBResult, IFlowConfiger } from "./models.js"
import { ConvertJsonToKeyValueObject } from "./util.common.js";
import { LauncherBase } from "./launcher.base.js";

export class LauncherDatabase extends LauncherBase{

    constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: any[]) {
        super(configer,auth,model,inputValue,envs)
    }
 
   protected Action = async() => {
    var client = await this.Configer.GetDBClient(this.Model.DataBaseID ? this.Model.DataBaseID : "", this.Envs, this.Auth.prjID,this.Auth.userID);
    var query ;
    if (client) {
        var result;
        var resultType = this.Model?.Method ? this.Model.Method : "Datatable";

        
        if (this.Model.CodeType === "QUERY") {

            query = this.Model.Code;
            
            if (this.InputValue && query) {
                var ps = Object.getOwnPropertyNames(this.InputValue);

                if (ps && ps.length > 0) {
                    var psSort = ps.sort((a, b) => {
                        if (a?.length > b?.length) {
                            return -1;
                        }
                        else if (b?.length > a?.length) {
                            return 1;
                        }
                        else {
                            return 0
                        }
                    })
                    if (psSort && psSort.length > 0) {
                        var queryLen = query?.length;
                        var notReplaceParam = queryLen < 50;
                        for (var i in psSort) {
                            var pName: string = psSort[i];
                            if (pName) {
                                var value = this.InputValue[pName];

                                
                                if (value && value.constructor === String) {
                                    if (!notReplaceParam) {
                                        value = value?.toString()?.replace('undefined','').replace(/'/g, "''");
                                    }

                                } else if (value && value.constructor === Object) {
                                    if(value?.toString()=== '[object Object]'){
                                        value='NULL'
                                    }
                                }
                                else if(!value){
                                    value = 'NULL'
                                }
                                if(value === 'NULL'){
                                    query = query?.replaceAll(`'@${pName}'`, value);    
                                    query = query?.replaceAll(`@${pName}`, value);    
                                }
                                else{
                                    query = query?.replaceAll(`@${pName}`, value);
                                }
                                

                                
                            }

                            
                        }
                    }
                }
            }

            
            var resp = await client.Query(query ? query : "",resultType);
            result = resp.result;
         
        }
        else {

            var resp:DBResult;
            if(resultType === "Datatable"){
                resp = await client.Datatable(this.Model.Code ? this.Model.Code : "", this.InputValue);
                result = resp.result;
            }
            else if(resultType === "FirstRow"){
                resp = await client.Datatable(this.Model.Code ? this.Model.Code : "", this.InputValue);
                
                if(resp.result.length > 0)
                result = resp.result[0];

            }
            else if(resultType === "StartColumnValue"){
                resp = await client.Scalar(this.Model.Code ? this.Model.Code : "", this.InputValue);
                result = resp.result;
            }else if(resultType === "Execute"){
                resp = await client.Execute(this.Model.Code ? this.Model.Code : "", this.InputValue);
                result = resp.result;
            }
            
            
            
        }

       

        this.OnResultHandler(result);
    }
    else {
        this.OnErrorHandler("Not found DB Info")
        
    }
   }
}