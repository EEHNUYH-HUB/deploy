import { ReactNode } from 'react';
import { BindingMappingValue, ConvertJsonModelToKeyValue, ConvertJsonToKeyValueObject, ConvertJsonToKeyValueObjectList, Guid, ObjClone, StringKeyToValue, ValidConditional } from "flowline_common_model/result/util.common";
import { FlowRunEntity, ControlModel, FunctionMap, InputCtrlModel, JoinMap, KeyValue, Map, UnitModel, UserInfo, JsonModel, OutputCtrlModel, ButtonStyle, UIEditModel, UIViewModel, ActionModel, Dictionary, BindingLoadOption, ColumnMappingModel } from 'flowline_common_model/result/models'
import { ColorShape, ColorType } from './color.selector.js';
import FlowLineUtils from './flowline.utils.js';
import { AppContextProps } from 'ctx.app.js';
import FlowLineSocketClient from 'flowline.client.socket.js';


export class ChatMessage {
    beforeMsgID: number = -1;
    userInfo: UserInfo | null = null;
    message: string | null = null;
    messageID: number = -1;
}


export enum EDITTYPE {
    CREATE = "CREATE"
    , DELETE = "DELETE"
    , UPDATE = "UPDATE"
    , COPY = "COPY",
    REFLACE = "REFLACE"
}
export enum CTRLTYPE {

    MENUPROFILE = "MENUPROFILE",
    MENUUSER = "MENUUSER",
    MENUCOMPONENT = "MENUCOMPONENT",
    MENUFLOW = "MENUFLOW",
    MENUSEARCH = "MENUSEARCH",
    MENUCONTROL = "MENUCONTROL",
    MENUAPP = "MENUAPP",


    SITE = "SITE",
    LAYOUT = "LAYOUT",
    LOGIN = "LOGIN",
    SEARCH = "SEARCH",
    CONTROL = "CONTROL",
    PAGE = "PAGE",
    COMPONENT = "COMPONENT",
    ENVIRONMENT = "ENVIRONMENT",
    DBCONFIG = "DBCONFIG",
    OPENAI = "OPENAI",
    SCHD = "SCHD",
    TEMPL="TEMPL",
    MCP="MCP",
    CORE="CORE",
    MCPAGENTLIST= "MCPLIST",
    PUBLICCOMPONENTLIST = "PUBLICCOMPONENTLIST",


    ENVIRONMENTLIST = "ENVIRONMENTLIST",
    OCSTLIST = "OCSTLIST",
    CTRLLIST = "CTRLLIST",
    PAGELIST = "PAGELIST",
    FUNCLIST = "FUNCLIST",
    PROCLIST = "PROCLIST",
    SCHDLIST = "SCHDLIST",
    RESTAPILIST = "RESTAPILIST",
    DBCONFIGLIST = "DBCONFIGLIST",
    OPENAILIST = "OPENAILIST",
    TEMPLLIST = "TEMPLLIST",
    CORELIST = "CORELIST",
    PROMPTLIST = "PROMPTLIST",

    NONE = "NONE"
}
export class TreeModel {
    ID: string = Guid();
    Items?: Array<TreeModel> | undefined;
    DisplayName: string | undefined;
    OrgItem?: any;
    IsLoaded?: boolean;
    ReloadItems?: Function;
    static Find: Function = (item: TreeModel, id: string) => {
        if (item.ID.toString() === id.toString()) {
            return item;
        }
        if (item.Items && item.Items.length > 0) {
            for (var i in item.Items) {

                var findObj = TreeModel.Find(item.Items[i], id);
                if (findObj)
                    return findObj
            }
        }


        return null;

    }

    static TotalCount(items: TreeModel[] | undefined) {
        var rtn = 0
        if (items && items.length > 0) {
            rtn = items.length;
            for (var i in items) {
                rtn += TreeModel.TotalCount(items[i].Items)
            }
        }
        return rtn;
    }
}

export class BuilderTreeModel extends TreeModel {
    UnitModel?: UnitModel;

    IsReg?: boolean
    CtrlType: CTRLTYPE

    IsSupportRun: boolean
    IsSupportReload: boolean
    IsSupportCreate: boolean

    IsSupportDelete: boolean
    IsSupportSave: boolean
    IsSupportCopy: boolean
    IsShowTitleBar: boolean
    IsSupportBinding: boolean

    onSave?: Function
    onDelete?: Function
    onCopy?: Function
    onRun?: Function
    onCreate?: Function
    onReflace?: Function

    ReRendering?: string

    constructor(ctrlType: CTRLTYPE) {
        super()
        this.CtrlType = ctrlType;
        this.Items = [];

        this.IsSupportBinding = true;


        this.IsSupportRun =
            this.IsSupportCreate =
            this.IsSupportDelete =
            this.IsSupportSave =
            this.IsSupportCopy =
            this.IsSupportReload =
            this.IsShowTitleBar = false;

        if (CTRLTYPE.COMPONENT === ctrlType) { this.IsSupportReload = this.IsShowTitleBar = this.IsSupportCopy = this.IsSupportDelete = this.IsSupportRun = this.IsSupportSave = true; }
        if (CTRLTYPE.CONTROL === ctrlType) { this.IsSupportReload = this.IsShowTitleBar = this.IsSupportCopy = this.IsSupportDelete = this.IsSupportRun = this.IsSupportSave = true; }
        if (CTRLTYPE.PAGE === ctrlType) { this.IsSupportReload = this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportRun = this.IsSupportSave = true; }
        if (CTRLTYPE.SCHD === ctrlType) { this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportSave = true; }
        if (CTRLTYPE.MCP === ctrlType) { this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportSave = true; }
        if (CTRLTYPE.TEMPL === ctrlType) { this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportSave = true; }

        if (CTRLTYPE.LAYOUT === ctrlType) { this.IsShowTitleBar = this.IsSupportSave = true; }
        if (CTRLTYPE.LOGIN === ctrlType) { this.IsShowTitleBar = this.IsSupportSave = true; }


        if (CTRLTYPE.ENVIRONMENT === ctrlType) { this.IsShowTitleBar = this.IsSupportSave = this.IsSupportDelete = true; }
        if (CTRLTYPE.MENUUSER === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.DBCONFIG === ctrlType) { this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportSave = true; }
        if (CTRLTYPE.OPENAI === ctrlType) { this.IsShowTitleBar = this.IsSupportDelete = this.IsSupportSave = true; }

        if (CTRLTYPE.ENVIRONMENTLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }

        if (CTRLTYPE.CTRLLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }

        if (CTRLTYPE.FUNCLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.OCSTLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.PROCLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.RESTAPILIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.PROMPTLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.DBCONFIGLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.OPENAILIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.SCHDLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.TEMPLLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.CORELIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; } 
        if (CTRLTYPE.PAGELIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.MCPAGENTLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.PUBLICCOMPONENTLIST === ctrlType) { this.IsShowTitleBar = this.IsSupportCreate = true; }
        if (CTRLTYPE.MENUCOMPONENT === ctrlType
            || CTRLTYPE.MENUCONTROL === ctrlType
            || CTRLTYPE.MENUPROFILE === ctrlType
            || CTRLTYPE.MENUFLOW === ctrlType
            || CTRLTYPE.MENUAPP === ctrlType
            || CTRLTYPE.MENUSEARCH === ctrlType
            || CTRLTYPE.SEARCH === ctrlType
            || CTRLTYPE.SITE === ctrlType
            || CTRLTYPE.CORE === ctrlType
        ) { this.IsSupportBinding = false; }






    }

    Find: Function = (id: string) => {

        if (this.ID.toString() === id.toString()) {
            return this;
        }
        if (this.Items && this.Items.length > 0) {
            for (var i in this.Items) {
                var findObj = (this.Items[i] as BuilderTreeModel).Find(id);
                if (findObj)
                    return findObj
            }
        }


        return null;

    }

}


export interface BorderEntity {
      height?: number 
    , strHeight?: string 
    , type?: string 
    , borderColor?:string
    , backgroundColor?:string
}
export interface DynamicEditProps {
    functionMap: FunctionMap
    rerendering?: string
    loading?: boolean
    controlHeight?: string
    pageBorder?: BorderEntity
    value?: any
    onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
    onRun?: (inputParams: InputCtrlModel[] | undefined, connectionID?: string) => void;
}
export interface DynamicViewProps {
    functionMap: FunctionMap
    rerendering?: string
    onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
    
    onSelected?: Function;
    onDoubleClick?: Function
    controlHeight?: string
    pageBorder?: BorderEntity
    value?: any;
    historyValue?:any;
    onReload?: Function
    isExpandCtrl?: boolean
    isIncludeCtrl?: boolean
    onBindingAction?: Function
    onCheckEventAction?: (item: object, eventType: string) => boolean
    bindingLoadOption?: BindingLoadOption
    //onAppendCtrl?:Function   
}

// export interface DynamicFunctionCtrl {
//     runEntity: FlowRunEntity;
//     value?: any;
//     rootHeight?: RootHeightEntity
//     beforeInputValue?: KeyValue[];
//     inputParams?: InputCtrlModel[];
//     supportType?: Array<string>;
//     onRun?: (inputParams: InputCtrlModel[] | undefined) => void;
//     onSelected?: Function;
//     onDoubleClick?: Function
//     onAppendCtrl?: Function
//     onReload?: Function
//     isButtonCtrl?: boolean
//     isExpandCtrl?: boolean
//     isIncludeCtrl?: boolean
//     onBindingAction?: Function
//     onCheckEventAction?: (item: object, eventType: string) => boolean
//     //ItemCss?:string
// }

export interface DynamicCtrlProps {
    controlMapID?: string;
    controlHeight?: string
    pageBorder?: BorderEntity
    
    onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
    controlModel?: ControlModel | undefined;
    ctrlParam: MapParamPros
}

export interface MapParamPros {
    mapID: string, result?: Dictionary<any> 
}
export interface SortModel {
    Index: number,
    ColumnName: string,
    IsAsc: boolean
}
export interface GroupByRow {
    IsGrp: boolean
    GroupBy: FilterModel
    Item: any
    Show: boolean
    Items: any[]
}
export interface FilterModel {
    Index: number,
    Operator: string,
    Value: any,
    GroupBy: boolean,
    GroupByIndex: number,
    ColumnSetting: OutputCtrlModel
}
// export interface ControlMapTable {
//     Rows: ControlMapRow[]
// }
// export interface ControlMapRow {
//     Columns: ControlMapColumn[]
// }
// export interface ControlMapColumn {
//     IsCtrl: boolean
//     MaxColSpan: number;
//     Ctrl?: ControlMap
//     Table?: ControlMapTable
// }
// export interface ControlMap extends Map {
//     FK_CONTROL_ID?: string;
//     COL_VIEW_NAME?: string;
//     IsBorder?: boolean;
//     HeightType?: string;
//     BackgroundColor?: ColorType;
//     BorderColor?: ColorType;
//     BackgroundColorShape?: ColorShape;
//     BorderColorShape?: ColorShape;
// }

export class PopupConfig {
    useCloseBtn?: boolean
    title?: string
    desc?: string
    width?: number
    height?: number
    fullSize?: boolean
    headerContainer?: string
    contentContainer?: string
    headerCtrl?: ReactNode
    contentClassName?:string
}
export class DockInfo {

    MainCtrl: ReactNode;
    SubDockInfo?: DockInfo;
    DockType: "Left" | "Top" | "Bottom" | "Right" | "Fill";
    WidthRate: number;
    HeightRate: number;
    DivCss: string;
    _colDivCss: string = "d-flex flex-row flex-row-fluid"
    _rowDivCss: string = "d-flex flex-column flex-column-fluid"
    constructor(mainCtrl: ReactNode) {
        this.MainCtrl = mainCtrl;
        this.DockType = "Fill";
        this.WidthRate = 100;
        this.HeightRate = 100;
        this.DivCss = this._colDivCss;
    }

    LeftDock(subCtrl: ReactNode) {
        this.DockType = "Right";
        this.WidthRate = 50;
        this.HeightRate = 50;
        this.DivCss = this._colDivCss;
        this.SubDockInfo = new DockInfo(subCtrl);
        return this.SubDockInfo;
    }
    RightDock(subCtrl: ReactNode) {
        this.DockType = "Left";
        this.WidthRate = 50;
        this.HeightRate = 50;
        this.DivCss = this._colDivCss;
        this.SubDockInfo = new DockInfo(subCtrl);
        return this.SubDockInfo;
    }
    TopDock(subCtrl: ReactNode) {
        this.DockType = "Bottom";
        this.WidthRate = 50;
        this.HeightRate = 50;
        this.DivCss = this._rowDivCss;
        this.SubDockInfo = new DockInfo(subCtrl);
        return this.SubDockInfo;
    }
    BottomDock(subCtrl: ReactNode) {
        this.DockType = "Top";
        this.WidthRate = 50;
        this.HeightRate = 50;
        this.DivCss = this._rowDivCss;
        this.SubDockInfo = new DockInfo(subCtrl);
        return this.SubDockInfo;
    }
}

export class UIFlowRunEntity {

    Items: UIFlowRunEntity[]

    ID: string;
    Parent: UIFlowRunEntity | undefined;
    Map: FunctionMap;
    JoinMap: JoinMap | undefined;
    onActionHandler?: (_self: UIFlowRunEntity, result: any) => Promise<void | ReactNode>
    
    onUIHidden?:(v:boolean)=>void
    onConnectionID?: () => string
    Result: Dictionary<any>
    IsValid:Boolean;

    constructor(map: FunctionMap, joinMap: JoinMap | undefined, parent: UIFlowRunEntity | undefined) {
        
        this.ID = joinMap ? joinMap.FK_START_MAP_ID + joinMap.FK_END_MAP_ID : "START"+ map.PK_ID ;
        this.Parent = parent;
        this.Map = map;
        this.JoinMap = joinMap;
        this.Items = []
        this.Result = {}
        this.IsValid= true;
    }

    public static async NextAction(items: UIFlowRunEntity[], result: Dictionary<any> | undefined,nextHandler?:Function) {

        var rtn: ReactNode[] = []
        if (items && items.length > 0) {
            for (var i in items) {
                var target = items[i];
                
                if (target && target.onActionHandler) {
                
                    var newValue;
                    if(nextHandler){
                        newValue = nextHandler(target)
                    }
                    
                    var ctrl = await target.onActionHandler(target, newValue?newValue:result)
                    
                    if (ctrl) {
                        rtn.push(ctrl)
                    }
                }
            }
        }
        return rtn;

    }

    async RunEvent(eventKey: string | undefined, item: any) {
        
        if (eventKey) {
            
            var finds = this.Items?.filter(x => x.Map.UIEventSetting?.EventType === eventKey)
          
          
            return await UIFlowRunEntity.NextAction(finds, item,(target:UIFlowRunEntity)=>{
              
                target.Result = FlowLineUtils.CloneBindingValueUsedByClient(this.Result, target.Map, undefined, item);
                    
                return target.Result
            })

        }
    }
    CheckValid(result:any){
        if (this.JoinMap?.Conditional && this.JoinMap?.Conditional.StrValue) {
                
            var condition = this.JoinMap.Conditional;

            this.IsValid =ValidConditional(condition, result)
            
        }
        
        return this.IsValid;
    }
    ValidNextEventAction(eventKey: string | undefined, item: any) {
        if (eventKey) {


            this.Result = FlowLineUtils.CloneBindingValueUsedByClient(this.Result, this.Map, undefined, item);


            var finds = this.Items?.filter(x => x.Map.UIEventSetting?.EventType === eventKey)
            var totalCount = 0;
            for (var i in finds) {
                var find = finds[i];
                var nextActions = UIFlowRunEntity.FindWithValidConditional(find.Items, this.Result)
                totalCount += nextActions.length;
            }

    
            return totalCount > 0;

        }
        return false;
    }

    async ReloadActionModel(appContext:AppContextProps,actionModel: ActionModel){
        var beforeObj = this.Result[`in${this.Map?.PK_ID}`];        
        return await this.Action(appContext,actionModel,this.Result,beforeObj?ConvertJsonToKeyValueObject(beforeObj):undefined)
    }
    private async Action(appContext: AppContextProps, actionModel: ActionModel,result: Dictionary<any>|undefined,inputValue:KeyValue[]|undefined){
        
        var chatUis = this._getNextChatIds()
        if (chatUis && chatUis.length > 0) {


            var receivedEvents = appContext.flowLineSocketClient?.GetReceivedEvents();
            if (receivedEvents) {

                var beforeResult = FlowLineUtils.CloneBindingValueUsedByClient(result, this.Map, inputValue ? inputValue : undefined, undefined)

                
                if (chatUis && chatUis.length > 0) {
                    for (var i in chatUis) {
                        var mapPkID = chatUis[i]

                        if (mapPkID) {
                            var fun = receivedEvents[mapPkID]
                            if (fun) {
                                var fEntity = this.Items.find(x => x.Map.PK_ID === mapPkID)
                                if (fEntity) {
                                    var uiData = fEntity.BindingResultToUIResult(beforeResult)
                                    fun("req_input", undefined, undefined, uiData)
                                }
                            }
                        }
                            
                    }
                }
            }
            var streamEndResult:any=undefined;
            var errMsg= "";
            appContext.flowLineSocketClient?.SendActionAndReceivedEvents(this.Map.PK_ID, actionModel.ProjectID ? actionModel.ProjectID : "", actionModel, inputValue
                , async (type: string, actionid: any, actionname: any, data: any) => {


                    var receivedEvents = appContext.flowLineSocketClient?.GetReceivedEvents();
                    if (receivedEvents) {

                        if (chatUis && chatUis.length > 0) {
                            for (var i in chatUis) {
                                var fun = receivedEvents[chatUis[i]]
                                if(fun)
                                    fun(type, actionid, actionname, data,()=>{
                                        return end(this)
                                    })
                            }
                        }
                    }
                    if (type === "res_result") {
                        streamEndResult = data;
                    }
                    else if(type === "res_err"){
                        errMsg += data;   
                    }
                    else if (type === "res_close") {
                        if(!chatUis || chatUis.length === 0){
                            return end(this)
                        }
                    }
                });
                async function end(_self:UIFlowRunEntity) {
                    if (streamEndResult) {
                        _self.Result = FlowLineUtils.CloneBindingValueUsedByClient(result, _self.Map, inputValue ? inputValue : undefined, streamEndResult);

                        return await UIFlowRunEntity.NextAction(UIFlowRunEntity.FindWithValidConditional(_self.Items, _self.Result), _self.Result)
                    }
                }
        }
        else {

            var resp;
            if (this.Map.UIActionSetting?.IsSocket) {

                resp = await appContext.flowLineSocketClient?.SendActionAsync(actionModel.ProjectID ? actionModel.ProjectID : "", actionModel, inputValue);
            }
            else {
                resp = await appContext.flowLineClient?.RunActionModel(actionModel, inputValue);
            }

            if (resp && resp.error) {
                return resp;
            }
            else {

                this.Result = FlowLineUtils.CloneBindingValueUsedByClient(result, this.Map, inputValue, resp);

                return await UIFlowRunEntity.NextAction(UIFlowRunEntity.FindWithValidConditional(this.Items, this.Result), this.Result)
            }
        }
    }
    async RunActionModel(appContext: AppContextProps, actionModel: ActionModel, result?: Dictionary<any>,mappingValue?:ColumnMappingModel[]) {
        var inputValue: any;

        
        if (actionModel.Inputs) {
            inputValue = ConvertJsonModelToKeyValue(actionModel.Inputs)

            if(mappingValue)
                BindingMappingValue(result, inputValue, mappingValue)
            else if (this.JoinMap?.MAPPINGVALUE)
                BindingMappingValue(result, inputValue, this.JoinMap?.MAPPINGVALUE)
        }

        return await this.Action(appContext,actionModel,result,inputValue)

    }


    NextUIList=() =>{
        var rtn  = []
        if(this.Items && this.Items.length > 0)
        {
            for(var i  in this.Items){
                var fObj = this.Items[i];
                if(fObj){
                    if( fObj.Map && (fObj.Map.ActionType === "UI" ||fObj.Map.ActionType === "UIEDIT"  )){
                        rtn.push(fObj)
                    }
                    else{
                        var cList = fObj.NextUIList()
                        if(cList && cList){
                            rtn.concat(cList)
                        }
                    }
                }
                
            }
        }
        
        return rtn;

    }
    public static FindWithValidConditional = (items: UIFlowRunEntity[], result: Dictionary<any> | undefined) => {
        var rtn = [];

        for (var i in items) {
            var item = items[i]

            if (item.JoinMap?.Conditional && item.JoinMap?.Conditional.StrValue) {
                
                var condition = item.JoinMap.Conditional;
                item.IsValid = ValidConditional(condition, result)
                if (item.IsValid) {
                    
                    if(item.onUIHidden){
                        
                        item.onUIHidden(false)
                        
                    }
                    else{
                        var uiList = item.NextUIList()
                        if(uiList && uiList.length > 0){
                            for(var j  in uiList){
                                var tObj = uiList[j];
                                if(tObj && tObj.onUIHidden){
                                    tObj.IsValid = true;
                                    tObj.onUIHidden(false)
                                }
                            }
                        }
                    }
                    rtn.push(item)
                }
                else{
                    
                    if(item.onUIHidden){
                        item.onUIHidden(true)
                    }
                    else{
                        var uiList = item.NextUIList()
                        if(uiList && uiList.length > 0){
                            for(var j  in uiList){
                                var tObj = uiList[j];
                                if(tObj && tObj.onUIHidden){
                                    tObj.IsValid = false;
                                    tObj.onUIHidden(true)
                                }
                            }
                        }
                    }
                
                }
            }
            else {
                rtn.push(item)
            }
        }

        

        return rtn;
    }
    private _getNextChatIds = () => {
        var rtnIds = [];


        for (var i in this.Items) {
            var obj = this.Items[i].Map;


            if (obj.ActionType === "UI" && obj.UIViewSetting?.ControlType === "ChatCtrl") {
                if (!this.Items[i].JoinMap?.IsChatHistory) {
                    rtnIds.push(obj.PK_ID)
                }
            }
        }

        return rtnIds;
    }

    BindingResultToUIResult(result?: Dictionary<any>) {
        var newResult;
        if (result) {

            if (this.JoinMap?.OutputSelectColumn) {
                newResult = StringKeyToValue(this.JoinMap?.OutputSelectColumn, result)
            }
            else {
                newResult = result
            }

            var isReturnArray = true;
            if (newResult?.constructor !== Array) {
                isReturnArray = false;
                newResult = [newResult]
            }


            var viewResult: any[] = [];

            if (this.JoinMap?.MAPPINGVALUE && this.JoinMap?.MAPPINGVALUE.length > 0) {
                for (var j in newResult) {
                    var rowValue = newResult[j];
                    var viewRow: any = {}
                    viewRow["UI"] = {}
                    
                    for (var i in this.JoinMap?.MAPPINGVALUE) {
                        var mapping = this.JoinMap?.MAPPINGVALUE[i];

                        
                        if (!mapping.IsFixed) {
                            
                            
                            var v = StringKeyToValue(mapping.ValueColName, rowValue)
                            
                            viewRow['UI'][mapping.InputColName]  = viewRow[mapping.InputColName] = v
                            
                        }
                        else {
                            
                            viewRow[mapping.InputColName] =mapping.ValueColName
                            viewRow['UI'][mapping.InputColName] = mapping.ValueColName
                        }
                        
                    }

                    viewRow["Data"]= rowValue;
                    viewResult.push(viewRow)
                }
            }

            var rtn;
            if (!isReturnArray) {
                if (viewResult.length > 0)
                    rtn = viewResult[0]
                else
                    rtn = {}
            }
            else {
                rtn = viewResult;
            }
            this.Result = FlowLineUtils.CloneBindingValueUsedByClient(result, this.Map, undefined, rtn);


            return rtn
        }
        return undefined;
    }

}
export class UIFlowMapRow {
    Columns: UIFlowMapColumn[] = []
    Chaged?:Function

    AddColumn =(entity:UIFlowRunEntity|undefined,maxColspan:number)=>{
        var findColumn = this.Columns.find(x=>x.Entity?.Map.PK_ID === entity?.Map.PK_ID && entity?.Map.ActionType === "UI" && entity.Map.UIViewSetting?.ControlType === "ChatCtrl")
        if(findColumn){
            // 임시방편 
            // Chat을 제외한 UI ctrl은 입력이 하나로 연결되게 하였지만 Chat일경우 히스토리 영역과 입력 영역이 2개의 연결이 필요하여 SubEntity에 등록
            findColumn.SubEntity = entity
            
        }
        else{
            this.Columns.push({ IsCtrl: true, Entity: entity, MaxColSpan: maxColspan, Table: undefined })
        }
        
    }
}
export class UIFlowMapColumn {
    Entity: UIFlowRunEntity | undefined
    SubEntity?:UIFlowRunEntity 

    MaxColSpan: number = 0
    ResizeColSpan?:number =0 
    IsCtrl: boolean = false
    Table: UIFlowMapTable | undefined


    static GetColumnTableResize=(col:UIFlowMapColumn)=>{
        var resize = 0;
        if(!col.IsCtrl && col.Table && col.Table.Rows && col.Table.Rows.length > 0 ){
            var rows = col.Table.Rows;
            for(var i  in rows){
                var row  = rows[i];

                for(var  j in row.Columns){
                    var col = row.Columns[j];
                    if(col.IsCtrl){
                        resize += col.ResizeColSpan?col.ResizeColSpan:0;
                    }
                    else{
                        resize += UIFlowMapColumn.GetColumnTableResize(col)
                    }
                }
                }
            
            
        }

        return resize;
    }

}
export class UIFlowMapTable {
    Rows: UIFlowMapRow[] = []

    HideList:UIFlowRunEntity[] =[]

    public Binding(lst: UIFlowRunEntity[]) {
        var ct2map = UIFlowMapTable.ConvertTo2Map(lst);
        this.Rows = UIFlowMapTable.ConvertToControlMapRows(ct2map);
    }
    public ShowItem(item:UIFlowRunEntity){
        var index = this.HideList.findIndex(x=>x.ID === item.ID)
        if(index > -1){
            this.HideList.splice(index,1)
            this._changeResizeRow(item)
        }
    }
    public HideItem(item:UIFlowRunEntity){
        var index = this.HideList.findIndex(x=>x.ID === item.ID)
        if(index < 0){
            this.HideList.push(item)
            this._changeResizeRow(item)
        }   
    }
    private _changeResizeRow(enity:UIFlowRunEntity){
        var rows = UIFlowMapTable._findRowContainEntity(this,enity)
            
        if(rows && rows.length > 0){
            
            for(var i in rows){
                var row = rows[i]
                UIFlowMapTable._columnResize(row,this.HideList)
                if(row.Chaged)
                    row.Chaged();



            }
            
            
        }
    }
    private static _findRowContainEntity = (table:UIFlowMapTable,entity:UIFlowRunEntity) => {
        
        var rows = table.Rows;
        if(rows && rows.length > 0 && entity){
            for(var i in rows){
                var row  = rows[i]
                if(row && row.Columns && row.Columns.length > 0){
                    var index = row.Columns.findIndex(x=>x.Entity?.ID === entity.ID);
                    if(index > -1){
                        return [row]
                    }
                }

                var findTableCols = row.Columns.filter(x=>!x.IsCtrl)
                for(var j in findTableCols){
                    var ctable = findTableCols[j].Table;
                    if(ctable){
                        var findObjs:UIFlowMapRow[]  = UIFlowMapTable._findRowContainEntity(ctable,entity);
                        if(findObjs && findObjs.length > 0){
                            findObjs.push(row)
                            return findObjs
                        }
                    }
                }
            }
        }

        return [];
    }
    public static ConvertTo2Map = (entitys: UIFlowRunEntity[]) => {
        var rows: UIFlowRunEntity[][] = [];
        if (entitys && entitys.length > 0) {
            
            entitys = UIFlowMapTable._sortMap(entitys);
            
            
            var colTmps: number[] = [];
            var rowTmps: number[] = [];
            for (var i in entitys) {

                var enity = entitys[i];

                colTmps.push(enity.Map.COL_MINCOLUMN)
                colTmps.push(enity.Map.COL_MAXCOLUMN)
                rowTmps.push(enity.Map.COL_MINROW)
                rowTmps.push(enity.Map.COL_MAXROW)
            }

            var subColIndex: number = Math.min(...colTmps);
            var totalColIndex: number = Math.max(...colTmps) - subColIndex;
            var subRowIndex: number = Math.min(...rowTmps);
            var totalRowIndex: number = Math.max(...rowTmps) - subRowIndex;


            for (var rowIndex = 0; rowIndex <= totalRowIndex; rowIndex++) {
                var cols: any[] = [];
                rows.push(cols);

                for (var colIndex = 0; colIndex <= totalColIndex; colIndex++) {
                    var isFind = false;
                    for (var i in entitys) {
                        var item = entitys[i];


                        if (item && item.Map.COL_MINROW! > -1) {

                            if (item.Map.COL_MINROW - subRowIndex === rowIndex && item.Map.COL_MINCOLUMN - subColIndex === colIndex) {
                                cols.push(item);
                                isFind = true;
                            }
                        }
                    }

                    if (!isFind) {
                        cols.push(undefined);
                    }

                }

            }

        }

        if (rows && rows.length > 0) {
            var colLen = rows[0].length;

            var removeIndex = []

            for (var k = 0; k < colLen; k++) {
                var isAllUndefinde = true;
                for (var l in rows) {
                    if (isAllUndefinde) {
                        var ck = rows[l][k];
                        if (ck) {
                            isAllUndefinde = false;
                        }
                    }
                }

                if (isAllUndefinde) {
                    removeIndex.push(k)
                }
            }

            for (var j = removeIndex.length - 1; j >= 0; j--) {

                for (var m in rows) {
                    rows[m].splice(removeIndex[j], 1)
                }

            }
        }



        return rows;
    }

    private static _sortMap = (entitys: UIFlowRunEntity[]) => {
        if (entitys && entitys.length > 0) {
            entitys = entitys.sort((a: UIFlowRunEntity, b: UIFlowRunEntity) => {
                if (a && b) {
                    var aCol = a.Map.COL_MINCOLUMN * 10;
                    var aRow = a.Map.COL_MINROW * 1000;
                    var bCol = b.Map.COL_MINCOLUMN * 10
                    var bRow = b.Map.COL_MINROW * 1000;

                    return (aRow + aCol) - (bRow + bCol);
                }
                return -1; 
            });
        }
        
        return entitys;
    }
    private static _isPass(col:UIFlowMapColumn,hideList?:UIFlowRunEntity[]){
        if (hideList && hideList.length > 0) {
            if (hideList.findIndex(x => x.ID === col.Entity?.ID) > -1) {
                return true;
            }


            if (!col.IsCtrl) {
                var size = UIFlowMapColumn.GetColumnTableResize(col)

                if (size === 0) {
                    col.ResizeColSpan = 0;
                    return true;
                }
            }
        }
        return false;
    }
    private static _columnResize = (row?: UIFlowMapRow,hideList?:UIFlowRunEntity[]) => {
        if (row) {
            var totalColCnt = 0;

            for (var j in row.Columns) {
                var col = row.Columns[j];
                if (col) {
                    if(UIFlowMapTable._isPass(col,hideList)){
                        continue;
                    }
                    
                    totalColCnt += col.MaxColSpan;

                }
            }


            if (row.Columns && row.Columns.length > 0) {
                var lastObj = null;
                var maxCnt = 12;
                for (var k in row.Columns) {
                    var col = row.Columns[k];
                    
                    if(UIFlowMapTable._isPass(col,hideList)){
                        col.ResizeColSpan = 0;
                        continue;   
                    }
                    
                    var beforeColSpan = col.MaxColSpan;
                    col.ResizeColSpan = Math.floor(beforeColSpan * 12 / totalColCnt);

                    maxCnt -= col.ResizeColSpan;
                    lastObj = col;

                }
                if (lastObj && maxCnt > 0) {
                    lastObj.ResizeColSpan = (lastObj.ResizeColSpan?lastObj.ResizeColSpan:0) + maxCnt
                }

            }

            
        }
    }

    public static ConvertToControlMapRows = (enitys: UIFlowRunEntity[][]) => {

        var rtn = []


        var currentRow: UIFlowMapRow | undefined = undefined;
        var includeRowIndex = 0;
        for (var i in enitys) {

            var cols = enitys[i]
            var intI = parseInt(i);

            if (!currentRow || includeRowIndex <= intI) {

                
                currentRow =new UIFlowMapRow();
                rtn.push(currentRow)
                includeRowIndex = intI;


            }



            for (var j in cols) {
                var intJ = parseInt(j);

                var entity = cols[j];
                if (entity) {
                    if (includeRowIndex < entity.Map.COL_ROWSPAN + intI) {
                        includeRowIndex = entity.Map.COL_ROWSPAN + intI;
                    }

                    if (currentRow.Columns.length > intJ) {
                        var tmpCol = currentRow.Columns[intJ];



                        if (tmpCol && tmpCol.IsCtrl ) {
                            tmpCol.IsCtrl = false;
                            
                            tmpCol.Table = new UIFlowMapTable()
                            var row = new UIFlowMapRow();
                            row.AddColumn(tmpCol.Entity,  12)
                            tmpCol.Table.Rows = [row]
                            tmpCol.Entity = undefined

                        }

                        if (tmpCol && tmpCol.Table)
                        {var row2 = new UIFlowMapRow();
                            row2.AddColumn(entity,  12)
                            tmpCol.Table.Rows.push(row2)
                        }



                        if (tmpCol.MaxColSpan < entity.Map.COL_COLSPAN) {
                            tmpCol.MaxColSpan = entity.Map.COL_COLSPAN;
                        }

                    }
                    else {
                        currentRow.AddColumn(entity,entity.Map.COL_COLSPAN)
                    }
                }
            }

            

        }

        

        function resizeRow (rows?:UIFlowMapRow[]){
            if (rows && rows.length > 0) {
                for (var k in rows) {
                    var row = rows[k];
                    UIFlowMapTable._columnResize(row)
                    for (var l in row.Columns) {
                        var col = row.Columns[l]
                        if (!col.IsCtrl) {
                            resizeRow(col.Table?.Rows)
                        }
                    }
                }
            }
        }

        resizeRow(rtn)

        
        return rtn;
    }


}