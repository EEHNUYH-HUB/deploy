import {  ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ActionAuth, ActionModel, EnvModel, IFlowConfiger, LauncherLog } from "./models.js"
import { Guid, PromiseParseJson } from "./util.common.js";
import { BindingGlobalValueInputValue, FlowCommonPath } from "./util.server.js"

import { LauncherInAndOut } from "./launcher.in.out.js";



export class LauncherBase {
    Configer:IFlowConfiger
    Auth:ActionAuth
    Model:ActionModel
    Envs: EnvModel[]
    InputValue: any
    Log:LauncherLog
    OnError?:(id:string,name:string,value:any)=>void
    OnMessage?:(id:string,name:string,msgType:string,value:any)=>void
    OnResult?:(id:string,name:string,value:any)=>void
    OnInput?:(id:string,name:string,value:any)=>void
    PythonLauncher?:ChildProcessWithoutNullStreams;
    NodeJSLauncher?:ChildProcessWithoutNullStreams;
    OwnerPythonLauncer?:boolean;
    OwnerNodeJSLauncer?:boolean;
    ParamID?:string;
    StartDate?:Date
    
    static EndCompCode = "COMP-3e80024b-baca-4903-ac87-f0cb9284bb1e"
    protected constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: EnvModel[]) {
        this.Configer = configer;
        this.Auth = auth;
        this.Model = model;
        this.InputValue = inputValue;
        this.Envs = envs;
        
        this.Log= new LauncherLog(this.Model.ID,this.Model.Name);

    }

    async Run(){
        
        this.StartDate = new Date()
        try {
            this.OnInputHandler();
            await this.Action();
        } catch (error) { 
            if (error instanceof Error) {
                this.OnErrorHandler(error.message);
            } else if (typeof error === 'string') {
                this.OnErrorHandler(error);
            } else {
                this.OnErrorHandler('An unknown error occurred');
            }
            
        }
    }

    private OnInputHandler() {
        BindingGlobalValueInputValue(this.Auth, this.InputValue, this.Envs)

        var names = Object.getOwnPropertyNames(this.InputValue)
        if (names && names.length > 0) {
            if(this.IsNotEmpty(this.InputValue))
                this.Log.inputlog = this.InputValue
            if (this.OnInput && this.InputValue) {

                this.OnInput(this.Model.ID, this.Model.Name, this.InputValue)
            }
        }
    }

    IsNotEmpty(item:any){
        if (item && (item.constructor === Object || item.constructor === Array)) {
            item = JSON.stringify(item)
            if (item === "{}" || item === "[]") {
                return false
            }
        }
        return true;
    }

      
    protected OnMessageHandler(msg: any) {
        if(this.IsNotEmpty(msg)){
            if(msg.constructor=== String){
                var strs = msg.split('\n');
                this.Log.msglog.push(...strs); 
            }
            else
                this.Log.msglog.push(msg)
        }
        if (this.OnMessage) {
            this.OnMessage(this.Model.ID,this.Model.Name,"MESSAGE",msg)
        }
    }
    protected async OnResultHandler(data: any) {
        if(this.IsNotEmpty(data))
            this.Log.resultlog = data

        await this.WriteLog(this.Log)
        
        if (this.OnResult) {
            this.OnResult(this.Model.ID,this.Model.Name,data);
        }
    }
    protected async OnErrorHandler(errStr: any) {
        

        if(this.IsNotEmpty(errStr)){
            if(errStr.constructor=== String){
                var strs = errStr.split('\n');
                this.Log.errlog.push(...strs); 
            }
            else
                this.Log.errlog.push(errStr)
        }
        await this.WriteLog(this.Log)
        
        
        if (this.OnError) {
            this.OnError(this.Model.ID,this.Model.Name,errStr);
        }
    }
    protected async Action(){
        console.log("Base Instance는 로직이 없습니다.")
    }
    protected async WriteLog(_log:LauncherLog){
        await this.Configer.WriteLog(_log,this.Configer.GetEndPointID(),this.Model.ProjectID,this.StartDate?this.StartDate:new Date(),new Date())
    }
    protected async ProcessRun(processPath:string,functionPath:string,strParams:string){


        var _self = this;
        var args = [functionPath];
        var paramID = Guid();
        args.push(paramID)

        await LauncherInAndOut.WriteInput(paramID, strParams)

        const net = spawn(processPath, args);

        net.stdout.on('data', function (chunk) {
            var str = chunk.toString();

            _self.OnMessageHandler(str);
        })
        net.stderr.on('data', function (chunk) {
            var str = chunk.toString();
            _self.OnErrorHandler(str);
        })
        net.on('exit', async function () {
            var result = await LauncherInAndOut.GetOutput(paramID)

            if (!result) {
                _self.OnResultHandler("");
                
            }
            else {
                var rtnObj: any = result;
                try {
                    rtnObj = await PromiseParseJson(result)
                    rtnObj = rtnObj?.result;
                    if (rtnObj && rtnObj.constructor !== Object && rtnObj.constructor !== Array)
                        rtnObj = await PromiseParseJson(rtnObj)
                }
                catch (ex) {
                    _self.OnMessageHandler(ex)
                }

                _self.OnResultHandler(rtnObj)
            }
            
        })
    }

    
    private UnBindingLauncherEvent(prc:ChildProcessWithoutNullStreams){
        prc.stdout.on('data', async function (chunk) {
            
        })
        prc.stderr.on('data', function (chunk) {
            
        })
        prc.on('exit', async function () {

        })
    }
    private BindingLauncherEvent (prc:ChildProcessWithoutNullStreams){
        let _self = this;
        let isComp = false;
        prc.stdout.removeAllListeners('data');
        prc.stderr.removeAllListeners('data');
        prc.removeAllListeners('exit');

        prc.stdout.on('data', async function (chunk) {
            let str = chunk.toString();

            if (str?.includes(LauncherBase.EndCompCode)) {
                isComp = true;
                let newMsg = str.replaceAll(LauncherBase.EndCompCode, "");
                if (newMsg) {
                    _self.OnMessageHandler(newMsg);
                }
                if (_self.ParamID) {
                    let result = await LauncherInAndOut.GetOutput(_self.ParamID)
                    
                    _self.ParamID = undefined;
                    if (result) {
                        
                        let rtnObj: any = result;
                        try {
                            rtnObj = await PromiseParseJson(result)
                            if(rtnObj?.error){
                                
                                _self.OnErrorHandler(rtnObj.error)
                            }
                            else {
                                rtnObj = rtnObj?.result;
                                
                                if (rtnObj && rtnObj.constructor !== Object && rtnObj.constructor !== Array)
                                    rtnObj = await PromiseParseJson(rtnObj)
                                
                                
                                
                                _self.OnResultHandler(rtnObj)
                            }
                        }
                        catch (ex) {
                            _self.OnMessageHandler(ex)
                            
                            _self.OnResultHandler(rtnObj)
                        }

                        
                    }
                    else{
                        
                        _self.OnErrorHandler("Unexpected error");

                    }
                }
            }
            else {
                _self.OnMessageHandler(str);
            }

        })
        prc.stderr.on('data', function (chunk) {
            let str = chunk.toString();
            
            _self.OnMessageHandler(str);
        })
        prc.on('exit', async function () {
            
            if (!isComp) {
                _self.OnErrorHandler("Unexpected error");
            }
            isComp = false;
            _self.PythonLauncher = undefined;
        })
    }

    protected StartPythonLauncher  (){

        if (!this.PythonLauncher) {
            
            var pathObj = FlowCommonPath.GetRunPath(this.Model.ProjectID, "launcher", "python")
            var processPath = pathObj.RunPath ? pathObj.RunPath : "";
            var functionPath = pathObj?.SourcePath ? pathObj?.SourcePath : "";

            var args = [functionPath];
            

            this.OwnerPythonLauncer = true;
            this.PythonLauncher = spawn(processPath, args);

            
        }
    }
    protected StartNodeJSLauncher  (){

        if (!this.NodeJSLauncher) {
            
            var pathObj = FlowCommonPath.GetRunPath(this.Model.ProjectID, "launcher", "nodejs")
            var processPath = pathObj.RunPath ? pathObj.RunPath : "";
            var functionPath = pathObj?.SourcePath ? pathObj?.SourcePath : "";

            var args = [functionPath];
            
            this.OwnerNodeJSLauncer = true;
            this.NodeJSLauncher = spawn(processPath, args);

            
        }
    }
    protected async PythonRun  (actionID:string,strParams:string){

        this.ParamID = Guid();

        await LauncherInAndOut.WriteInput(this.ParamID, strParams)

        this.StartPythonLauncher();
        
        if (this.PythonLauncher) {
            this.BindingLauncherEvent(this.PythonLauncher)
            this.PythonLauncher.stdin.write(`${actionID} ${this.ParamID}\n`);
            this.EndPythonLauncher();
        }
    }
    protected async NodeJSRun  (actionID:string,strParams:string){

        this.ParamID = Guid();

        await LauncherInAndOut.WriteInput(this.ParamID, strParams)

        this.StartNodeJSLauncher();

        if (this.NodeJSLauncher) {
            this.BindingLauncherEvent(this.NodeJSLauncher)
            this.NodeJSLauncher.stdin.write(`${actionID} ${this.ParamID}\n`);
            this.EndNodeJSLauncher();
        }
    }

    protected async EndPythonLauncher (isUnbindingEvent:boolean = false){
        if (this.OwnerPythonLauncer && this.PythonLauncher) {
            if (isUnbindingEvent)
                this.UnBindingLauncherEvent(this.PythonLauncher)
            
            this.PythonLauncher.stdin.write(`exit\n`);
        }
    }
    protected async EndNodeJSLauncher (isUnbindingEvent:boolean = false){
        if (this.OwnerNodeJSLauncer &&  this.NodeJSLauncher) {
            if (isUnbindingEvent)
                this.UnBindingLauncherEvent(this.NodeJSLauncher)
            
            this.NodeJSLauncher.stdin.write(`exit\n`);
        }
    }
}

