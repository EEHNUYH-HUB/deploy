import { LauncherFactory } from "./launcher.factory.js";
import { LauncherBase } from "./launcher.base.js";

import { OrchestrationModel,  JoinMap, KeyValue, MapValue,  FlowRunEntity, Map, FunctionMap, Conditional, IFlowConfiger, ActionModel, Dictionary, ActionAuth, EnvModel, LauncherLog } from "./models.js";
import { BindingValueUsedByServer, StringKeyToValue, ConvertJsonModelToObj,ConvertJsonModelToObj2, SetKeyValueforObj, TryParseJson, ConvertObjectToStringFullKeyValue, RunConditional, GetStartFlowLineRunEntity, ValidNextItems, ValidConditional } from "./util.common.js";


export class LauncherFlow extends LauncherBase {
    
    
    OrchModel:OrchestrationModel;
    StartRunEntity:FlowRunEntity|undefined;
    RetunValue:Dictionary<any>;
    TempResult:any|undefined;
    ResultMapIDs:string[];
    ConvertArrayRetrunIDs:string[];
    LoopCnt:Dictionary<number>;
    Error?:{ActionName:string,Error:string}


    constructor(configer: IFlowConfiger, auth: ActionAuth, model: ActionModel, inputValue: any, envs: EnvModel[]) {
        super(configer, auth, model, inputValue, envs)

        this.OrchModel = model as OrchestrationModel;

        this.RetunValue = {};
        this.TempResult = {}
        this.ResultMapIDs = [];
        this.ConvertArrayRetrunIDs = [];
        this.Error =undefined

        this.LoopCnt = {};


    }
    async BindingIncludeActionModels() {

        var models =await this.Configer.GetActionModelsIncludeFlow(this.Model.ID,this.Auth.prjID,this.Auth.userID);

        
        if (this.OrchModel.MapValue?.FunctionMaps) {

             this.LoadResultMapIDs()
             
             if (this.OrchModel && this.OrchModel.MapValue) {
                 this.StartRunEntity = GetStartFlowLineRunEntity(this.OrchModel.MapValue, models)
             }
        }
    }
    
    LoadResultMapIDs() {
        this.ResultMapIDs = []
        if (this.OrchModel.MapValue?.JoinMaps && this.OrchModel.MapValue?.FunctionMaps) {
            var endObj = this.OrchModel.MapValue?.FunctionMaps?.find(x =>  (x as FunctionMap).ActionType === "End")
            if (endObj && endObj.PK_ID) {
                for (var i in this.OrchModel.MapValue?.JoinMaps) {
                    var join = this.OrchModel.MapValue?.JoinMaps[i];
                    if (join.FK_END_MAP_ID === endObj.PK_ID) {
                        this.ResultMapIDs.push(join.FK_START_MAP_ID);
                    }
                }
            }
        }
    }
    async Action() {
        await this.BindingIncludeActionModels();
        if(this.StartRunEntity && this.StartRunEntity.Items)
        {
            this._runActionModels(this.Log,this.StartRunEntity.Items,(erroMsg?:string)=>{
                
                this.TempResult = undefined
                this.ConvertArrayRetrunIDs = []
                this.ResultMapIDs = []
                
                if(this.Error && this.Error.Error){
                    
                    this.OnErrorHandler(`${this.Error.ActionName}:${this.Error.Error}`)
                }
                else
                    this.OnResultHandler(this.RetunValue);
        
                this.EndPythonLauncher(true)
                this.EndNodeJSLauncher(true)
            });
        }
    }
    _asyncFor(items:any[],onAction:Function,onCompleted:Function){
        var index = 0;

        var totalCnt = 0;
        if (items && items.length > 0)
            totalCnt = items.length;

        nextRun();

        function nextRun() {
            if (index < totalCnt) {
                onAction(items[index], () => {
                    index = index + 1;
                    nextRun();
                })
            }
            else {
                onCompleted();
            }
        }

    }
    _runActionModels(beforeLog:LauncherLog|undefined,ents:FlowRunEntity[],onCompleted:Function){
        
        ents = ValidNextItems(ents,this.TempResult)
        this._asyncFor(ents, (ent:FlowRunEntity, onNextAction:Function) => {
            this._runActionModel(beforeLog,ent,onNextAction);
        }, onCompleted)
    }
    _runActionModel(beforeLog:LauncherLog|undefined,ent:FlowRunEntity, onCompleted:Function) {

        try {
            
            
            if (ent.Map?.ActionType === "Code" && ent.Map.CodeType !== 'javascript') {
                if (ent.Map.CodeType === 'for') {

                    var newValue = StringKeyToValue(ent.Map.OutputSelectColumn ? ent.Map.OutputSelectColumn : "", this.TempResult);
                    
                    var forLog = new LauncherLog(undefined,ent.Map.COL_NAME);
                    forLog.parentloggingid = beforeLog?beforeLog.loggingid:"00000000-0000-0000-0000-000000000000"
                    
                    if (newValue?.constructor === Array) {
                        
                        this._asyncFor(newValue, (item: any, onNextAction: Function) => {
                            this._bindingResult(ent, undefined, item);
                            this._runActionModels(forLog,ent.Items, onNextAction);
                        }, onCompleted)
                    }
                    else {

                        forLog.errlog.push("Loop문의 결과값이 배열형태가 아닙니다.")
                        
                        this._sendMessage("Loop","Loop", "ERROR", "Loop문의 결과값이 배열형태가 아닙니다.");
                        this.Error = {ActionName:"Loop",Error:"Loop문의 결과값이 배열형태가 아닙니다."}
                        onCompleted();
                    }
                    this.WriteLog(forLog)

                }
                else if (ent.Map.CodeType === 'if') {

                    if (ent.Map.ConditionalSetting) {
                        
                        var ifLog = new LauncherLog(undefined,ent.Map.COL_NAME);
                        ifLog.parentloggingid = beforeLog?beforeLog.loggingid:"00000000-0000-0000-0000-000000000000"
                        this._asyncFor(ent.Map.ConditionalSetting, (condition:Conditional, onNextAction:Function) => {
                            
                            if(ValidConditional(condition,this.TempResult,(functionStr:string,r:boolean)=>{
                                    this._sendMessage(condition.MapID?condition.MapID:"CONDITIONAL",condition.MapName?condition.MapName:"CONDITIONAL","MESSAGE",{code:functionStr,result:r})
                                    
                                })) {
                                var nextObj = ent.Items?.find(x => x.Map?.PK_ID === condition.MapID)
                                if (nextObj){  
                                    this._runActionModel(ifLog,nextObj, onNextAction);
                                }
                            }
                            else {
                                onNextAction();
                            }
                        }, onCompleted)
                        this.WriteLog(ifLog)
                    }
                    else {
                        onCompleted();
                    }
                }
                else if (ent.Map.CodeType === 'jsonParser') {
                    var newValue = StringKeyToValue(ent.Map.OutputSelectColumn?ent.Map.OutputSelectColumn:"", this.TempResult);

                    var jsonParserLog = new LauncherLog(undefined,ent.Map.COL_NAME);
                    jsonParserLog.parentloggingid = beforeLog?beforeLog.loggingid:"00000000-0000-0000-0000-000000000000"
                    jsonParserLog.inputlog = newValue;
                    TryParseJson(newValue, (err:any, jsonValue:any) => {

                        if (err) {
                            jsonParserLog.errlog.push(err?.toString())
                            this._sendMessage("JsonParser","JsonParser","ERROR",err?.toString());
                            this.Error = {ActionName:"JsonParser",Error:err?.toString()}

                            onCompleted();
                        }
                        else {
                            jsonParserLog.resultlog.push(jsonValue)
                            this._sendMessage("JsonParser","JsonParser","RESULT",jsonValue);
                            this._bindingResult(ent, inputValue,jsonValue);
                            this._runActionModels(jsonParserLog,ent.Items, onCompleted);
                        }

                        this.WriteLog(jsonParserLog)
                    });


                }
                else {
                    onCompleted();
                }
            }
            else if (ent.Map?.ActionType === "End") {
                onCompleted();
            }
            else {
                if (ent.ActionModel ) {

                    if(this.LoopCnt[ent.ID] ){
                        this.LoopCnt[ent.ID]  +=1;
                    }
                    else{
                        this.LoopCnt[ent.ID]  = 1;
                    }

                    
                    if (this.LoopCnt[ent.ID] <= this._getLoopLimit(ent.ID)) {


                        var inputValue = this._getInputValues(ent)
                        var rauncherInstance = LauncherFactory.GetInstance2(ent.ActionModel, this.Configer, this.Auth, this.Envs, inputValue)
                        if (rauncherInstance) {


                            if (ent.Map?.ActionType === "Code" && rauncherInstance?.Log) {
                                rauncherInstance.Log.actionid = undefined;
                                ent.ActionModel.ProjectID = this.Model.ProjectID
                            }

                            
                            if(ent.Map.ActionType === "Component" && ent.Map.CodeType === "python"){
                                this.StartPythonLauncher();
                                rauncherInstance.PythonLauncher = this.PythonLauncher;
                            }
                            else if(ent.Map.ActionType === "Component" && ent.Map.CodeType === "nodejs"){
                                this.StartNodeJSLauncher();
                                rauncherInstance.NodeJSLauncher = this.NodeJSLauncher;
                            }
                            else{
                                rauncherInstance.PythonLauncher = this.PythonLauncher;
                                rauncherInstance.NodeJSLauncher = this.NodeJSLauncher;
                            }

                            rauncherInstance.Log.parentloggingid = beforeLog?beforeLog.loggingid:"00000000-0000-0000-0000-000000000000"
                            
                            
                            LauncherFactory.Run(rauncherInstance
                                , (pid: string, pname: string, msgType: string, msg: any) => {
                                    this._sendMessage(pid, pname, msgType, msg);
                                }
                                , (pid: string, pname: string, err: any) => {
                                    this._sendMessage(pid, pname, "ERROR", err?.toString());
                                    this.Error = {ActionName:pname,Error:err?.toString()}
                                    onCompleted();

                                }
                                , (pid: string, pname: string, input: any) => {

                                    this._sendMessage(pid, pname, "INPUT", input);
                                }
                                , (pid: string, pname: string, result: any) => {

                                    this._sendMessage(pid, pname, "RESULT", result);
                                    this._bindingResult(ent, inputValue, result);
                                    
                                    this._runActionModels(rauncherInstance?.Log,ent.Items, onCompleted);
                                }

                            )
                        }
                    } else {
                        this._sendMessage(this.Model.ID, this.Model.Name, "ERROR", "Loop:Maximum call stack size exceeded");
                        this.Error = {ActionName:this.Model.Name,Error:"Loop:Maximum call stack size exceeded"}
                        onCompleted();
                    }
                }
                else {
                    this._runActionModels(beforeLog,ent.Items, onCompleted);
                }
            }
        } catch (error) {


            var emsg;
            if (error instanceof Error) {
                emsg = error.message;
            } else {
                emsg = error;
            }



            this._sendMessage(ent.ActionModel?ent.ActionModel.ID:this.Model.ID
                ,ent.ActionModel?ent.ActionModel.Name:this.Model.Name, "ERROR", emsg)


                this.Error = {ActionName:ent.ActionModel?ent.ActionModel.Name:this.Model.Name,Error:emsg?emsg.toString():""}
            onCompleted();
        }
    }
    _bindingResult(ent:FlowRunEntity, inputValue:any, result:any) {

        
        BindingValueUsedByServer(this.TempResult, ent.Map, inputValue, result)

        var findID = this.ResultMapIDs?.find(x => x === ent.Map?.PK_ID);
        if (findID != undefined && findID != null) {

            
            var findObj = this.OrchModel.MapValue?.FunctionMaps?.find(x => x.PK_ID === findID);
            if (findObj) {

                var name = findObj.PK_ID;
                if (!this.RetunValue[name]) {
                    this.RetunValue[name] = result;
                }
                else {
                    if (this.ConvertArrayRetrunIDs && !this.ConvertArrayRetrunIDs.find(x => x === name)) {
                        this.ConvertArrayRetrunIDs.push(name)
                        var before = this.RetunValue[name];
                        this.RetunValue[name] = [];
                        this.RetunValue[name].push(before)
                    }

                    this.RetunValue[name].push(result)
                }
            }
        }
    }
    _getInputValues(ent:FlowRunEntity) {


        if (ent.ActionModel) {
           
            var inputObj = ConvertJsonModelToObj2(ent.ActionModel.Inputs);

            var mappingInputCols =[];
            if (ent.JoinMap && ent.JoinMap.MAPPINGVALUE) {
                for (var j in ent.JoinMap.MAPPINGVALUE) {
                    var mapping = ent.JoinMap.MAPPINGVALUE[j];
                    var inputCol = mapping.InputColName
                    var valueCol = mapping.ValueColName;

                   
                    if(valueCol){
                       
                        mappingInputCols.push(inputCol);

                        var value;
                        if (!mapping.IsFixed)
                            value = StringKeyToValue(valueCol, this.TempResult);
                        else
                            value = valueCol;
                        SetKeyValueforObj(inputCol, value, inputObj);
                 
                    }
                    
                }
            }


            
            var id = ent.Map.PK_ID;
          
            if (this.InputValue && this.InputValue[id]) {

                var keyValue = ConvertObjectToStringFullKeyValue(this.InputValue[id]);
                
                for (var i in keyValue) {
                    var k = keyValue[i].key;
                    var v = keyValue[i].value;

                    if(mappingInputCols.findIndex(x=>x===k) < 0){
                        SetKeyValueforObj(k,v,inputObj);
                    }
                }
            
            }
           
  
            return inputObj;
        }
        return undefined;
    }
    

     
    _sendMessage=(id:string,name:string,type:string,msg:any)=>{
        if (this.OnMessage)
            this.OnMessage(id, name,type, msg);
    }
    _getLoopLimit = (id: string) => {
        if (id && this.OrchModel.LoopLimitSetting && this.OrchModel.LoopLimitSetting.length > 0) {

            

            var nums: number[] = []
            
            for(var  j in this.OrchModel.LoopLimitSetting){
                var keyValue = this.OrchModel.LoopLimitSetting[j]   
                var keys = keyValue?.key?.split("|");

                if(keys && keys.length > 0){
                    var okCnt = 0;
                    for(var k in keys){
                        var key = keys[k]
                        if (key) {
                            var index = id.indexOf(key);
                            if (index > -1) {
                                okCnt +=1;
                            }
                        }

                        if(okCnt === 2){
                            nums.push(keyValue.value)
                            break;
                        }
                    }
                }
            }
            
            if (nums && nums.length > 0) {
                
                var rtn =Math.max(...nums)
                

                return rtn;
            }
        }

        return OrchestrationModel.DefaultLoopLimit;


    }
}
