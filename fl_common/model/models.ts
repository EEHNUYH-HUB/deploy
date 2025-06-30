import { Guid } from "./util.common.js"

export type ApplicationModels = {
    ProjectID:string
    ProjectName:string|undefined
    ProjectDesc:string|undefined
    ActionModels:ActionModel[]
    ControlModels:ControlModel[]
    MCPAgents:MCPAgentModel[]
    PageModels:PageModel[]
    ScheduleModels:ScheduleModel[]
    DBConfigModels:DBConnectionModel[]   
    Profile:ProfileModel|undefined
    PublicActionModelKeys:{key:string}[]
    Update:number
    Layout:any
    EndPointID:string
    LoggingUrl:string
    LoggingLvl:string  
    Login:LoginInfo
}
export type ExportModel ={
    ProjectID:string
    IDs:string[]
    Requirements:{Type:'NODE'|'PYTHON',Module:string,Version:string}[]
    EnvList:EnvModel[]
    
    DBConfigModels:DBConnectionModel[]   
    LLMModels:ActionModel[]
    
    CoreModels:{id:string,name:string,path:string}[]

    NodeModels:ActionModel[]
    PythonModels:ActionModel[]
    ActionModels:ActionModel[]

    FlowModles:OrchestrationModel[]
    ControlModels:ControlModel[]
    MCPAgents:MCPAgentModel[]
    PageModels:PageModel[]
    ScheduleModels:ScheduleModel[]
    
    
    
}
export enum LoginType{
Azure="Azure",Control="Control",Anonymous="Anonymous"
}
export type LoginInfo = {
    LoginType:LoginType,
    LoginUISetting?:UIEditModel
    LoginProfileSetting?:OutputCtrlModel
    AzureTenantID: string,
    AzureClientID: string,
    AzureAuthoriry: string,
    AzureScopes: string,
    LogicActionID?:any,
    LogicMappingValue?:ColumnMappingModel[];
    LogicOutput?:ReturnModel;
    LogicUserInfo?:ColumnMappingModel[]
    SuccessConditional?:Conditional
    SupportUnauthorized?:boolean
    UnauthorizedConditional?:Conditional
    UnauthorizedMessage?:string

}
export class UserInfo {
    name: string | undefined;
    email: string | undefined;
    id: string | undefined;
    prjID:string|undefined
    accessToken: string | undefined;
    userToken:string|undefined;
    userInfo:any|undefined
    roleType:any|undefined
}
export class ProjectModel{

    pk_id:string=""
    col_env?:string
    col_layout_json?:string
    col_login_json?:string
    col_name?:string
    col_desc?:string
}
export class UnitModel{
    pk_id:string= ""
    fk_owner_user_id?:string
    owner_name?:string
    fk_modifer_user_id?:string
    modifer_name?:string
    col_name:string = ""
    col_desc?:string
    col_type?:string
    col_regdate?:Date
    col_modifydate?:Date
    col_index?:number
    parent_unit_id?:string
    col_page_type?:string
    col_group_name?:string
    col_icon?:string
    tags?:string[]
    
}
export class ControlModel {
    PK_ID: string="";
    COL_NAME?: string;
    COL_DESC?: string;
    COL_TYPE?: string;
    COL_CONTROL_PATH?: string;
    ShowTitle?:boolean ;
    ShowDesc?:boolean ;
    MapValue?:MapValue;
    COL_VIEW_NAME?:string;
    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    BeIncluded?:string;
    ProjectID?:string;
}
export class PageModel {
    ProjectID?:string;
    ID: string | undefined;
    ParentID: string | undefined;
    MenuName: string = '';
    GroupName: string='';
    ICon?:string;    
    MenuDesc: string | undefined;
    Path: string = '';

    MenuPath: string | undefined;
    
    Type: string | undefined;
    
    Items: PageModel[] | undefined;
    Index: number | undefined;
    FullUrl: string = '';
    FirstMenuFullUrl? :string= '';
    ShowBreadcumb:boolean = true;
    ShowTitle:boolean = true;
    ShowControlAffix?:boolean = false;
    GetParent?: Function;
    MapValue?:MapValue;

    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    BeIncluded?:string;

    FindOuputEventMaps?:(runs:Array<FlowRunEntity>,result:any,reloadHandler:Function)=>any[];
}
export class MCPAgentModel{
    ProjectID?:string;
    ID: string | undefined;
    Name:string| undefined;
    Desc:string| undefined;
    Version:string| undefined;
    FullUrl:string| undefined;
    Path:string| undefined;
    Tools:MCPToolModel[]|undefined;
    
    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    BeIncluded?:string;
}
export class TemplateModel{
    ProjectID?:string;
    ID: string | undefined;
    Name:string| undefined;
    Desc:string| undefined;
    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    
    Version:string| undefined;
    Requirements:{Type:'NODE'|'PYTHON',Install:string}[]| undefined;
    CustomFiles:string[]| undefined;
    EnvKeys:EnvModel[] |undefined;
    UnitModels:UnitModel[]|undefined
    
}

export class MCPToolModel{
    ActionID:string|undefined
    ActionName:string|undefined
    ActionDesc:string|undefined
    ToolName:string|undefined
    ToolDesc:string|undefined
    MappingParam:MCPToolParamMappingModel[]|undefined
    AcionModel?:ActionModel
}
export class DBConnectionModel{
    id:string = "";
    config?:DBConnectionInfo
    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    BeIncluded?:string;
    ProjectID?:string
}
export class DBConnectionInfo{
    name?:string;
    desc?:string;
    dbtype?:string;
    server?:string;
    user?:string;
    password?:string;
    database?:string;
    port?:string|number;
    ssl?:string|boolean;
    regdate?:Date;
}

export class ActionModel {
    ProjectID?:string;
    ID:string = "";
    Name:string="";
    Desc?:string;
    Method?:string="GET";
    Inputs?:JsonModel[];
    Return:ReturnModel ={};
    
    Url?:string="";
    SubUrl?:string="";
    
    Regdate?:Date;
    Modifydate?:Date;
    OwnerName?:string;
    ModiferName?:string;
    DataBaseID?:string;
    Code?:string;
    CodeType?:string;
    
    BeIncluded?:string;

    ICon?:string;    
    
    ModelType:"RESTAPI"|"PROC"|"FUNC"|"OCST"|"OPENAI"|"PROMPT"|"SCHD"="PROC";
    //GroupName?:string;
    //IsEdit?:boolean=false;
    //IsInternal?:boolean= false;

    PromptOpenAIID?:string;
    EndPoint?:string;
    ApiKey?:string;
    ApiVersion?:string;
    Deployment?:string;
    SupportOpenAIStream?:boolean;
    Temperature?:number;
    MaxTokens?:number;

    
}
export class ScheduleModel extends ActionModel{
    ScheduleActionID?:string
    ScheduleActionName?:string
    ScheduleSetting?:ScheduleSeting
    IsRun?:boolean
    RunInputs?:any
    
}
export class ScheduleSeting {
    ScheduleType:string="";
    Date?:string;
    Time?:string;
    Day?:number;
    Week?:string;
    IntervalStartTime?:string;
    IntervalEndTime?:string;
    IntervalTime?:number;
    IntervalType?:string;
    

}
export class OrchestrationModel extends ActionModel{
    MapValue?:MapValue;  
    LoopLimitSetting?:KeyValue[]
    static DefaultLoopLimit:number= 2000
}
export interface MapValue{
    FunctionMaps?:FunctionMap[]
    JoinMaps?:JoinMap[]
    ChildItems?:any
}
export interface FunctionMap extends Map{
    ActionID?:string
    ActionType:"Start"|"Code"|"UI"|"UIEDIT"| "UIPOPUP"|"Component"|"End"|"Event"|"Control"|"Message";
    CodeType?:string;
    OutputSelectColumn?:string;
    //code 삭제 예정정
    ConditionalSetting?:Conditional[] 
    JsonParserModel?:ReturnModel;
    JavaScript?:ActionModel;   
    UIActionSetting?:UIActionSetting;
    UIEditSetting?:UIEditModel;
    UIViewSetting?:UIViewModel;
    UIPopupSetting?:UIPopupModel;
    UIEventSetting?:UIEventModel;
    UIMessageSetting?:UIMessageModel;
    CtrlSetting?:CtrlSetting;
    ReRendering?:string;
}
export interface CtrlSetting{
    FK_CONTROL_ID?:string;   
    COL_VIEW_NAME?:string;
    IsBorder?:boolean;
    HeightType?:string;
    SubtractHeight?:number;
    BackgroundColor?:string;
    BorderColor?:string;
    BackgroundColorShape?:number;
    BorderColorShape?:number;
    ControlToControlReloadList?:CtrlReloadModel[]
}

export interface CtrlReloadModel{
    sourceFuncMapID:string
    targetControlMapID:string
    targetMapID:string
}
export interface UIViewModel{
    ControlType?:string;
    OutputCtrls :OutputCtrlModel[];
    
    OutputSetting?:any;//any => 타입에 맞게 수정
    //BindingAction?:BindingActionModel;
    SelectFirstItemWhenDataLoad ?:boolean;
    MultiSelect?:boolean;
        
    TreeParentID:"col_tree_parent_id"
    TreeID:"col_tree_id"
    ChartDisplayID:"col_chart_display_id"
    
    ChatInputMessageID:"col_chat_input_message_id"
    ChatInputRegdateID:"col_chat_input_regdate_id"
    
    
    ChatOutputNameID:"col_chat_output_name_id"
    ChatOutputMessageID:"col_chat_output_message_id"
    ChatOutputRegdateID:"col_chat_output_regdate_id"

    ChatSubtractHeight?:number
    ChatFontSize?:string
}
export interface UIEditModel{
    ControlType?:string;
    InputCtrls: InputCtrlModel[];
    Orientation:"Vertical"|"Horizontal"
    

    AfterClerInputValue?:boolean
}
export interface UIPopupModel{
    ControlType?:"POPUP" | "DRAWER" | "FULLSCRREN"
    DefaultName?:string
    DefaultDesc?:string
    TitleID:"col_title_id"
    DescID:"col_desc_id"
}
export interface UIEventModel{
    EventType?:string;
    EventMapID?:string
    FK_CONTROL_ID?:string
    EventResultModel?:JsonModel[]
}
export interface UIMessageModel{
    ControlType?:'default' | 'error' | 'success' | 'warning' | 'info'
    Message?:string
    MessageID:"col_message_id"
}
export interface UIActionSetting{
    PollingSetting:PollingModel
    ReLoadList:string[]
    IsSocket?:boolean
    SuccessMsg?:string
    ErrorMsg?:string
    SuccessConditional?:Conditional
}

export interface PollingModel{
    IsPolling?:boolean
    IntervalTime?:number;
    IntervalType?:string;
}
export interface BindingActionModel{
    MapID:string,MappingColumn:ColumnMappingModel[]
}
export interface InputCtrlModel2 {
    Key: string;
    
    Value: any|string|number|boolean;
    InputCtrlType: string;
    DisplayName: string;
    
    // SELECTCOLUMN: string;
    DropDownOptions?:KeyValue[]
    GroupName: string;
    //JsonModel:JsonModel
    LookUpSetting?:LookUpSetting
    IsContextMenu?:boolean
    IsMultiUpload?:boolean
}

export interface InputCtrlModel {
    NAME: string;
    VALUE: any|string|number|boolean;
    TYPE: string;
    DISPLAYNAME: string;
    OPTION: string;
    //SELECTCOLUMN: string;
    DropDownOptions?:KeyValue[]
    JsonModel:JsonModel
    ButtonSetting?:ButtonStyle
    EventKey?:string
    LookUpSetting?:LookUpSetting
    IsContextMenu?:boolean
}

export interface OutputCtrlModel{
    COL_DISPLAY_NAME?:string
    COL_COLUMN_NAME:string
    
    COL_URL_KEY?:string
    COL_APPEND_TEXT?:string
    COL_VALUE_TYPE?:string
    COL_LABEL_CSS?:string
    COL_GROUP_NAME?:string
    COL_WIDTH?:number
    COL_BAR_TYPE?:string
    COL_CLASSNAME?:string
    COL_MULTI_VALUE?:OutputCtrlModel[][]
    COL_ICONS?:KeyValue[]
    COL_CONDITIONAL?:CellConditionalItem[]

    ButtonStyle?:ButtonStyle
    EventKey?:string
}
export interface LookUpSetting{
    ActionID?:string
    Inputs?:InputCtrlModel[]
    ValueField?:string
    DisplayField?:string
}
export class Conditional{
    MapID?:string;
    MapName?:string;
    Settings?:ConditionalItem[]
    StrValue?:string
    DisplayValue?:string
    

}
export interface ConditionalItem{
    Column?:string
    DisplayColumn?:string
    ConditionType?:string
    Value?:string
    ValueType?:string
    AndOr?:string
}
export interface CellConditionalItem extends ConditionalItem{
    
    Style:OutputCtrlModel
}
export interface Map{
    PK_ID:string;
    COL_NAME:string;
    COL_DESC:string;
    COL_X:number;
    COL_Y:number;
    COL_COLSPAN:number;
    COL_ROWSPAN:number;
    
    COL_MINROW: number;
    COL_MINCOLUMN: number;
    COL_MAXROW: number;
    COL_MAXCOLUMN: number;    
    COL_WIDTH:any;
    COL_HEIGHT:any;
}
export interface JoinMap{
    FK_START_MAP_ID:string;
    FK_END_MAP_ID:string;
    //SelectColumn?:string//추가
    OutputSelectColumn?:string
    MAPPINGVALUE:ColumnMappingModel[];
    ///Page Setting 에서 사용 
    FunctionMapID?:string;
    Conditional?:Conditional
    DisplayName?:string
    SubDesc?:string
    //Tree Option
    BindingLoadOption?:BindingLoadOption
    IsChatHistory?:boolean

}
export interface BindingLoadOption{
    LoadOption?:string
    MAPPINGVALUE:ColumnMappingModel[];
}
export interface ColumnMappingModel{
    InputColName:string;
    ValueColName:string;
    IsFixed:boolean;
}
export interface MCPToolParamMappingModel extends ColumnMappingModel{
    DisplayName:string
    ValueType:string
    ValueDesc:string
}
export interface ButtonStyle {
    COL_BUTTON_NAME?:string;
    COL_CONFIRM_MESSAGE?:string;
    COL_ICON?:string;
    COL_BUTTON_COLOR?:string;
    
}

export type MuiButtonStyle = {
     variant: 'outlined' | 'contained' | 'text'
     color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' 
}
export class ReturnModel{
    jsonType?:string;
    child?:JsonModel[];
}

export interface KeyValueAndOrgObject {
    key: any;
    value: string;
    orgItem: any | undefined | null;
}

export class KeyValue {
    key: any;
    value?: any;
}
export class EventOption extends KeyValue{
    EventMapID?:string
    FK_CONTROL_ID?:string
    Result?:JsonModel[]
}


export class JsonModel extends KeyValue{
    isFixedValue?:boolean;
    displayName?:string;
    jsonType?:string;
    child?:JsonModel[];
}

export class PromptInputs {
    in_api_key?:string 
    in_azure_endpoint?:string
    in_temperature?:number 
    in_max_tokens?:number 
    in_api_version?:string 
    in_azure_deployment?:string 
    in_prompt_content?:string 
    
    

}


export type OuputEventParams = {
    result:any,
    joinMap:JoinMap,
    reloadHandler:Function
    
    } 
export class FlowRunEntity  {
    ID:string;
    Parent:FlowRunEntity|undefined;
    Map :FunctionMap;
    JoinMap :JoinMap|undefined;
    ActionModel :ActionModel|undefined;
    Items:FlowRunEntity[]=[]
    //Ctrl:any
    constructor(map:FunctionMap,joinMap:JoinMap|undefined,actionModel:ActionModel|undefined,parent:FlowRunEntity|undefined){
        this.ID = joinMap?joinMap.FK_START_MAP_ID+joinMap.FK_END_MAP_ID:"START";
        this.Parent = parent;
        this.Map = map;
        this.JoinMap = joinMap;
        this.ActionModel = actionModel;
        this.Items=[]
        
    }

}
export class DBResult {
result:any|undefined|null;
}
export class RunPathInfo {
    SourcePath?:string;
    RunPath?:string;
}
export interface IDBClient{
    
    Dataset:(spName:string,prams:any)=> Promise<DBResult>;
    Datatable:(spName:string,prams:any)=> Promise<DBResult>;
    Execute:(spName:string,prams:any)=> Promise<DBResult>;
    Scalar:(spName:string,prams:any)=> Promise<DBResult>;
    Query:(code:string,resultType:string)=> Promise<DBResult>;
    Dispose:()=>Promise<void>;
    GetTableList:()=>Promise<DBTableModel[]>;
    GetProcList:()=>Promise<DBTableModel[]>;
}  
export class Dictionary<T>{
    [key:string]:T;
}

export interface IFlowConfiger {
    GetEndPointID:()=>string|undefined;
    GetActionModel:(id:string,prjID:string,userID?:string) => Promise<ActionModel|undefined>;
    GetControlModel:(id:string,prjID:string,userID?:string) => Promise<ControlModel|undefined>;
    GetPageModel:(id:string,prjID:string,userID?:string) => Promise<PageModel|undefined>;
    GetScheduleModel:(id:string,prjID:string,userID?:string) => Promise<ScheduleModel|undefined>;
    GetDBConfigModel:(id:string,prjID:string,userID?:string) => Promise<DBConnectionModel|undefined>;
    GetOpenAIModel:(id:string,prjID:string,userID?:string) => Promise<ActionModel|undefined>;
    GetActionModelsIncludeFlow:(id:string,prjID:string,userID?:string) => Promise<Dictionary<ActionModel>>;
    GetDBClient:(databaseID:string,envs:any[],prjID:string,userID?:string)=> Promise<IDBClient|undefined>;
    GetProjectDefaultEnvs :(usrId:string|undefined,prjID:string|undefined)=>Promise<EnvModel[]>;
    
    
    // WriteLog:(log: LauncherLog, endpointID: string | undefined, projectID: string | undefined,start:Date|undefined,end:Date|undefined) => Promise<void>;
    WriteLog:(log: LauncherLog, endpointID: string | undefined, projectID: string | undefined,start:Date,end:Date) => Promise<void>;
    Clear:()=>Promise<void>;
    CheckReload:()=>Promise<void>;

}

export type ActionParam ={
    actionid:string
    inputs:any
}
export type ActionAuth ={
    prjID:string
userID?:string
token?:string
userToken?:string
}

export type ProfileModel ={
    ID:string;
    Name:string;
    Desc:string;
    IsDefault:boolean;
    EnvList:EnvModel[];
}
export type EnvModel ={
    ID:string
    Key:string;
    Type:string;
    Value:string;
    Desc?:string;
    DefaultValue?:string;
    Index?:number;
}

export type EventModel = {
    ID: string;
    Action: Function;
};

export type DBTableModel = {
    Name:string
    Cols?:DBTableColumn[]
    DBType:string
    Content?:string
}
export type DBTableColumn={
    Name:string
    Type:string
    IsPK:boolean
    IsFK:boolean
    RefTableName?:string
    RefPKColumnName?:string
    Target?:boolean
    Where?:boolean
    Constraint?:string
}



export type EndPoint = {
    pk_id: string 
    col_url: string
    col_name: string
    col_desc: string
    col_endpoint_type: string
    col_regdate:string
    col_modifydate:string
}


export type EndPointDeploy = {
    pk_id: string 
    col_url: string
    col_name: string
    col_desc: string
    col_endpoint_type: string
    col_regdate:string
    col_modifydate:string
}



export class LauncherLog {
    loggingid:any
    parentloggingid:any
    actionid: any|undefined
    name: any
    
    inputlog: any
    resultlog: any
    msglog: any[]
    errlog: any[]
    iserr:boolean
    regdate:string|undefined
    constructor(actionid:any|undefined, name: any) {
        this.parentloggingid = "00000000-0000-0000-0000-000000000000"
        this.loggingid = Guid()
        this.actionid = actionid;
        this.name = name;
        this.inputlog = {}
        this.resultlog = {}
        this.msglog = []
        this.errlog = []
        
        this.iserr =false
    }
}



export interface ICryptoKey {
    GetKey:() => string;
}
