import { UIFlowRunEntity } from "./ui.models.js"
import FlowLineClient from "./flowline.client.js";

import { ConvertKeyValueObjectToObject, AddMonths, AddWeeks, ConvertDateToYYYY_MM_DD, ObjClone, ValidNextItems, GetInputCtrlModelsForActionModel } from "flowline_common_model/src/util.common"
import { StringKeyToValue } from 'flowline_common_model/src/util.common'
import { FlowRunEntity,ActionModel, JoinMap, FunctionMap, MapValue, InputCtrlModel, JsonModel, KeyValue, OrchestrationModel, ReturnModel, Conditional, ColumnMappingModel, Dictionary } from 'flowline_common_model/src/models'




export default class FlowLineUtils {

   

   

    private static _includeEvent:string[] = ["ItemLoadEvent","ExpandEvent","TabEvent","TreeExpandEvent","MessageLoadEvent"]

    // public static IsLoop  = (entity:UIFlowRunEntity)=>{
    //     var startID = entity.Map.PK_ID;
    //     var targetObj  = entity;
    //     while (targetObj != undefined) {
    //         if (isIncludeMe || targetObj !== obj){
    //             if (flowLine.includes(targetObj)) {
    //                 console.log("D")
    //                 break;
    //             }
    //             else flowLine.splice(0, 0, targetObj);
    //         }

    //         var r = targetObj.PrevSvgObjs()
            
    //         if (r && r.length === 1) {
    //             targetObj = r[0]
    //         }
    //         else {
    //             targetObj = undefined;
    //         }

    //     }
    // }
    public static IsIncludeEvent = (eventKey?:string)=>{

        if(eventKey)
            return FlowLineUtils._includeEvent.findIndex(x=>eventKey.includes(x) ) > -1;
        else
            return false
    }
    public static IsIncludeExpandEvent =(entity:UIFlowRunEntity)=>{
        if(entity && entity?.Map?.ActionType === "UI" && entity.Items?.length > 0){

            for(var i in entity.Items){
                 if(entity.Items[i].Map.UIEventSetting?.EventType?.includes("ExpandEvent")){
                    return true;
                 }
            }
            
        }

        return false;
    }
    static BindingFunctionLayerList = (rtn:UIFlowRunEntity[] , lst:UIFlowRunEntity[])=>{
        for (var i in lst) {
            var runEntity = lst[i]
            if(runEntity && rtn.findIndex(x => x.ID === runEntity.ID) < 0 ){
                var isNext = true;
                if(runEntity.Map.ActionType === "UI" || runEntity.Map.ActionType === "UIEDIT" || runEntity.Map.ActionType === "Control"){
                    rtn.push(runEntity)
                }
                else if(runEntity.Map.ActionType === "Event"){
                    rtn.push(runEntity)
                    isNext =!FlowLineUtils.IsIncludeEvent(runEntity.Map.UIEventSetting?.EventType );
                }
                else if(runEntity.Map.ActionType === "UIPOPUP" || runEntity.Map.ActionType === "Message"){
                    rtn.push(runEntity)
                    isNext = false;
                }
                else if(runEntity.Map.ActionType === "Component" || runEntity.Map.ActionType === "Code"){
                    rtn.push(runEntity)
                }
               
                
                if(isNext){
                    this.BindingFunctionLayerList(rtn,runEntity.Items);
                }
            }
        }
    }


    
    static GetStartUIFlowRunEntityList = (mapID:string,mapValue: MapValue) => {
    
    
        const Binding = (flowLineEntitList: UIFlowRunEntity[], parent: UIFlowRunEntity, maps: FunctionMap[], joins: JoinMap[] | undefined) => {
            var map = parent.Map;
    
    
    
            if (joins && joins.length > 0) {
                for (var i in joins) {
                    var join = joins[i];
                    
    
                    if (join?.FK_START_MAP_ID === map?.PK_ID ) {
                        if (maps) {
    
                            for (var j in maps) {
                                var cmap = maps[j];
    
                                if (join?.FK_END_MAP_ID === cmap.PK_ID) {
                                    
    
                                    var findObj = flowLineEntitList.find(x => x.ID === join?.FK_START_MAP_ID + join?.FK_END_MAP_ID);

                                    if (!findObj) {
                                        
                                        findObj = new UIFlowRunEntity(cmap, join, parent)
                                        flowLineEntitList.push(findObj);
    

                                        var isNext = true;
                                       
                                        if(isNext){
                                            Binding(flowLineEntitList, findObj, maps, joins);
                                        }
                                        
                                    }
    
                                    parent.Items.push(findObj)
    
    
                                }
                            }
                        }
                    }
                }
            }
    
    
            if (parent && parent.Items && parent.Items.length > 0) {
                parent.Items = parent.Items.sort((a, b) => {
    
                    if (a.Map && b.Map) {
                        var aCol = a.Map.COL_MINCOLUMN * 10;
                        var aRow = a.Map.COL_MINROW * 1000;
                        var bCol = b.Map.COL_MINCOLUMN * 10
                        var bRow = b.Map.COL_MINROW * 1000;
    
                        return (aRow + aCol) - (bRow + bCol);
                    }
                    return -1;
                });
            }
        }
    
        var functionMaps: FunctionMap[] = []
        if (mapValue?.FunctionMaps && mapValue?.FunctionMaps.length > 0) {
            for (var i in mapValue?.FunctionMaps) {
                functionMaps.push(mapValue?.FunctionMaps[i] as FunctionMap)
            }
        }
    
        var joinMaps: JoinMap[] | undefined = mapValue?.JoinMaps;

        
        var rtn:UIFlowRunEntity[] =[];
        
        if (mapValue) {

            if (mapID === "root") {
                var func = this.GetNextFunc(mapID, mapValue)

                for (var k in func) {
                    var startObj = func[k]
                    if (startObj) {

                        var startRunEntity = new UIFlowRunEntity(startObj, undefined, undefined);
                        startRunEntity.Parent = undefined
                        var entList: UIFlowRunEntity[] = []
                        Binding(entList, startRunEntity, functionMaps, joinMaps);

                        rtn.push(startRunEntity)
                    }
                }
            }
            else if (mapValue.FunctionMaps) {

                var startFunc = mapValue.FunctionMaps.find(x => x.PK_ID === mapID) as FunctionMap
                var startRunEntity = new UIFlowRunEntity(startFunc, undefined, undefined);
                var entList: UIFlowRunEntity[] = []
                Binding(entList, startRunEntity, functionMaps, joinMaps);
                rtn = rtn.concat(startRunEntity.Items)
            }
        }
    
        return rtn;
    }
    
    static GetNextJoins = (mapID:string,mapValue:MapValue)=>{
        
        if (mapValue.JoinMaps && mapValue.JoinMaps.length > 0) { 
            return mapValue.JoinMaps.filter(x => x.FK_START_MAP_ID === mapID)                    
           
        }
        return undefined;
    }
    
    static GetNextFunc = (mapID:string,mapValue:MapValue)=>{


        var rtn:FunctionMap[] =[]
        var ids:string[] =[]
        if (mapID === "root" && mapValue.FunctionMaps && mapValue.FunctionMaps.length > 0 && (!mapValue.JoinMaps || mapValue.JoinMaps.length === 0)) {
            for (var i in mapValue.FunctionMaps) {
                ids.push(mapValue.FunctionMaps[i].PK_ID)
            }
        }
        if (mapValue.JoinMaps && mapValue.JoinMaps.length > 0 && mapValue.FunctionMaps && mapValue.FunctionMaps.length > 0) {

            if (mapID === "root") {
                for (var i in mapValue.JoinMaps) {
                    var targetID = mapValue.JoinMaps[i].FK_START_MAP_ID;
                    if (ids.findIndex(x => x == targetID) < 0) {
                        var index = mapValue.JoinMaps.findIndex(x => x.FK_END_MAP_ID === targetID)
                        if (index < 0) {
                            ids.push(targetID)
                        }
                    }
                }

                
                for(var j  in mapValue.FunctionMaps){
                     var chkID = mapValue.FunctionMaps[j].PK_ID;
                     if(chkID && ids.findIndex(x=>x=== chkID) < 0){
                         var isFind= false;
                         for(var k in mapValue.JoinMaps) {
                             var jObj = mapValue.JoinMaps[k];
                             if(jObj.FK_START_MAP_ID === chkID || jObj.FK_END_MAP_ID === chkID){
                                 isFind = true;
                                 break;
                             }
                         }
                         if(!isFind){
                             ids.push(chkID)
                         }
                     }
                 }
            }
            else{
                var joins = mapValue.JoinMaps.filter(x => x.FK_START_MAP_ID === mapID)        
                
                if(joins && joins.length > 0){
                    for(var i in joins){
                        ids.push(joins[i].FK_END_MAP_ID)
                    }
                }
            }
        }

        if (mapValue.FunctionMaps && mapValue.FunctionMaps.length > 0 && ids && ids.length > 0) {
            for (var i in ids) {

                var func = mapValue.FunctionMaps.find(x=>x.PK_ID === ids[i]) as FunctionMap
                if(func){
                    rtn.push(func)
                }
            }
        }
        return rtn;
        /*
        var rtn:FunctionMap[] =[]
        var ids:string[] =[]
        

        if (mapID === "root") {
            var withOutIds=[]
            if (mapValue.JoinMaps && mapValue.JoinMaps.length > 0) {
                for (var i in mapValue.JoinMaps) {
                    var targetID = mapValue.JoinMaps[i].FK_START_MAP_ID;
                    if (withOutIds.findIndex(x => x == targetID) < 0) {
                        var index = mapValue.JoinMaps.findIndex(x => x.FK_END_MAP_ID === targetID)
                        if (index > -1) {
                            withOutIds.push(targetID)
                        }
                    }
                }
            }
            if (mapValue.FunctionMaps) {
                for (var j in mapValue.FunctionMaps) {

                    var id = mapValue.FunctionMaps[j].PK_ID
                    if (withOutIds.findIndex(x => x === id) < 0) {

                        ids.push(id)
                    }
                }
            }

        }
        else if(mapValue.JoinMaps && mapValue.JoinMaps.length > 0){
            var joins = mapValue.JoinMaps.filter(x => x.FK_START_MAP_ID === mapID)        
            
            if(joins && joins.length > 0){
                for(var i in joins){
                    ids.push(joins[i].FK_END_MAP_ID)
                }
            }
        }
        

        if (mapValue.FunctionMaps && mapValue.FunctionMaps.length > 0 && ids && ids.length > 0) {
            for (var i in ids) {

                var func = mapValue.FunctionMaps.find(x=>x.PK_ID === ids[i]) as FunctionMap
                if(func){
                    rtn.push(func)
                }
            }
        }
        return rtn;
        */
    }

    static PollingRun = (map: FunctionMap, action: Function) => {
        
        if ((map.ActionType === "Component" ||map.ActionType === "Code" ) 
            && map.UIActionSetting
            && map.UIActionSetting.PollingSetting 
            && map.UIActionSetting.PollingSetting.IsPolling 
            && map.UIActionSetting.PollingSetting.IntervalTime 
            && map.UIActionSetting.PollingSetting.IntervalTime > 0 
            && map.UIActionSetting.PollingSetting.IntervalType) {
            var intervalTime = 0;
            if (map.UIActionSetting.PollingSetting.IntervalType === "INTERVALTYPE1") {
                intervalTime = map.UIActionSetting.PollingSetting.IntervalTime * 1000;
            }
            else if (map.UIActionSetting.PollingSetting.IntervalType === "INTERVALTYPE2") {
                intervalTime = map.UIActionSetting.PollingSetting.IntervalTime * 60 * 1000;
            }
            else if (map.UIActionSetting.PollingSetting.IntervalType === "INTERVALTYPE3") {
                intervalTime = map.UIActionSetting.PollingSetting.IntervalTime * 60 * 60 * 1000;
            }

            if (intervalTime > 0) {
                return setInterval(async () => {

                    await action();

                }, intervalTime);


            }
        }

        return undefined;
    }




    

    static ConvertInputCtrlModelToJsonModel = (params: InputCtrlModel[] | undefined, beforeInput: JsonModel[] | undefined) => {

        var rtn: JsonModel[] = [];
        if (params) {

            for (var j in params) {
                var key = params[j].NAME;
                var obj = beforeInput?.find(x => x.key === key)
                if (!obj) {
                    obj = {
                        key: key
                        , value: params[j].VALUE
                        , displayName: params[j].DISPLAYNAME
                        , jsonType: params[j].JsonModel.jsonType
                    }
                }


                rtn.push(obj)
            }
        }
        return rtn;
    }
    
    

    static BindingDefaultValueforInputCtrlModel = (inputCtrlModel: InputCtrlModel[])=>{
        
        for (var i in inputCtrlModel) {
            var inputParam = inputCtrlModel[i]

            if (inputParam.TYPE === "DateTimeParam") {
                if (inputParam.OPTION === "DataTimeParamItem2")
                    inputParam.VALUE = ConvertDateToYYYY_MM_DD(AddWeeks(-1))
                else if (inputParam.OPTION === "DataTimeParamItem3")
                    inputParam.VALUE = ConvertDateToYYYY_MM_DD(AddMonths(-1))
                else if (inputParam.OPTION === "DataTimeParamItem4")
                    inputParam.VALUE = ConvertDateToYYYY_MM_DD(AddMonths(-12))
                else
                    inputParam.VALUE = ConvertDateToYYYY_MM_DD(new Date())
            }
        
        }
    }
    

    static async BiningValueOrchestrationModel(model: OrchestrationModel, v: MapValue, flowLineClient: FlowLineClient | undefined) {
        if (model) {

            if (!v.ChildItems) {
                v.ChildItems = model.MapValue?.ChildItems
            }
            model.MapValue = v;

            var before = model.Inputs;
            var inAndOut = await FlowLineUtils.GetOrchestrationInAndOutModel(flowLineClient, v, before);

            model.Inputs = inAndOut.inputs;

            model.Return = { jsonType: "Object", child: inAndOut.outputs };
            model.ModelType = "OCST"

        }
    }
    static async GetActionModelsIncludeFlowUsedByClient(flowLineClient: FlowLineClient | undefined, mapValue?: MapValue) {
        var rtn: any = {}
        if (mapValue) {
            var maps = mapValue.FunctionMaps as FunctionMap[];

            if (maps) {

                for (var i in maps) {
                    var fmap = maps[i];
                    if (fmap && fmap.ActionID && fmap.ActionType !== "Start" && fmap.ActionType !== "End") {

                        if (!rtn[fmap.ActionID]) {
                            
                            rtn[fmap.ActionID] = await flowLineClient?.GetUnitDetail(fmap.ActionID, "comp", true);
                            
                        }
                    }

                }

            }
        }
        
        return rtn;
    }
    static async GetControlModelsIncludePageUsedByClient(flowLineClient: FlowLineClient | undefined, mapValue?: MapValue) {
        var rtn: any = {}
        if (mapValue) {
            var maps = mapValue.FunctionMaps as FunctionMap[];

            if (maps) {

                for (var i in maps) {
                    var fmap = maps[i];
                    if (fmap&& fmap.CtrlSetting && fmap.CtrlSetting.FK_CONTROL_ID) {

                        if (!rtn[fmap.CtrlSetting.FK_CONTROL_ID]) {
                            rtn[fmap.CtrlSetting.FK_CONTROL_ID] = await flowLineClient?.GetUnitDetail(fmap.CtrlSetting.FK_CONTROL_ID, "ctrl", true);
                        }
                    }

                }

            }
        }
        return rtn;
    }
    private static async GetOrchestrationInAndOutModel(flowLineClient: FlowLineClient | undefined, mapV: MapValue, beforeInput: JsonModel[] | undefined) {
        var ocstInputs: JsonModel[] = []
        var ocstOutputs: JsonModel[] = []
        if (mapV) {
            var maps = mapV.FunctionMaps as FunctionMap[];
            var joins = mapV.JoinMaps;

            var startMap = null;
            var endMap = null
            if (maps) {

                startMap = maps.find(x => x.ActionType === "Start")
                endMap = maps.find(x => x.ActionType === "End")

            }


            if (startMap) {
                var checkList: string[] = [];
                await BindingInputs(checkList, ocstInputs, flowLineClient, startMap.PK_ID, maps, joins, beforeInput);
            }
            if (endMap) {
                await BindingOutputs(ocstOutputs, flowLineClient, endMap.PK_ID, maps, joins);
            }

        }


        return { inputs: ocstInputs, outputs: ocstOutputs };


        async function BindingInputs(checkList: string[], ocstInputs: JsonModel[], flowLineClient: FlowLineClient | undefined, beforeID: string, maps: FunctionMap[] | undefined, joins: JoinMap[] | undefined, beforeInput: JsonModel[] | undefined) {

            if (checkList.findIndex(x => x === beforeID) < 0 && joins) {
                checkList.push(beforeID)
                for (var i in joins) {
                    var join = joins[i];

                    if (join.FK_START_MAP_ID === beforeID) {
                        if (maps) {
                            for (var j in maps) {
                                var map = maps[j];

                                if (join.FK_END_MAP_ID === map.PK_ID && map.ActionType !== "End") {

                                    var actModel = undefined;

                                    if (map.ActionType !== "Code" && map.ActionID) {

                                        actModel = await flowLineClient?.GetUnitDetail(map.ActionID, "comp", true)
                                    }
                                    else if (map.ActionType === 'Code' && map.CodeType === "javascript" && map.JavaScript) {
                                        actModel = map.JavaScript;
                                    }


                                    if (actModel) {

                                        var inputs = GetInputCtrlModelsForActionModel(actModel);

                                        var noMappingInputs: InputCtrlModel[] = [];
                                        for (var i in inputs) {
                                            var inputModel = inputs[i];
                                            if (inputModel) {
                                                var inputName = inputModel.NAME;
                                                var isFind = false;
                                                if (inputName) {
                                                    for (var j in join.MAPPINGVALUE) {
                                                        var mapping = join.MAPPINGVALUE[j];

                                                        if (mapping.InputColName && mapping.ValueColName && mapping.InputColName === inputName) {
                                                            isFind = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (!isFind) {
                                                    noMappingInputs.push(inputModel)
                                                }
                                            }
                                        }


                                        if (noMappingInputs && noMappingInputs.length > 0) {

                                            var cinputs: JsonModel[] = FlowLineUtils.ConvertInputCtrlModelToJsonModel(noMappingInputs, beforeInput?.find(x => x.key === map.PK_ID)?.child);


                                            ocstInputs.push({ key: map.PK_ID, value: "", displayName: map.COL_NAME, jsonType: "Object", child: cinputs })
                                        }

                                    }



                                    await BindingInputs(checkList, ocstInputs, flowLineClient, map.PK_ID, maps, joins, beforeInput)

                                }
                            }
                        }
                    }
                }
            }


        } async function BindingOutputs(ocstOutputs: JsonModel[], flowLineClient: FlowLineClient | undefined, endID: string, maps: FunctionMap[] | undefined, joins: JoinMap[] | undefined) {




            if (joins) {
                for (var i in joins) {
                    var join = joins[i];

                    if (join.FK_END_MAP_ID === endID) {
                        if (maps) {
                            for (var j in maps) {
                                var map = maps[j];
                                if (join.FK_START_MAP_ID === map.PK_ID) {

                                    if (map.ActionType === "Code" && map.CodeType === "jsonParser" && map.JsonParserModel) {
                                        ocstOutputs.push({ key: map.PK_ID, value:map.COL_NAME, displayName: map.COL_NAME, jsonType: map.JsonParserModel.jsonType, child: map.JsonParserModel.child })
                                    }
                                    else {
                                        var actModel;

                                        if (map.ActionID) {
                                            actModel = await flowLineClient?.GetUnitDetail(map.ActionID, "comp", true)
                                        }
                                        else if (map.CodeType === "javascript" && map.JavaScript) {
                                            actModel = map.JavaScript
                                        }
                                        if (actModel && actModel.Return) {

                                            var obj = ocstOutputs.find(x => x.key === map.PK_ID);
                                            if (obj) {
                                                if (actModel.Return.jsonType === "String") {
                                                    obj.jsonType = "Array_String"
                                                }
                                                else if (actModel.Return.jsonType === "Number") {
                                                    obj.jsonType = "Array_Number"
                                                }
                                                else if (actModel.Return.jsonType === "Boolean") {
                                                    obj.jsonType = "Array_Boolean"
                                                }
                                                else if (actModel.Return.jsonType === "Any") {
                                                    obj.jsonType = "Array_Any"
                                                }
                                                else if (actModel.Return.jsonType === "Object") {
                                                    obj.jsonType = "Array"
                                                }

                                            }
                                            else {
                                                ocstOutputs.push({ key: map.PK_ID, value: map.COL_NAME, displayName:map.COL_NAME, jsonType: actModel.Return.jsonType, child: actModel.Return.child })
                                            }

                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }


        }
    }
    static CloneBindingValueUsedByClient = (result: any, map: FunctionMap | undefined, inputs: KeyValue[] | undefined, value: any) => {
        var rtn = ObjClone(result ? result : {})
        
       return FlowLineUtils.BindingValueUsedByClient(rtn, map, inputs, value);
        
    }
    static BindingValueUsedByClient = (result: any, map: FunctionMap | undefined, inputs: KeyValue[] | undefined, value: any) => {

        var rtn = result ? result : {};

        if (inputs && inputs.length > 0)
            rtn[`in${map?.PK_ID}`] = ConvertKeyValueObjectToObject(inputs);

        rtn[`out${map?.PK_ID}`] = value;
        
        rtn[`name${map?.PK_ID}`]= map?.COL_NAME

        return rtn;

    }
    static BindingValueConditionalUsedByClient = (conditional: Conditional) => {
        var staticValueQuery = "";
        var displayValueQuery = "";
        if (conditional && conditional.Settings && conditional.Settings.length > 0) {
            for (var i in conditional.Settings) {
                var setting = conditional.Settings[i];

                if (setting.AndOr && setting.Column && setting.ConditionType && (setting.ValueType === "String" || setting.Value || setting.ConditionType === "Allow" || setting.ConditionType === "NotAllow" )) {
                    var strValue = setting.Value;

                    if (setting.ValueType === "String") {
                        strValue = `"${strValue ? strValue : ""}"`;
                    }
                    // else if (setting.ValueType === "Length") {
                    //     strValue = `${strValue ? `${strValue}.length` : ""}`;
                    // }
                    

                    var strAndOr = setting.AndOr;
                    if (strAndOr === "||") {
                        strAndOr = `) ${strAndOr} (`;
                    }

                    var strStaticColumn = setting.Column.replaceAll(".", "_").replaceAll("-", "_");
                    var strDisplayColumn = setting.DisplayColumn;
                    if (setting.ConditionType === "Contains") {
                        staticValueQuery += `${staticValueQuery ? strAndOr : '('} ${strStaticColumn}.indexOf(${strValue}) != -1 `
                        displayValueQuery += `${displayValueQuery ? strAndOr : '('} ${strDisplayColumn}.indexOf(${strValue}) != -1 `
                    }
                    else if (setting.ConditionType === "NotContains") {
                        staticValueQuery += `${staticValueQuery ? strAndOr : '('} ${strStaticColumn}.indexOf(${strValue}) == -1 `
                        displayValueQuery += `${displayValueQuery ? strAndOr : '('} ${strDisplayColumn}.indexOf(${strValue}) == -1 `
                    }
                    else if (setting.ConditionType === "Allow") {
                        staticValueQuery += `${staticValueQuery ? strAndOr : '('} ${strStaticColumn} `
                        displayValueQuery += `${displayValueQuery ? strAndOr : '('} ${strDisplayColumn} `
                    }
                    else if (setting.ConditionType === "NotAllow") {
                        staticValueQuery += `${staticValueQuery ? strAndOr : '('} !${strStaticColumn} `
                        displayValueQuery += `${displayValueQuery ? strAndOr : '('} !${strDisplayColumn} `
                    }
                    else {
                        staticValueQuery += `${staticValueQuery ? strAndOr : '('} ${strStaticColumn} ${setting.ConditionType} ${strValue} `
                        displayValueQuery += `${displayValueQuery ? strAndOr : '('} ${strDisplayColumn} ${setting.ConditionType} ${strValue} `
                    }

                }
            }
            if (staticValueQuery)
                staticValueQuery += ")";
            if (displayValueQuery)
                displayValueQuery += ")";
        }

        conditional.StrValue = staticValueQuery;
        conditional.DisplayValue = displayValueQuery;
    }
    static ConvertReulstToReturnModelUsedByClient = (item: any) => {
        try {
            item = JSON.parse(item)
        }
        catch (ex) {

        }
        var rtn: ReturnModel = {}
        var strType = "";
        if (item) {
            if (item.constructor === Object) {
                strType = "Object";
                rtn.child = FlowLineUtils.GetChildOutputItems(item);
            }
            else if (item.constructor === Array) {
                strType = "Array";
                rtn.child = FlowLineUtils.GetChildOutputItems(item[0]);
            }
            else if (item.constructor === String) {
                strType = "String";
            }
            else if (item.constructor === Boolean) {
                strType = "Boolean";
            }
            else if (item.constructor === Number) {
                strType = "Number";
            }

            rtn.jsonType = strType;
        }


        return rtn;
    }
    static GetChildOutputItems = (item: any) => {

        var rtn: JsonModel[] = [];

        if (item) {
            if (item.constructor === Object) {
                var propertyList = Object.getOwnPropertyNames(item)
                for (var i in propertyList) {
                    var property = propertyList[i];
                    var value = item[property];
                    var strType = "";
                    if (value === null) {
                        strType = "Null";
                    } else if (value === undefined) {
                        strType = "Undefined";
                    }
                    else {
                        if (value.constructor === Object) {
                            strType = "Object";
                        }
                        else if (value.constructor === Array) {
                            strType = "Array";
                        }
                        else if (value.constructor === String) {
                            strType = "String";
                        }
                        else if (value.constructor === Boolean) {
                            strType = "Boolean";
                        }
                        else if (value.constructor === Number) {
                            strType = "Number";
                        }
                    }


                    rtn.push({ key: property, isFixedValue: false, jsonType: strType, child: FlowLineUtils.GetChildOutputItems(value) });

                }
            }
            else if (item.constructor === Array) {
                if (item.length > 0) {
                    rtn = FlowLineUtils.GetChildOutputItems(item[0]);
                }
            }
        }
        return rtn;

    }

    
    
}




