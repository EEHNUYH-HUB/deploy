import { MsSqlClient } from "./db.client.mssql.js";
import { MySqlClient } from "./db.client.mysql.js";
import { PostgreSqlClient } from "./db.client.postgresql.js";
import { ActionAuth, ActionModel, ApplicationModels, ControlModel, DBConnectionInfo, DBConnectionModel, Dictionary, EnvModel, ExportModel, IDBClient, IFlowConfiger, KeyValue, LauncherLog, MCPAgentModel, MCPToolParamMappingModel, OrchestrationModel, PageModel, ProfileModel, ProjectModel, ScheduleModel, TemplateModel, UnitModel } from "./models.js";
import { FlowCommonPath, UnzipFile } from "./util.server";
import fs, { ReadStream } from 'fs'
import { v4 } from 'uuid'
import archiver, { EntryData } from 'archiver';
import path from 'path'
import util from 'util'
import { exec, spawn } from 'child_process'
import FormData from 'form-data';
import axios from 'axios'
import dotenv from "dotenv"
import simpleGit from 'simple-git'
import { BindingGlobalValueDBConnectionInfo } from "./util.server.js";
import { Guid, StringifyAsync } from "./util.common.js";
import { LauncherBase } from "./launcher.base.js";
import { Encrypt } from "./util.crypto.js";
import { LauncherInAndOut } from "./launcher.in.out.js";

dotenv.config();
const execPromise = util.promisify(exec);

export class BuilderConfiger implements IFlowConfiger {

    private static dbClients: Dictionary<IDBClient> = {};
    public DBClient: IDBClient;

    constructor() {
        var config = {
            server: process.env.DBHOST
            , user: process.env.DBUSER
            , password: process.env.DBPASSWORD
            , database: process.env.DBNAME
            , dbtype: process.env.DBTYPE
            , port: process.env.DBPORT ? parseInt(process.env.DBPORT) : 0
            , ssl: process.env.DBSSL ? process.env.DBSSL.toString().toLocaleLowerCase() === "true" : false
        };

        this.DBClient = new PostgreSqlClient(config)


    }

    GetUnitModels = async (userID: string,prjID:string, type?: string) => {
        var resp = await this.DBClient.Datatable("ps_unit_list", { p_user_id: userID,p_project_id:prjID, p_model_type: type ? type : '' });

        return resp?.result;
    }


    GetActionModel = async (actionID: string,prjID:string, userID?: string) => {

        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID};
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = null;
            var respMap = null;
            var respJoin = null;
            var respChild = null;
            var respTools = null;
            if (unitDtl.col_type === 'OCST') {
                resp2 = await this.DBClient.Datatable('ps_flow_detail', param);
                respMap = await this.DBClient.Datatable('ps_map', { p_unit_id: actionID });
                respJoin = await this.DBClient.Datatable('ps_joinmap', { p_unit_id: actionID });
                respChild = await this.DBClient.Datatable('ps_flow_child_list', { p_unit_id: actionID });
            }
            else if (unitDtl.col_type === 'FUNC') {
                resp2 = await this.DBClient.Datatable('ps_function_detail', param);
            }
            else if (unitDtl.col_type === 'PROC') {
                resp2 = await this.DBClient.Datatable('ps_database_detail', param);
            }
            else if (unitDtl.col_type === 'RESTAPI') {
                resp2 = await this.DBClient.Datatable('ps_restapi_detail', param);

            }
            else if (unitDtl.col_type === "PROMPT") {
                resp2 = await this.DBClient.Datatable('ps_prompt_detail', param);
            }
            else if (unitDtl.col_type === "SCHD") {
                resp2 = await this.DBClient.Datatable('ps_schedule_detail', param);
            }

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, respChild, respTools, null, null) as ActionModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }

    GetScheduleModel = async (actionID: string, prjID:string, userID?: string) => {

        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = await this.DBClient.Datatable('ps_schedule_detail', param);
            var respMap = null;
            var respJoin = null;

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, null, null, null, null) as ScheduleModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }
    GetControlModel = async (actionID: string,prjID:string, userID?: string) => {

        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = await this.DBClient.Datatable('ps_control_detail', param);
            var respMap = await this.DBClient.Datatable('ps_map', { p_unit_id: actionID });
            var respJoin = await this.DBClient.Datatable('ps_joinmap', { p_unit_id: actionID });
            var respChild = await this.DBClient.Datatable('ps_flow_child_list', { p_unit_id: actionID });

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, respChild, null, null, null) as ControlModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }
    GetPageModel = async (actionID: string,prjID:string, userID?: string) => {


        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = await this.DBClient.Datatable('ps_page_detail', param);
            var respMap = await this.DBClient.Datatable('ps_map', { p_unit_id: actionID });
            var respJoin = await this.DBClient.Datatable('ps_joinmap', { p_unit_id: actionID });
            var respChild = await this.DBClient.Datatable('ps_flow_child_list', { p_unit_id: actionID });
            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, respChild, null, null, null) as PageModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }
    GetMcpAgentModel = async (actionID: string,prjID:string, userID?: string) => {


        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            

            var resp2 = await this.DBClient.Datatable('ps_mcp_agent_detail', param);
            var respTools = await this.DBClient.Datatable('ps_mcp_tools', { p_unit_id: actionID });

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], null, null, null, respTools, null, null) as MCPAgentModel;

                if (rtn) {
                    rtn.ProjectID = prjID;
                    rtn.BeIncluded = be_included;
                }

                return rtn
            }
        }

        return undefined
    }

    GetTemplateModel = async (templateID: string,prjID:string, userID?: string) => {


        var param = { p_unit_id: templateID, p_user_id: userID,p_project_id:prjID };
        
        
            
            

        var resp2 = await this.DBClient.Datatable('ps_template_detail', param);
        var respTemplateIncludeUnits = await this.DBClient.Datatable('ps_template_include_unit', { p_template_id: templateID });
        var respTemplateIncludeEnvs = await this.DBClient.Datatable('ps_template_include_env', { p_template_id: templateID });

        if (resp2?.result && resp2?.result.length > 0) {
            var rtn = this.ConvertToActionModel(resp2?.result[0], null, null, null, null, respTemplateIncludeUnits, respTemplateIncludeEnvs) as TemplateModel;

            if (rtn) {
                rtn.ProjectID = prjID;

            }

            return rtn
        }
    

        return undefined
    }
    GetDBConfigModel = async (actionID: string, prjID:string, userID?: string) => {

        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = null;
            var respMap = null;
            var respJoin = null;

            resp2 = await this.DBClient.Datatable('ps_database_connection_info_detail', param);

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, null, null, null, null) as DBConnectionModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }
    GetOpenAIModel = async (actionID: string, prjID:string, userID?: string) => {

        var param = { p_unit_id: actionID, p_user_id: userID ,p_project_id:prjID };
        var resp = await this.DBClient.Datatable("ps_unit_detail", param);
        if (resp?.result && resp?.result.length > 0) {
            var unitDtl = resp?.result[0]
            var be_included = unitDtl.be_included;
            
            var resp2 = null;
            var respMap = null;
            var respJoin = null;

            resp2 = await this.DBClient.Datatable('ps_openai_detail', param);

            if (resp2?.result && resp2?.result.length > 0) {
                var rtn = this.ConvertToActionModel(resp2?.result[0], respMap, respJoin, null, null, null, null) as ActionModel;

                if (rtn) {
                    rtn.BeIncluded = be_included;
                    rtn.ProjectID = prjID;
                }

                return rtn
            }
        }

        return undefined
    }
    GetActionModelsIncludeFlow = async (flowID: string,prjID:string, userID?: string) => {
        var rtn: Dictionary<ActionModel> = {}

        var resp = await this.DBClient.Datatable("ps_Flow_Include_unit_ids", { p_unit_id: flowID });


        if (resp?.result && resp?.result.length > 0) {

            for (var i in resp.result) {
                var tmp = resp.result[i];
                if (tmp) {
                    var unitID = tmp.pk_id;
                    if (!rtn[unitID]) {
                        var model = await this.GetActionModel(unitID,prjID, userID);
                        if (model) {
                            rtn[unitID] = model;
                        }
                    }
                }
            }
        }

        return rtn;
    }
    GetPublicApiComponent = async (userID: string,prjID:string) => {
        var resp = await this.DBClient.Datatable("ps_public_api_unit_list", { p_user_id: userID ,p_project_id:prjID});

        return resp?.result;
    }
    SetPublicApiComponent = async (prgId: string, unitId: string, isPublic: boolean) => {
        var resp = await this.DBClient.Datatable("pm_public_api", { p_project_id: prgId, p_unit_id: unitId, p_public: isPublic });

        return resp?.result;
    }

    ConvertToActionModel = (model: any, respMap: any, respJoin: any, respChild: any, respTools: any, respTemplIncludeUnits: any, respTemplIncludeEnvs: any) => {


        if (model) {
            var rtn: any;
            if (model.col_type === "CTRL") {
                rtn =
                {
                    PK_ID: model.pk_id,
                    COL_NAME: model.col_name,
                    COL_DESC: model.col_desc,
                    COL_VIEW_NAME: model.col_view_name,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,

                    COL_TYPE: model.col_control_type,
                    COL_CONTROL_PATH: model.col_control_path,
                    ShowTitle: model.col_show_title,
                    ShowDesc: model.col_show_desc

                }
            }
            else if (model.col_type === "PAGE") {
                rtn =
                {
                    ID: model.pk_id,
                    MenuName: model.col_name,
                    MenuDesc: model.col_desc,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,
                    ICon: model.col_icon ? model.col_icon : "",
                    ParentID: model.parent_unit_id,
                    Path: model.col_path,
                    MenuPath: model.col_menu_path,
                    Level: model.col_level,
                    Type: model.col_page_type,
                    Active: model.col_active,
                    Index: model.col_index,
                    FullUrl: model.col_full_url,
                    FirstMenuFullUrl: model.col_first_menu_path,
                    ShowBreadcumb: model.col_show_breadcrumb,
                    ShowTitle: model.col_show_title,
                    GroupName: model.col_group_name,
                    ShowControlAffix: model.col_show_control_affix
                }
            }
            else if (model.col_type === "DBCONFIG") {

                rtn =
                {
                    id: model.pk_id,
                    config: {
                        name: model.col_name,
                        desc: model.col_desc,
                        dbtype: model.col_db_type,
                        server: model.col_server,
                        user: model.col_user,
                        password: model.col_password,
                        database: model.col_database,
                        port: model.col_port,
                        ssl: model.col_ssl
                    }
                    ,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,

                }
            }
            else if (model.col_type === "CORE") {
                rtn =
                {
                    ID: model.pk_id,
                    Name: model.col_name,
                    Desc: model.col_desc,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,
                    Version: model.col_version,
                    Path: model.col_path,
                }
            }
            else if (model.col_type === "MCP") {
                rtn =
                {
                    ID: model.pk_id,
                    Name: model.col_name,
                    Desc: model.col_desc,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,
                    Version: model.col_version,
                    Path: model.col_path,
                    Index: model.col_index,
                    FullUrl: model.col_full_url,
                    Tools: []

                }

                if (respTools && respTools.result && respTools.result.length > 0) {
                    for (var i in respTools.result) {
                        var tool = respTools.result[i];

                        if (tool) {
                            rtn.Tools.push(
                                {
                                    ActionID: tool.fk_tool_id
                                    , ToolName: tool.col_name ? tool.col_name : tool.unit_name
                                    , ToolDesc: tool.col_desc ? tool.col_desc : tool.unit_desc
                                    , ActionName: tool.unit_name
                                    , ActionDesc: tool.unit_desc
                                    , MappingParam: tool.col_param ? JSON.parse(tool.col_param) : undefined
                                })
                        }
                    }
                }
            }
            else if (model.col_type === "TEMPL") {
                rtn =
                {
                    ID: model.pk_id,
                    Name: model.col_name,
                    Desc: model.col_desc,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,
                    Version: model.col_version,
                    CustomFiles: model.col_custom_file ? JSON.parse(model.col_custom_file) : undefined,
                    Requirements: model.col_requirement ? JSON.parse(model.col_requirement) : undefined,
                    EnvKeys: [],
                    UnitModels: []
                }

                if (respTemplIncludeUnits && respTemplIncludeUnits.result && respTemplIncludeUnits.result.length > 0) {
                    for (var i in respTemplIncludeUnits.result) {
                        var tempUnit = respTemplIncludeUnits.result[i]
                        if (tempUnit) {
                            rtn.UnitModels.push({
                                pk_id: tempUnit.fk_unit_id, col_name: tempUnit.col_name, col_desc: tempUnit.col_desc, col_type: tempUnit.col_type
                            })
                        }
                    }
                }
                if (respTemplIncludeEnvs && respTemplIncludeEnvs.result && respTemplIncludeEnvs.result.length > 0) {

                    for (var i in respTemplIncludeEnvs.result) {
                        var tempEnv = respTemplIncludeEnvs.result[i]
                        if (tempEnv) {
                            rtn.EnvKeys.push({
                                ID: tempEnv.fk_env_key_id
                                , Key: tempEnv.col_key
                                , Type: tempEnv.col_type
                                , Value: ""
                                , Desc: tempEnv.col_desc
                            })
                        }
                    }
                }
            }
            else {
                rtn =
                {
                    ID: model.pk_id,
                    Name: model.col_name,
                    Desc: model.col_desc,
                    ModelType: model.col_type,
                    Regdate: model.col_regdate,
                    Modifydate: model.col_modifydate,
                    OwnerName: model.ownername,
                    ModiferName: model.modifername,
                    Method: model.col_method,
                    Inputs: model.col_input_json ? JSON.parse(model.col_input_json) : undefined,
                    Return: model.col_result_json ? JSON.parse(model.col_result_json) : undefined,
                    Url: model.col_url,
                    SubUrl: model.col_suburl,
                    DataBaseID: model.dbconnection_info_id,
                    Code: model.col_code ? model.col_code : model.col_query_or_sp,
                    CodeType: model.col_language ? model.col_language : model.col_query_type,
                    ICon: model.col_icon ? model.col_icon : "",
                    PromptOpenAIID: model.fk_openai_id,
                    EndPoint: model.col_endpoint,
                    ApiKey: model.col_key,
                    ApiVersion: model.col_version,
                    Deployment: model.col_deployment,
                    Temperature: model.col_temperature,
                    MaxTokens: model.col_max_tokens

                }

                if (model.col_type === "PROMPT") {
                    rtn.Code = model.col_prompt ? model.col_prompt : '// return `프롬프트 Sample ${param}`;\r\nreturn ``';
                    rtn.SupportOpenAIStream = model.col_stream;
                } else if (model.col_type === "SCHD") {
                    rtn.ScheduleActionID = model.fk_action_unit_id
                    rtn.ScheduleActionName = model.actionname
                    rtn.ScheduleSetting = model.col_schedule_setting ? JSON.parse(model.col_schedule_setting) : undefined;
                }
                else if (model.col_type === "OCST") {
                    rtn.LoopLimitSetting = model.col_loop_limit ? JSON.parse(model.col_loop_limit) : undefined;
                }



            }

            if (respMap && respJoin && respMap.result && respJoin.result) {
                rtn.MapValue = { FunctionMaps: [], JoinMaps: [], ChildItems: respChild ? respChild.result : [] }
                for (var i in respMap.result) {
                    var map = respMap.result[i];

                    if (map.mapjson)
                        rtn.MapValue.FunctionMaps.push(JSON.parse(map.mapjson))
                }
                for (var j in respJoin.result) {
                    var jmap = respJoin.result[j];

                    if (jmap.joinmapjson)
                        rtn.MapValue.JoinMaps.push(JSON.parse(jmap.joinmapjson))
                }
            }




            return rtn;
        }
        else {
            return undefined;
        }
    }
    GetDBClient = async (id: string, envs: any[],prjID:string, userID?: string) => {
        if (id) {
            if (BuilderConfiger.dbClients[id]) {
                return BuilderConfiger.dbClients[id];
            }


            var dbConInfo = await this.GetDBConfigModel(id, prjID, userID) as DBConnectionModel;

            if (dbConInfo && dbConInfo.config) {


                if (dbConInfo.config.dbtype === "POSTGRESQL") {
                    BuilderConfiger.dbClients[id] = new PostgreSqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
                else if (dbConInfo.config.dbtype === "MSSQL") {
                    BuilderConfiger.dbClients[id] = new MsSqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
                else if (dbConInfo.config.dbtype === "MYSQL" || dbConInfo.config.dbtype === "MARIADB") {
                    BuilderConfiger.dbClients[id] = new MySqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
            }

            return BuilderConfiger.dbClients[id];
        }
        else return undefined;

    }

    GetProjectDefaultEnvs = async (usrId: string | undefined, prjID: string | undefined) => {
        var resp = await this.DBClient.Datatable("ps_project_default_envs", { p_user_id: usrId, p_project_id: prjID });
        var rtn: EnvModel[] = []
        if (resp && resp.result && resp.result.length > 0) {
            for (var i in resp.result) {
                var env = resp.result[i];
                if (env.envid) {
                    var envModel: EnvModel = {
                        ID: env.envid,
                        Key: env.envkey,
                        Type: env.envtype,
                        Value: env.envvalue,
                        DefaultValue: env.envvalue
                    }
                    rtn.push(envModel);
                }
            }
        }
        return rtn;
    }

   
    GetEnvKeys = async (usrId: string, prjId: string) => {
        var resp = await this.DBClient.Datatable("ps_project_envkeys", { p_user_id: usrId, p_project_id: prjId });
        return resp?.result;
    }
    GetProfileList = async (usrId: string, prjId: string) => {
        var resp = await this.DBClient.Datatable("ps_profile_list", { p_user_id: usrId, p_project_id: prjId });
        return resp?.result;
    }
    GetProfileDetail = async (usrId: string, profileId: string) => {
        var resp = await this.DBClient.Datatable("ps_profile_detail", { p_profile_id: profileId, p_user_id: usrId });

        if (resp && resp.result && resp.result.length > 0) {
            var rtn: ProfileModel = {
                ID: resp.result[0].profileid,
                Name: resp.result[0].profilename,
                Desc: resp.result[0].profiledesc,
                IsDefault: resp.result[0].profiledefault,
                EnvList: []
            }

            for (var i in resp.result) {
                var env = resp.result[i];
                if (env.envid) {
                    var envModel: EnvModel = {
                        ID: env.envid,
                        Key: env.envkey,
                        Type: env.envtype,
                        Value: env.envvalue,
                        Desc: env.envdesc,
                        DefaultValue: env.defaultvalue,
                        Index: env.inx
                    }
                    rtn.EnvList.push(envModel);
                }
            }


            return rtn;
        }

        return undefined;
    }

    UpsertProfile = async (usrId: string, prjId: string, profileId: string, col_name: string, col_desc: string) => {
        await this.DBClient.Execute("pm_upsert_tbl_profile",
            {
                p_pk_id: profileId,
                p_project_id: prjId,
                p_user_id: usrId,
                p_col_name: col_name,
                p_col_desc: col_desc
            });

    }
    DeleteProfile = async (profileId: string, prjId: string, userId: string) => {
        await this.DBClient.Execute("pm_delete_tbl_profile",
            {
                p_pk_id: profileId,
                p_project_id: prjId,
                p_user_id: userId
            });

    }
    UpsertProfileDetail = async (model: ProfileModel, prjId: string, usrId: string) => {

        await this.DBClient.Execute("pm_upsert_tbl_profile_detail",
            {
                prjmodel: JSON.stringify(model),
                p_project_id: prjId,
                p_user_id: usrId
            });

        await this.UpsertCryptoProfileAllData(prjId, usrId);
        if (model.IsDefault) {
            await this.WriteEnv(prjId, await this.GetProjectDefaultEnvs(usrId,prjId));
            await this.Clear()
        }
    }

    UpsertCryptoProfileAllData = async (prjId: string, usrId: string) => {
        var lst = await this.GetProfileList(usrId, prjId)
        if (lst && lst.length > 0) {
            for (var i in lst) {
                var profileId = lst[i].pk_id;
                var dtl = await this.GetProfileDetail(usrId, profileId)
                if (dtl && dtl.EnvList && dtl.EnvList.length > 0) {
                    for (var j in dtl.EnvList) {
                        var envItem = dtl.EnvList[j];
                        if (envItem && envItem.Type === "Password" && envItem.Value) {

                            envItem.Value = Encrypt(envItem.Value)
                        }
                    }

                    await this.DBClient.Execute("pm_upsert_tbl_profile_detail",
                        {
                            prjmodel: JSON.stringify(dtl),
                            p_project_id: prjId,
                            p_user_id: usrId
                        });

                }
            }
        }

    }
    UpsertEnvKey = async (env: EnvModel, prjId: string, usrId: string) => {
        await this.DBClient.Execute("pm_upsert_tbl_env_key",
            {
                p_pk_id: env.ID,
                p_project_id: prjId,
                p_col_key: env.Key,
                p_col_desc: env.Desc,
                p_col_type: env.Type,
                p_col_index: env.Index,
                p_user_id: usrId
            });

        await this.WriteEnv(prjId, await this.GetProjectDefaultEnvs(usrId,prjId));
    }
    DeleteEnvKey = async (envid: string, prjId: string, usrId: string) => {
        await this.DBClient.Execute("pm_delete_tbl_env_key",
            {
                p_pk_id: envid,
                p_project_id: prjId,
                p_user_id: usrId
            });

        await this.WriteEnv(prjId, await this.GetProjectDefaultEnvs(usrId,prjId));
    }


    WriteEnv = async (projectID: string, envs: EnvModel[] | undefined, path?: string) => {


        if (!path) {
            path = FlowCommonPath.GetEnvSettingPath(projectID);
        }

        if (envs) {

            var str = "";
            for (var i in envs) {
                var env = envs[i];
                str += `${env.Key}=${env.Value ? env.Value : env.DefaultValue}\r\n`
            }
            fs.promises.writeFile(path, str);

            return path;
        }
        else {
            return undefined;
        }

    }

    GetUnmanagedProjectList = async (usrId: string) => {
        var resp = await this.DBClient.Datatable("ps_project_unmng_list", { p_user_id: usrId });
        return resp?.result;
    }
    GetProjectList = async (usrId: string) => {
        var resp = await this.DBClient.Datatable("ps_project_list", { p_user_id: usrId });
        return resp?.result;
    }
    GetProjectIncludeUserList = async (prjId: string) => {
        var resp = await this.DBClient.Datatable("ps_project_include_user", { p_project_id: prjId });
        return resp?.result;
    }
    GetProjectExcludeUserList = async (prjId: string) => {
        var resp = await this.DBClient.Datatable("ps_project_not_include_user", { p_project_id: prjId });
        return resp?.result;
    }
    GetProjectDetail = async (usrId: string, prjID: string) => {

        var resp = await this.DBClient.Datatable('ps_project_detail', { p_user_id: usrId, p_project_id: prjID });


        if (resp && resp.result && resp.result.length > 0 && resp.result[0])
            return resp.result[0];
        else
            return undefined;


    }
 
    
    ActiveProject = async (usrId: string, prjId: string) => {
        await this.DBClient.Execute("pm_update_current_project_in_user", { p_user_id: usrId, p_project_id: prjId });
    }
    IncludeProjectUser = async (prjId: string, userId: string, type: string) => {
        await this.DBClient.Execute("pm_upsert_tbl_project_include_user", { p_project_id: prjId, p_user_id: userId, p_col_type: type });
    }
    ExcludeProjectUser = async (prjId: string, userId: string) => {
        await this.DBClient.Execute("pm_delete_project_include_user", { p_project_id: prjId, p_user_id: userId });
    }

    //프로젝트 삭제
    DeleteProject = async (id: string, usrId: string) => {
        var param = {
            p_project_id: id,
            p_user_id: usrId
        }

        //프로젝트 다이내믹 폴더 삭제
        const dynamicPrjPath = FlowCommonPath.GetDir(id);

        await FlowCommonPath.DeleteFolderRecursive(dynamicPrjPath);

        // 아래의 코드는 rock이 걸린 경우 삭제가 안됨
        // await fs.rm(dynamicPrjPath, {recursive:true, force:true}, (err) => {
        //     if (err) {
        //         console.error(`Error occurred while deleting: ${err.message}`);
        //     } else {
        //         console.log('Successfully deleted.');
        //     }
        // });

        //프로젝트 가상환경 삭제
        const delEnvName = await this._deleteProjectCondaEnv(id);



        var rtn = await this.DBClient.Scalar('pm_delete_tbl_project', param);
        return rtn;
    }

    //kbh:프로젝트 생성, 업데이트
    UpsertProject = async (prj: ProjectModel, usrID: string, upsertType: string) => {

        if (!prj.pk_id) {
            prj.pk_id = v4();
        }


        if (upsertType === "INSERT") {
            // 가상환경 clone으로 생성
            // 가상환경 이름은 prj.pk_id
            // prj.pk_id 이름으로 가상환경 생성
            const newEnvName = await this._cloneProjectCondaEnv(prj.pk_id);

        }

        //nodejs 개발 환경 구성
        await this._setNodeJSDevEnvironment(prj.pk_id);

        await this._upsertProjectDB(prj, usrID);
    }

    //프로젝트 정보 DB upsert
    private _upsertProjectDB = async (prj: ProjectModel, usrID: string) => {
        var param = {
            p_pk_id: prj.pk_id
            , p_user_id: usrID
            , p_col_name: prj.col_name
            , p_col_desc: prj.col_desc
            , p_col_env: prj.col_env
            , p_col_layout_json: prj.col_layout_json
            , p_col_login_json: prj.col_login_json
        }
        await this.DBClient.Datatable('pm_upsert_tbl_project', param);
    }

    //chryu: azure devops BuildPipeline manual 호출
    AzureDevops_BuildPipeline = async (build_param: any, usrID: string) => {

        const azure_devops_setting_id = build_param.azure_devops_setting_id;
        const application_zip_fileName = build_param.inputzipFileName;

        var devops_info = await this.DBClient.Datatable("ps_azure_devops_setting_detail", { p_azure_devops_setting_id: azure_devops_setting_id });
        var user_info = await this.DBClient.Datatable("ps_user_detail", { id: usrID });

        if (devops_info && devops_info.result && devops_info.result.length > 0 && devops_info.result[0] && user_info && user_info.result && user_info.result.length > 0 && user_info.result[0]) {

            const organization = devops_info.result[0].col_devops_org;
            const devops_project_name = devops_info.result[0].col_devops_project_name;
            const pipelineId = devops_info.result[0].col_devops_build_pipeline_id;
            const project_id = devops_info.result[0].fk_project_id;
            const pat = devops_info.result[0].col_devops_pat;
            var pipeline_parameter = devops_info.result[0].col_devops_build_pipeline_param;
            pipeline_parameter["inputzipFileName"] = application_zip_fileName;
            pipeline_parameter["inputprojectId"] = project_id;
            pipeline_parameter["inputGitUserEmail"] = user_info.result[0].COL_EMAIL;
            pipeline_parameter["inputGitUserName"] = user_info.result[0].COL_NAME;

            var build_process_cnt = await this.DBClient.Datatable("ps_pipeline_in_progress_count", { p_pipeline_type: 'build', p_project_id: project_id });

            console.log("build_process_cnt", build_process_cnt)

            var cnt = build_process_cnt.result[0].ps_pipeline_in_progress_count

            if (cnt > 0) {
                throw new Error('-100');
            }


            const url = `https://dev.azure.com/${organization}/${encodeURIComponent(devops_project_name)}/_apis/pipelines/${pipelineId}/runs?api-version=6.0`;

            const data = {
                resources: {
                    repositories: {
                        self: {
                            refName: project_id
                        }
                    }
                },
                templateParameters: pipeline_parameter
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
                }
            };

            // Azure DevOps pipeline 호출
            const response = await axios.post(url, data, config);

            const statusCode = response.status;

            if (statusCode == 200 || statusCode == 201) {
                const responseData = response.data
                var param = {
                    p_run_id: responseData.id
                    , p_run_name: responseData.name
                    , p_pipeline_id: responseData.pipeline.id
                    , p_pipeline_name: responseData.pipeline.name
                    , p_pipeline_url: responseData.pipeline.url
                    , p_state: responseData.state
                    , p_result: null
                    , p_created_date: responseData.createdDate
                    , p_finished_date: null
                    , p_run_url: responseData.url
                    , p_template_parameters: responseData.templateParameters
                    , p_fk_run_user_id: usrID
                    , p_fk_project_id: project_id
                    , p_fk_result_update_user_id: usrID
                    , p_fk_azure_devops_setting_id: azure_devops_setting_id
                    , p_response_status: statusCode
                    , p_pipeline_type: "build"
                }
                await this.DBClient.Execute('pm_insert_tbl_project_build_history', param);
            }
            return response
        } else {
            console.log("build-azure_devops_setting_id", azure_devops_setting_id);
            console.log("build-devops_info", devops_info);
            console.log("build-user_info", user_info);
            throw new Error('-200');
        }

    }

    //chryu: azure devops Deploy_Pipeline manual 호출
    AzureDevops_DeployPipeline = async (deploy_param: any, usrID: string) => {

        const azure_devops_setting_id = deploy_param.azure_devops_setting_id;

        var devops_info = await this.DBClient.Datatable("ps_azure_devops_setting_detail", { p_azure_devops_setting_id: azure_devops_setting_id });

        if (devops_info && devops_info.result && devops_info.result.length > 0 && devops_info.result[0]) {

            const organization = devops_info.result[0].col_devops_org;
            const devops_project_name = devops_info.result[0].col_devops_project_name;
            const pipelineId = devops_info.result[0].col_devops_deploy_pipeline_id;
            const project_id = devops_info.result[0].fk_project_id;
            const pat = devops_info.result[0].col_devops_pat;
            var pipeline_parameter = devops_info.result[0].col_devops_deploy_pipeline_param;

            var deploy_process_cnt = await this.DBClient.Datatable("ps_pipeline_in_progress_count", { p_pipeline_type: 'deploy', p_project_id: project_id });

            console.log("deploy_process_cnt", deploy_process_cnt)

            var cnt = deploy_process_cnt.result[0].ps_pipeline_in_progress_count

            if (cnt > 0) {
                throw new Error('-100');
            }

            const url = `https://dev.azure.com/${organization}/${encodeURIComponent(devops_project_name)}/_apis/pipelines/${pipelineId}/runs?api-version=6.0`;

            const data = {
                resources: {
                    repositories: {
                        self: {
                            refName: project_id
                        }
                    }
                },
                templateParameters: {
                    inputprojectId: project_id,
                    inputDevopsProjectName: devops_project_name,
                    inputPipelineName: deploy_param.inputPipelineName,
                    inputBuildId: deploy_param.inputBuildId,
                    inputEnvType: deploy_param.inputEnvType
                }
            };

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
                }
            };

            // Azure DevOps pipeline 호출
            const response = await axios.post(url, data, config);

            const statusCode = response.status;

            console.log(`status code : ${statusCode}`)
            console.log(response.data)

            if (statusCode == 200 || statusCode == 201) {
                const responseData = response.data
                var param = {
                    p_run_id: responseData.id
                    , p_run_name: responseData.name
                    , p_pipeline_id: responseData.pipeline.id
                    , p_pipeline_name: responseData.pipeline.name
                    , p_pipeline_url: responseData.pipeline.url
                    , p_state: responseData.state
                    , p_result: null
                    , p_created_date: responseData.createdDate
                    , p_finished_date: null
                    , p_run_url: responseData.url
                    , p_template_parameters: responseData.templateParameters
                    , p_fk_run_user_id: usrID
                    , p_fk_project_id: project_id
                    , p_fk_result_update_user_id: usrID
                    , p_fk_azure_devops_setting_id: azure_devops_setting_id
                    , p_response_status: statusCode
                    , p_pipeline_type: "deploy"
                }
                await this.DBClient.Execute('pm_insert_tbl_project_build_history', param);
            }
            return response
        } else {
            console.log("deploy-azure_devops_setting_id", azure_devops_setting_id);
            console.log("deploy-devops_info", devops_info)
            throw new Error('-200');
        }

    }

    //chryu: manual 호출된 pipeline의 실행상태를 확인하고 history table에 상태를 update 한다.
    AzureDevops_PipelineBuildStatus = async (status_param: any, usrID: string) => {


        const azure_devops_setting_id = status_param.azure_devops_setting_id;

        var devops_info = await this.DBClient.Datatable("ps_azure_devops_setting_detail", { p_azure_devops_setting_id: azure_devops_setting_id });

        if (devops_info && devops_info.result && devops_info.result.length > 0 && devops_info.result[0]) {
            const buildStatusUrl = status_param.buildStatusUrl;
            const pk_id = status_param.pk_id;
            const pat = devops_info.result[0].col_devops_pat;

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${Buffer.from(`:${pat}`).toString('base64')}`
                }
            };

            // Azure DevOps API 호출
            const response = await axios.get(buildStatusUrl, config);

            const statusCode = response.status;

            if (statusCode == 200 || statusCode == 201) {
                const responseData = response.data
                var param = {
                    p_pk_id: pk_id
                    , p_state: responseData.state
                    , p_result: responseData.result
                    , p_finished_date: responseData.finishedDate
                    , p_fk_result_update_user_id: usrID
                }
                await this.DBClient.Execute('pm_update_tbl_project_build_history', param);
            }

            return response
        } else {
            console.log("devops_info", devops_info)
            return "Error"
        }

    }

    //chryu: AzureDevops Organization Project Repository와 Local Repository와 초기화를 진행한다.
    AzureDevops_RepositoryInit = async (repo_param: any, usrID: string) => {

        const azure_devops_setting_id = repo_param.azure_devops_setting_id;

        var devops_info = await this.DBClient.Datatable("ps_azure_devops_setting_detail", { p_azure_devops_setting_id: azure_devops_setting_id });

        if (devops_info && devops_info.result && devops_info.result.length > 0 && devops_info.result[0]) {

            const organization = devops_info.result[0].col_devops_org;
            const devops_project_name = devops_info.result[0].col_devops_project_name;
            const project_id = devops_info.result[0].fk_project_id;
            const repository = devops_info.result[0].col_devops_project_repository;
            const repository_param = devops_info.result[0].col_devops_project_repository_param;
            const pat = devops_info.result[0].col_devops_pat;

            const branchName = project_id;

            const mainBranchName = repository_param.inputMainBranchName;
            const localRepoRoot = repository_param.inputLocalRepoRoot;

            console.log('branchName', branchName)
            console.log('mainBranchName', mainBranchName)
            console.log('repository_param', repository_param)
            console.log('localRepoRoot', localRepoRoot)

            const localRepoPath = path.resolve(__dirname, `${localRepoRoot}${branchName}`);
            // 디렉토리가 없으면 생성
            if (!fs.existsSync(localRepoPath)) {
                fs.mkdirSync(localRepoPath, { recursive: true });

            }

            const git = simpleGit(path.resolve(__dirname, localRepoPath)); // 로컬 저장소 경로 지정

            //Git 저장소가 초기화되어 있는지 확인하고, 초기화되지 않았다면 초기화
            if (!fs.existsSync(path.join(localRepoPath, '.git'))) {

                await git.init();
            }

            const remote = 'origin'; // 원격 저장소 이름
            // PAT을 사용하여 원격 URL 설정
            const remoteUrl = `https://${pat}:x-oauth-basic@dev.azure.com/${organization}/${encodeURIComponent(devops_project_name)}/_git/${encodeURIComponent(repository)}`;
            // 원격 저장소 목록 확인

            const remotes = await git.getRemotes(true);
            const remoteExists = remotes.some(r => r.name === remote && r.refs.fetch.includes(remoteUrl));

            // 원격 저장소가 등록되어 있지 않으면 추가
            if (!remoteExists) {
                await git.addRemote(remote, remoteUrl);
            } else {
                console.log('already remoteExists');
            }

            // 1. 로컬에 project에 해당하는 branch가 존재할 경우
            const localBranches = await git.branchLocal();

            if (localBranches.all.includes(branchName)) {

                // 1-2. 원격지에 project에 해당하는 branch가 존재하는지 확인
                await git.remote(['update']);
                const remoteBranches = await git.branch(['-r']);
                console.log('remoteBranches : 1-2', remoteBranches);
                const remoteBranchExists = remoteBranches.all.includes(`${remote}/${branchName}`);

                if (remoteBranchExists) {

                    console.log('1-3-1');
                    // 1-3-1. 원격 Project branch로부터 최신 소스를 로컬 branch로 내려 받는다.
                    await git.checkout(branchName);
                    await git.pull(remote, branchName);
                    await git.push(['--set-upstream', remote, branchName]); // 원격에 동일한 브랜치명으로 푸시
                } else {
                    console.log('1-3-2');
                    // 1-3-2. 원격지에 project에 해당하는 branch가 없는 경우
                    const currentBranch = await git.branch();

                    // 현재 체크아웃된 브랜치 확인
                    if (currentBranch.current === branchName) {

                        //# branch삭제를 위해 로컬 temp branch 생성
                        await git.checkoutLocalBranch("temp");

                    }
                    await git.branch(['-D', branchName]); // 로컬 브랜치 삭제
                    await git.checkoutLocalBranch(branchName); // 새로운 로컬 브랜치 생성
                    await git.pull(remote, mainBranchName);

                    await git.push(['--set-upstream', remote, branchName]); // 원격에 동일한 브랜치명으로 푸시
                }
            } else {
                // 2. 로컬에 project에 해당하는 branch가 없는 경우

                // 2-2. 원격지에 project에 해당하는 branch가 존재하는지 확인
                await git.remote(['update']);
                const remoteBranches = await git.branch(['-r']);
                console.log('remoteBranches : 2-2', remoteBranches);
                const remoteBranchExists = remoteBranches.all.includes(`${remote}/${branchName}`);

                console.log(remoteBranches);

                if (remoteBranchExists) {

                    console.log('2-3-1');
                    // 2-3-1. 원격 Project branch로부터 최신 소스를 로컬 branch로 내려 받는다.
                    await git.checkoutLocalBranch(branchName);
                    await git.pull(remote, branchName);
                    await git.push(['--set-upstream', remote, branchName]); // 원격에 동일한 브랜치명으로 푸시
                } else {

                    // 2-3-2. 원격지에 project에 해당하는 branch가 없는 경우
                    console.log('2-3-2');
                    await git.checkoutLocalBranch(branchName);
                    await git.pull(remote, mainBranchName);
                    await git.push(['--set-upstream', remote, branchName]); // 원격에 동일한 브랜치명으로 푸시
                }
            }
            return "SUCCESS"
        } else {
            console.log("devops_info", devops_info)
            return "Error"
        }

    }

    //chryu: azure devops pipline을 통해 배포를 하기위한 azure_devops_setting 정보를 관리한다.
    AzureDevops_Setting = async (azure_devops_setting_param: any, usrID: string) => {

        const pk_id = azure_devops_setting_param.pk_id;
        const col_devops_setting_display_name = azure_devops_setting_param.col_devops_setting_display_name;
        const col_devops_deploy_target_type = azure_devops_setting_param.col_devops_deploy_target_type;
        const col_devops_org = azure_devops_setting_param.col_devops_org;
        const col_devops_pat = azure_devops_setting_param.col_devops_pat;
        const col_devops_project_name = azure_devops_setting_param.col_devops_project_name;
        const col_devops_project_repository = azure_devops_setting_param.col_devops_project_repository;
        const col_devops_project_repository_param = azure_devops_setting_param.col_devops_project_repository_param;
        const fk_devops_build_pipeline_id = azure_devops_setting_param.fk_devops_build_pipeline_id;
        const fk_devops_deploy_pipeline_id = azure_devops_setting_param.fk_devops_deploy_pipeline_id;
        const fk_project_id = azure_devops_setting_param.fk_project_id;

        var param = {
            p_pk_id: pk_id
            , p_col_devops_setting_display_name: col_devops_setting_display_name
            , p_col_devops_deploy_target_type: col_devops_deploy_target_type
            , p_col_devops_org: col_devops_org
            , p_col_devops_pat: col_devops_pat
            , p_col_devops_project_name: col_devops_project_name
            , p_col_devops_project_repository: col_devops_project_repository
            , p_col_devops_project_repository_param: col_devops_project_repository_param
            , p_fk_devops_build_pipeline_id: fk_devops_build_pipeline_id
            , p_fk_devops_deploy_pipeline_id: fk_devops_deploy_pipeline_id
            , p_fk_project_id: fk_project_id
            , p_fk_owner_user_id: usrID
            , p_fk_modifier_user_id: usrID
        }

        await this.DBClient.Execute('pm_upsert_tbl_azure_devops_setting', param);

    }

    //chryu: azure devops pipline을 통해 배포를 하기위한 azure_devops_pipeline_setting 정보를 관리한다.
    AzureDevops_Pipeline_Setting = async (azure_devops_pipeline_setting_param: any, usrID: string) => {

        const pk_id = azure_devops_pipeline_setting_param.pk_id;
        const col_pipeline_id = azure_devops_pipeline_setting_param.col_pipeline_id;
        const col_pipeline_type = azure_devops_pipeline_setting_param.col_pipeline_type;
        const col_pipeline_display_name = azure_devops_pipeline_setting_param.col_pipeline_display_name;
        const col_pipeline_description = azure_devops_pipeline_setting_param.col_pipeline_description;
        const col_pipeline_param = azure_devops_pipeline_setting_param.col_pipeline_param;

        var param = {
            p_pk_id: pk_id
            , p_pipeline_id: col_pipeline_id
            , p_pipeline_type: col_pipeline_type
            , p_pipeline_display_name: col_pipeline_display_name
            , p_pipeline_description: col_pipeline_description
            , p_pipeline_param: col_pipeline_param
            , p_fk_owner_user_id: usrID
            , p_fk_modifier_user_id: usrID
        }
        await this.DBClient.Execute('pm_upsert_tbl_azure_devops_pipeline_setting', param);

    }


    SetLayoutSetting = async (usrId: string, prjId: string, str: string) => {
        await this.DBClient.Execute('pm_update_tbl_project_layout', { p_pk_id: prjId, p_user_id: usrId, p_layout_json: str });
    }

    SetDBConfig = async (prjID: string, userID: string, id: string, config: DBConnectionInfo) => {
        await this._upsertDBCon(prjID, userID, id, config);

    }
    SetActionModel = async (prjID: string, userID: string, actionModel: ActionModel) => {

        if (!actionModel.ID) {
            actionModel.ID = v4();
        }


        await this._upsertComponent(prjID, userID, actionModel);

        if (actionModel.CodeType === "python" || actionModel.CodeType === "nodejs") {
            await this._writeActionCode(prjID, actionModel);
        }


    }
    SetCtrlModel = async (prjID: string, userID: string, ctrlModel: ControlModel) => {

        if (!ctrlModel.PK_ID) {
            ctrlModel.PK_ID = v4();
        }

        await this._upsertControl(prjID, userID, ctrlModel);
    }
    SetPageModel = async (prjID: string, userID: string, pageModel: PageModel) => {

        if (!pageModel.ID) {
            pageModel.ID = v4();
        }
        await this._upsertPage(prjID, userID, pageModel);
    }
    SetMcpAgentModel = async (prjID: string, userID: string, model: MCPAgentModel) => {

        if (!model.ID) {
            model.ID = v4();
        }
        await this._upsertMcpAgent(prjID, userID, model)
    }
    UpsertMcpToolModel = async (agentid: string, toolid: string, toolname: string, tooldesc: string, param: any) => {
        await this.DBClient.Execute('pm_upsert_mcp_tool_map',
            {
                p_agent_id: agentid
                , p_tool_id: toolid
                , p_col_name: toolname
                , p_col_desc: tooldesc
                , p_col_param: param ? JSON.stringify(param) : null
            });
    }
    UpsertTemplateModel = async (prjID: string, userID: string, model: TemplateModel) => {
        if (!model.ID) {
            model.ID = v4();
        }
        await this.DBClient.Execute('pm_upsert_tbl_template',
            {
                p_project_id: prjID
                , p_unit_id: model.ID
                , p_col_version: model.Version
                , p_col_requirement: model.Requirements ? JSON.stringify(model.Requirements) : null
                , p_col_custom_file: model.CustomFiles ? JSON.stringify(model.CustomFiles) : null
                , p_user_id: userID
                , p_col_name: model.Name
                , p_col_desc: model.Desc
                , p_col_icon: ""
            });
    }
    InsertTemplateIncludeUnit = async (templid: string, unitid: string) => {
        await this.DBClient.Execute('pm_insert_delete_tbl_template_include_unit',
            {
                p_template_id: templid
                , p_unit_id: unitid
                , p_gubun: "INSERT"
            });
    }
    DeleteTemplateIncludeUnit = async (templid: string, unitid: string) => {
        await this.DBClient.Execute('pm_insert_delete_tbl_template_include_unit',
            {
                p_template_id: templid
                , p_unit_id: unitid
                , p_gubun: "DELETE"
            });
    }
     InsertTemplateIncludeAllUnit = async (templid: string) => {
        await this.DBClient.Execute('pm_insert_delete_tbl_template_include_allunit',
            {
                p_template_id: templid
                , p_gubun: "INSERT"
            });
    }
    DeleteTemplateIncludeAllUnit = async (templid: string) => {
        await this.DBClient.Execute('pm_insert_delete_tbl_template_include_allunit',
            {
                p_template_id: templid
                , p_gubun: "DELETE"
            });
    }

    DeleteMcpToolModel = async (agentid: string, toolid: string) => {
        await this.DBClient.Execute('pm_delete_mcp_tool_map', { p_agent_id: agentid, p_tool_id: toolid });
    }
    DelActionModel = async (prjID: string, unitID: string, onCompleted: fs.NoParamCallback) => {


        await this.DBClient.Execute('pm_delete_tbl_unit', { p_unit_id: unitID });


        this._deleteActionCode(prjID, unitID, onCompleted);

    }

    DelCoreFile = async (usrId: string, unitID: string,prjID:string) => {


        var resp = await this.DBClient.Datatable('ps_core_detail', { p_unit_id: unitID, p_user_id: usrId ,p_project_id:prjID})

        if (resp && resp.result && resp.result.length > 0) {
            await this.DBClient.Execute('pm_delete_tbl_unit', { p_unit_id: unitID });
            var path = resp.result[0].col_path;


            if (fs.existsSync(path)) {
                fs.unlinkSync(path);
            }
        }




    }

    private _upsertDBCon = async (prjID: string, usrID: string, id: string, config: DBConnectionInfo) => {
        var param = {
            p_project_id: prjID
            , p_unit_id: id
            , p_db_type: config.dbtype
            , p_server: config.server
            , p_user: config.user
            , p_password: config.password
            , p_database: config.database
            , p_port: config.port
            , p_ssl: config.ssl
            , p_user_id: usrID
            , p_col_name: config.name
            , p_col_desc: config.desc
            , p_col_icon: ""
        }


        await this.DBClient.Execute('pm_upsert_tbl_database_connection_info', param);
        await this.Clear()
    }

    private _upsertComponent = async (prjID: string, usrID: string, actionModel: ActionModel) => {

        var param;
        var spName;
        if (actionModel.ModelType === 'OCST') {
            var flowModel = actionModel as OrchestrationModel;
            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_col_input_json: actionModel.Inputs ? JSON.stringify(actionModel.Inputs) : ''
                , p_col_result_json: actionModel.Return ? JSON.stringify(actionModel.Return) : ''
                , p_map_json: flowModel.MapValue?.FunctionMaps ? JSON.stringify(flowModel.MapValue?.FunctionMaps) : ''
                , p_joinmap_json: flowModel.MapValue?.JoinMaps ? JSON.stringify(flowModel.MapValue?.JoinMaps) : ''
                , p_col_loop_limit: flowModel.LoopLimitSetting ? JSON.stringify(flowModel.LoopLimitSetting) : ''
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }
            spName = 'pm_upsert_tbl_flow';
        }
        else if (actionModel.ModelType === 'FUNC') {

            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_col_language: actionModel.CodeType
                , p_col_input_json: actionModel.Inputs ? JSON.stringify(actionModel.Inputs) : ''
                , p_col_result_json: actionModel.Return ? JSON.stringify(actionModel.Return) : ''
                , p_col_code: actionModel.Code
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }

            spName = 'pm_upsert_tbl_function';
        }
        else if (actionModel.ModelType === 'PROC') {

            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_dbconnection_info_id: actionModel.DataBaseID
                , p_col_query_type: actionModel.CodeType
                , p_col_input_json: actionModel.Inputs ? JSON.stringify(actionModel.Inputs) : ''
                , p_col_result_json: actionModel.Return ? JSON.stringify(actionModel.Return) : ''
                , p_col_query_or_sp: actionModel.Code
                , p_col_method: actionModel.Method ? actionModel.Method : "Datatable"
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }

            spName = 'pm_upsert_tbl_database';
        }
        else if (actionModel.ModelType === 'RESTAPI') {

            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_col_url: actionModel.Url
                , p_col_suburl: actionModel.SubUrl
                , p_col_method: actionModel.Method
                , p_col_input_json: actionModel.Inputs ? JSON.stringify(actionModel.Inputs) : ''
                , p_col_result_json: actionModel.Return ? JSON.stringify(actionModel.Return) : ''
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }

            spName = 'pm_upsert_tbl_restapi';
        }
        else if (actionModel.ModelType === 'PROMPT') {

            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_openai_id: actionModel.PromptOpenAIID ? actionModel.PromptOpenAIID : null
                , p_col_prompt: actionModel.Code
                , p_col_input_json: actionModel.Inputs ? JSON.stringify(actionModel.Inputs) : ''
                , p_col_result_json: actionModel.Return ? JSON.stringify(actionModel.Return) : ''
                , p_col_stream: actionModel.SupportOpenAIStream
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : "openai"
            }

            spName = 'pm_upsert_tbl_prompt';
        }
        else if (actionModel.ModelType === 'OPENAI') {

            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_endpoint: actionModel.EndPoint
                , p_key: actionModel.ApiKey
                , p_version: actionModel.ApiVersion
                , p_deployment: actionModel.Deployment
                , p_temperature: actionModel.Temperature ? actionModel.Temperature : 0.0
                , p_max_tokens: actionModel.MaxTokens ? actionModel.MaxTokens : 4096
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }
            spName = 'pm_upsert_tbl_openai';
        }
        else if (actionModel.ModelType === 'SCHD') {

            var schdModel = actionModel as ScheduleModel;
            param = {
                p_project_id: prjID
                , p_unit_id: actionModel.ID
                , p_action_unit_id: schdModel.ScheduleActionID
                , p_schedule_setting_json: schdModel.ScheduleSetting ? JSON.stringify(schdModel.ScheduleSetting) : ''
                , p_user_id: usrID
                , p_col_name: actionModel.Name
                , p_col_desc: actionModel.Desc
                , p_col_icon: actionModel.ICon ? actionModel.ICon : ""
            }
            spName = 'pm_upsert_tbl_schedule';
        }

        if (spName)
            await this.DBClient.Execute(spName, param);

    }
    private _upsertControl = async (prjID: string, usrID: string, ctrl: ControlModel) => {
        var param = {
            p_project_id: prjID
            , p_unit_id: ctrl.PK_ID
            , p_col_control_type: ctrl.COL_TYPE
            , p_col_control_path: ctrl.COL_CONTROL_PATH
            , p_col_show_title: ctrl.ShowTitle
            , p_col_show_desc: ctrl.ShowDesc
            , p_col_view_name: ctrl.COL_VIEW_NAME ? ctrl.COL_VIEW_NAME : ""
            , p_map_json: ctrl.MapValue?.FunctionMaps ? JSON.stringify(ctrl.MapValue?.FunctionMaps) : ''
            , p_joinmap_json: ctrl.MapValue?.JoinMaps ? JSON.stringify(ctrl.MapValue?.JoinMaps) : ''
            , p_user_id: usrID
            , p_col_name: ctrl.COL_NAME
            , p_col_desc: ctrl.COL_DESC
            , p_col_icon: ""
        }
        await this.DBClient.Execute('pm_upsert_tbl_control', param);
    }

    private _upsertPage = async (prjID: string, usrID: string, page: PageModel) => {



        var param = {
            p_project_id: prjID
            , p_unit_id: page.ID

            , p_parent_unit_id: page.ParentID ? page.ParentID : "00000000-0000-0000-0000-000000000000"
            , p_col_path: page.Path
            , p_col_menu_path: page.MenuPath
            , p_col_full_url: page.FullUrl
            , p_col_first_menu_path: page.FirstMenuFullUrl
            , p_col_level: -1
            , p_col_page_type: page.Type
            , p_col_active: true
            , p_col_show_title: page.ShowTitle
            , p_col_show_breadcrumb: page.ShowBreadcumb
            , p_col_index: page.Index
            , p_col_group_name: page.GroupName
            , p_col_show_control_affix: page.ShowControlAffix
            , p_map_json: page.MapValue?.FunctionMaps ? JSON.stringify(page.MapValue?.FunctionMaps) : ''
            , p_joinmap_json: page.MapValue?.JoinMaps ? JSON.stringify(page.MapValue?.JoinMaps) : ''
            , p_user_id: usrID
            , p_col_name: page.MenuName
            , p_col_desc: page.MenuDesc
            , p_col_icon: page.ICon

        }
        await this.DBClient.Execute('pm_upsert_tbl_page', param);
    }

    private _upsertMcpAgent = async (prjID: string, usrID: string, mcpAgent: MCPAgentModel) => {



        var param = {
            p_project_id: prjID
            , p_unit_id: mcpAgent.ID
            , p_col_version: mcpAgent.Version
            , p_col_path: mcpAgent.Path
            , p_col_full_url: mcpAgent.FullUrl
            , p_user_id: usrID
            , p_col_name: mcpAgent.Name
            , p_col_desc: mcpAgent.Desc
            , p_col_icon: ""

        }
        await this.DBClient.Execute('pm_upsert_tbl_mcp_agent', param);
    }


    public async WriteCoreList(prjID: string, usrID: string, files: KeyValue[], onMessage: Function) {

        if (files && files.length > 0) {
            for (var i in files) {
                var source = files[i]
                if (source) {
                    var extname = path.extname(source.key)?.toLocaleLowerCase()
                    const fileNameWithoutExt = path.basename(source.value, path.extname(source.value));

                    var actionCode = ""
                    if (extname === '.py') {
                        actionCode = "python";

                    }
                    else if (extname === '.js') {
                        actionCode = "nodejs";

                    }

                    if (actionCode) {
                        var pathObj = FlowCommonPath.GetRunPath(prjID, fileNameWithoutExt, actionCode)
                        var target = pathObj.SourcePath;

                        if (!fs.existsSync(source.key)) {
                            return;
                        }

                        // 대상 파일이 존재하는 경우 삭제
                        if (fs.existsSync(target)) {
                            fs.unlinkSync(target);
                        }

                        await fs.promises.rename(source.key, target);

                        await this._upsertCoreFile(prjID, target, source.value, usrID)
                        onMessage(true, `${source.value}파일을 성공적으로 업로드 하였습니다.`)
                    }
                    else {
                        onMessage(false, `${source.value}파일은 대상 파일이 아닙니다.`)
                        if (fs.existsSync(source.key)) {
                            fs.unlinkSync(source.key);
                        }
                    }

                }
            }
        }



    }
    private _writeActionCode = async (prjID: string, actionModel: ActionModel) => {
        var pathObj = FlowCommonPath.GetRunPath(prjID, actionModel.ID, actionModel.CodeType)
        var fullPath = pathObj.SourcePath;


        if (actionModel.CodeType === "python") {

            await this._writePythonLauncher(prjID)
            var appendCode = '\r\n';


            appendCode += `def flsend(str):\r\n`
            appendCode += `    print('@fl:'+str,end='', flush=True)\r\n`;
            appendCode += `def flstate(str):\r\n`
            appendCode += `    print('@flsts:'+str,end='', flush=True)\r\n`;
            appendCode += `async def run(argParamObj,global_instance):\r\n`


            if (actionModel.Inputs && actionModel.Inputs.length > 0) {
                for (var i in actionModel.Inputs) {
                    var key = actionModel.Inputs[i].key;
                    appendCode += `    ${key} = argParamObj['${key}']\r\n`;
                }
            }
            appendCode += `    ${actionModel.Code?.replaceAll('\r\n', '\r\n    ')}\r\n`;


        }
        else {
            await this._writeNodeJsLauncher(prjID)

            var appendCode = `\r\n`;

            appendCode += `const flsend =(str)=>{\r\n`
            appendCode += `    console.log('@fl:'+str)\r\n`;
            appendCode += `}\r\n`;

            appendCode += `const flstate =(str)=>{\r\n`
            appendCode += `    console.log('@flsts:'+str)\r\n`;
            appendCode += `}\r\n`;

            appendCode += `const run = async (argParamObj,global_instance)=>{\r\n`;
            if (actionModel.Inputs && actionModel.Inputs.length > 0) {
                for (var i in actionModel.Inputs) {
                    var key = actionModel.Inputs[i].key;
                    appendCode += `      var ${key} = argParamObj.${key};\r\n`;
                }
            }
            appendCode += `${actionModel?.Code}\r\n`;
            appendCode += `}\r\n\r\n`;

            appendCode += `module.exports.run = run;\r\n\r\n`;




        }
        await fs.promises.writeFile(fullPath, appendCode);
    }

    private _writeNodeJsLauncher = async (prjID: string) => {
        var pathObj = FlowCommonPath.GetNodejsPath(prjID, "launcher")

        if (!fs.existsSync(pathObj)) {
            var appendCode = `
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { zencDelegator } = require('../../../zencDelegator');
require('dotenv').config({path:'${FlowCommonPath.GetEnvSettingPath(prjID)}'});
var zencInstance = new zencDelegator();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let isProcessing = false;
let isExit = false
async function processCommand(input) {
    isProcessing= true;
    const args = input.split(' ');
    const command = args[0];
    const id = args[1];
    try {
        const argParamObj = await zencInstance.getParams(id);\r\n`;
            appendCode += '    const mathModule = await import(`./${command}.js`); \r\n';
            appendCode += `   const result = await mathModule.run(argParamObj, zencInstance.global_instance);
        await zencInstance.sendResult(id, result);
    } catch (error) {
        const errorMessage = error.message;
        await zencInstance.sendError(id, errorMessage);
    } finally {
        process.stdout.write("COMP-3e80024b-baca-4903-ac87-f0cb9284bb1e");
        isProcessing = false
        if (isExit) {
            rl.close();
        }
    }
}
        
rl.on('line', async (input) => {
    input = input?.trim()
    if (input === 'exit') {
        if(!isProcessing){
            rl.close();
        }
        else{
            isExit = true
        }
        return;
    }
    await processCommand(input);
});

rl.on('close', () => {
    process.exit(0);
});\r\n`;

            await fs.promises.writeFile(pathObj, appendCode);
        }
    }

    private _writePythonLauncher = async (prjID: string) => {
        var pathObj = FlowCommonPath.GetPythonPath(prjID, "launcher")

        if (!fs.existsSync(pathObj)) {

            var appendCode = `
import os
import sys
import asyncio
import importlib
from dotenv import load_dotenv
load_dotenv('${FlowCommonPath.GetEnvSettingPath(prjID)}')
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))))
from zencDelegator import zencDelegator
zencInstance = zencDelegator()
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

def process_command(strArg):
    args = strArg.split() 
    command = args[0] 
    id = args[1] 
    try:    
        argParamObj = zencInstance.getParams(id) 
        math_module = importlib.import_module(command) 
        result = loop.run_until_complete(math_module.run(argParamObj, zencInstance.global_instance)) 
        zencInstance.sendResult(id, result) 
    except :
        zencInstance.sendError2(id, command) 
    finally:            
        print("${LauncherBase.EndCompCode}",end='')    
        sys.stdout.flush()   
if __name__ == "__main__":
    while True:
        input_data = sys.stdin.readline().strip()
        if input_data == "exit":
            loop.close()
            break
        process_command(input_data)
`;
            await fs.promises.writeFile(pathObj, appendCode);
        }

    }
    private _deleteActionCode = (prjID: string, id: string, onCompleted: fs.NoParamCallback) => {

        var path = FlowCommonPath.GetPythonPath(prjID, id)
        if (fs.existsSync(path)) {
            fs.unlink(path, onCompleted);
        }
        else {
            path = FlowCommonPath.GetNodejsPath(prjID, id);
            if (fs.existsSync(path)) {
                fs.unlink(path, onCompleted);
            }
            else {
                onCompleted(null)
            }
        }
    }

    Clear = async () => {
        for (var i in BuilderConfiger.dbClients) {
            await BuilderConfiger.dbClients[i]?.Dispose();
        }
        BuilderConfiger.dbClients = {};

    }

    CheckReload = async () => {

    }

    public Reset = async (usrID: string, prjID: string, progress: (msg: any) => void) => {

        var chk: boolean = await this._checkCloneProjectCondaEnv(prjID)
        if (chk) {
            progress("이미 가상 환경이 존재 합니다.")
        }
        else {
            progress("가상 환경을 생성중 입니다.")
            await this._cloneProjectCondaEnv(prjID)
        }



        progress("환경변수 정보를 가지고 오는중 입니다.")
        var r = await this.GetProjectDetail(usrID,prjID);

        if (r) {

            this.WriteEnv(prjID, r.col_env)
            progress("환경변수 정보를 생성 하였습니다.")
        }


        progress("모델 정보를 가지고 오는중 입니다.")
        var units = await this.GetUnitModels(usrID,prjID, undefined);
        if (units) {

            for (var i in units) {



                var unit = units[i]
                if (unit.col_type === "FUNC") {

                    var actionTmp = await this.GetActionModel(unit.pk_id,prjID, usrID);

                    if (actionTmp) {
                        if (actionTmp.CodeType === "python" || actionTmp.CodeType === "nodejs") {
                            await this._writeActionCode(prjID, actionTmp);
                        }
                    }
                    progress(`${actionTmp?.Name} 기능을 생성 하였습니다.`)

                }

            }


        }
    }

    public EndPointConnection = async (url: string) => {

        try {

            var newUrl = `${url}/builder/connection`;

            var r = await axios.get(newUrl)

            return r.data === "OK";
        }
        catch (ex) {
            console.log(ex)
            return false;
        }

    }
    private _WriteDeployHistory = async (endpointID: string, projectID: string, userId: string, logLvl: string, profileName: string | undefined, rcode: string, msg: string | undefined) => {
if(endpointID){
        await this.DBClient.Execute("pm_insert_tbl_endpoint_deploy_history", {
            p_fk_endpoint_id: endpointID
            , p_fk_project_id: projectID
            , p_col_user_id: userId
            , p_col_log_level: logLvl ? logLvl : ""
            , p_col_profile_name: profileName ? profileName : ""
            , p_col_result_code: rcode ? rcode : ""
            , p_col_result_message: msg ? msg : ""
        });
    }
    }

    public Deploy = async (usrID: string
        , projectID: string
        , endpointID: string
        , profileID: string
        , loggingLvl: string
        , loggingurl: string
        , deployType: "DEPLOY" | "PACKAGE"
        , progress: (type: "start" | "collection" | "create" | "send" | "apply" | "end" | "error", msg: any, percent: number) => void) => {



        var compressPath = undefined;
        try {
            progress("start", "배포가 시작 되었습니다.", 0)
            var endpointUrl = "";
            if (deployType === "DEPLOY") {
                var data = await this.DBClient.Datatable("ps_endpoint_list", undefined);

                if (data?.result && data.result.length > 0) {
                    var arr: any[] = data.result;
                    var endPointObj = arr.find(x => x.pk_id === endpointID)
                    if (endPointObj && endPointObj.col_url) {
                        endpointUrl = endPointObj.col_url

                        if (await this.EndPointConnection(endpointUrl) === false) {
                            progress("error", "Endpoint Url 정보가 잘못됐습니다.", 0)
                            this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, "", "ERROR", "Endpoint Url 정보가 잘못됐습니다")
                            return;
                        }
                    }
                    else {
                        progress("error", "Endpoint 정보를 가지고 올수 없습니다.", 0)
                        this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, "", "ERROR", "Endpoint 정보를 가지고 올수 없습니다")
                        return;
                    }


                }
            }


            var prjDtl = await this.GetProjectDetail(usrID, projectID);
            if (prjDtl) {

                
                var profile: ProfileModel | undefined = await this.GetProfileDetail(usrID, profileID)


                if (profile && profile.EnvList) {
                    for (var i in profile.EnvList) {
                        var env = profile.EnvList[i];
                        if (!env.Value && env.DefaultValue)
                            profile.EnvList[i].Value = env.DefaultValue;

                    }
                }

                progress("collection", "프로젝트 정보를 가지고 오는중 입니다.", 0)
                var units = await this.GetUnitModels(usrID, projectID, undefined);
                var publicUnits: UnitModel[] = await this.GetPublicApiComponent(usrID, projectID);
                var ids = publicUnits?.map(unit => ({ key: unit.pk_id }));

                progress("collection", "모델 정보를 가지고 오는중 입니다.", 0)

                if (units) {
                    var appModel: ApplicationModels = {
                        ProjectID: projectID,
                        ProjectName: prjDtl.col_name,
                        ProjectDesc: prjDtl.col_desc,
                        EndPointID: endpointID,
                        LoggingUrl: loggingurl,
                        LoggingLvl: loggingLvl,
                        ActionModels: [],
                        ControlModels: [],
                        PageModels: [],
                        MCPAgents: [],
                        DBConfigModels: [],
                        ScheduleModels: [],
                        Profile: profile,
                        PublicActionModelKeys: ids,
                        Layout: JSON.parse(prjDtl.col_layout_json),
                        Login: prjDtl.col_login_json ? JSON.parse(prjDtl.col_login_json) : {},
                        Update: Date.now()
                    };

                    appModel.Layout.Update = appModel.Update;
                    appModel.Layout.ProjectID = appModel.ProjectID;
                    appModel.Layout.ProjectName = appModel.ProjectName;
                    appModel.Layout.ProjectDesc = appModel.ProjectDesc;

                    var totalCnt = units.length;

                    for (var i in units) {

                        var index = parseInt(i);
                        var unit = units[i]
                        if (unit.col_type === "CTRL") {

                            var ctrlTmp = await this.GetControlModel(unit.pk_id, projectID, usrID);
                            if (ctrlTmp) {
                                appModel.ControlModels.push(ctrlTmp)
                            }
                        }
                        else if (unit.col_type === "PAGE") {
                            var pageTmp = await this.GetPageModel(unit.pk_id, projectID, usrID);
                            if (pageTmp) {
                                appModel.PageModels.push(pageTmp)
                            }
                        }
                        else if (unit.col_type === "DBCONFIG") {
                            var dbConTmp = await this.GetDBConfigModel(unit.pk_id, projectID, usrID);
                            if (dbConTmp) {
                                appModel.DBConfigModels.push(dbConTmp)
                            }
                        }
                        else if (unit.col_type === "SCHD") {
                            var actionTmp = await this.GetActionModel(unit.pk_id, projectID, usrID);
                            if (actionTmp) {
                                appModel.ScheduleModels.push(actionTmp as ScheduleModel)
                            }
                        }
                        else if (unit.col_type === "MCP") {
                            var mcpTmp = await this.GetMcpAgentModel(unit.pk_id, projectID, usrID);
                            if (mcpTmp) {
                                appModel.MCPAgents.push(mcpTmp as MCPAgentModel)
                            }
                        }
                        else {
                            var actionTmp = await this.GetActionModel(unit.pk_id, projectID, usrID);
                            if (actionTmp) {
                                appModel.ActionModels.push(actionTmp)
                            }
                        }
                        progress("collection", `${unit.col_name}`, Math.floor(((index + 1) * 100) / totalCnt))
                    }



                    var jsonPath = `${FlowCommonPath.GetConfigDir()}/flowline_models.json`

                    progress("create", 'Model 파일 생성중 입니다.', 10)
                    await fs.promises.writeFile(jsonPath, JSON.stringify(appModel));


                    progress("create", 'Requirements 파일을 생성중 입니다', 50)

                    var requirementsPath = await this._generateRequirements(appModel.ProjectID);

                    progress("create", 'Env 파일을 생성중 입니다', 50)
                    var newEnvPath = await this.WriteEnv(appModel.ProjectID, appModel.Profile?.EnvList, `${FlowCommonPath.GetConfigDir()}/${appModel.ProjectID}.env`);;


                    progress("create", '압축 파일 생성중 입니다.', 100)
                    compressPath = await this._compressFileAndFolder(appModel.ProjectID, jsonPath, requirementsPath, newEnvPath);

                    if (deployType === "DEPLOY") {
                        progress("send", '전송중 입니다.', 0)
                        var sendResult = await this._sendFile(endpointUrl, compressPath, (p: number) => {
                            progress("send", '전송중 입니다.', p)
                        })


                        if (sendResult.status === "success") {
                            var targetServerPath = sendResult.info.path;

                            progress("apply", '사이트에 적용중 입니다.', 0)
                            var applyResult = await this._sendApply(endpointUrl, appModel.ProjectID, targetServerPath);
                            if (applyResult.status === "success") {
                                progress("end", '작업이 완료 되었습니다.', 0)
                                this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, profile?.Name, "SUCCESS", "")
                            }
                            else {
                                progress("error", applyResult.error, 0)
                                this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, profile?.Name, "ERROR", applyResult.error)
                            }

                        }
                        else {
                            progress("error", sendResult.error, 0)
                            this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, profile?.Name, "ERROR", applyResult.error)
                        }
                    }
                    



                }
                else {
                    progress("error", "모델 리스트 정보를 가지고 올 수 없습니다.", 0)
                    this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, profile?.Name, "ERROR", "모델 리스트 정보를 가지고 올 수 없습니다")
                }
            }
            else {
                progress("error", "프로젝트 정보를 가지고 올 수 없습니다.", 0)
                this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, profile?.Name, "ERROR", "프로젝트 정보를 가지고 올 수 없습니다")
            }

            return compressPath;
        }
        catch (error) {
            var emsg;
            if (error instanceof Error) {
                emsg = error.message;
            } else {
                emsg = error;
            }

            progress("error", emsg, 0)
            this._WriteDeployHistory(endpointID, projectID, usrID, loggingLvl, "", "ERROR", "")
        }
    }
    
       
   public Import = async (usrID: string
        , prjID: string
        , info:any
        , progress: (type: "start" | "collection" | "unzip" | "requirements" | "end" | "error", msg: any, percent: number) => void) => {

        try {
            progress("start", "Import를를 시작 하였습니다.", 0)
            progress("unzip", "Zip 파일 압축 해제 중입니다.", 0)

            var dir = FlowCommonPath.GetImportDir(v4());
            var zipPath = info.info.path

            await UnzipFile(zipPath, dir)

            await fs.promises.unlink(zipPath);

            var jsonPath = `${dir}/export_model.json`;

            var content = await fs.promises.readFile(jsonPath,'utf8');
            
            
            var exportModel:ExportModel = JSON.parse(content);
            
            content =  content.replaceAll(exportModel.ProjectID,prjID)
            
            for(var i  in exportModel.IDs){
                var beforeid = exportModel.IDs[i]
                var afterid = v4()
                content =  content.replaceAll(beforeid,afterid)
            }

            for (var i in exportModel.FlowModles) {
                var flow = exportModel.FlowModles[i];
                if (flow.MapValue && flow.MapValue.FunctionMaps && flow.MapValue.FunctionMaps.length > 0) {
                    for (var k in flow.MapValue.FunctionMaps) {
                        var map = flow.MapValue.FunctionMaps[k];
                        content = content.replaceAll(map.PK_ID, v4())
                    }
                }
            }
            for (var i in exportModel.ControlModels) {
                var ctrl = exportModel.ControlModels[i];
                if (ctrl.MapValue && ctrl.MapValue.FunctionMaps && ctrl.MapValue.FunctionMaps.length > 0) {
                    for (var k in ctrl.MapValue.FunctionMaps) {
                        var map = ctrl.MapValue.FunctionMaps[k];
                        content = content.replaceAll(map.PK_ID, v4())
                    }
                }
            }
            for (var i in exportModel.PageModels) {
                var page = exportModel.PageModels[i];
                if (page.MapValue && page.MapValue.FunctionMaps && page.MapValue.FunctionMaps.length > 0) {
                    for (var k in page.MapValue.FunctionMaps) {
                        var map = page.MapValue.FunctionMaps[k];
                        content = content.replaceAll(map.PK_ID, v4())
                    }
                }
            }

            
            exportModel = JSON.parse(content);
            
           progress("collection", "프로젝트에 Template 구성 요소를 적용하는 중입니다.", 0)

            var totalCnt = exportModel.IDs.length;
            var index = 0;
            var name;

            var envKeys:any[] = await this.GetEnvKeys(usrID,prjID);
            var envCnt = envKeys.length;
            
            if (exportModel.EnvList && exportModel.EnvList.length > 0) {
                for (var i in exportModel.EnvList) {
                    name = exportModel.EnvList[i].Key
                    index += 1;

                    if (envKeys && envKeys.length > 0) {
                        var findIndex = envKeys.findIndex(x => x.envkey === exportModel.EnvList[i].Key);
                        if (findIndex > -1) {
                            progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
                            continue;
                        }
                    }
                    if (!exportModel.EnvList[i].Desc) {
                        exportModel.EnvList[i].Desc = "";
                    }
                    exportModel.EnvList[i].Index = envCnt + parseInt(i);
                    await this.UpsertEnvKey(exportModel.EnvList[i], prjID, usrID)
                    progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
                }
            }
            
            
            var files:KeyValue[]=[]
            
            for (var i in exportModel.CoreModels) {
                name = exportModel.CoreModels[i].name
                index += 1;
                
                files.push({key:`${dir}/${exportModel.CoreModels[i].name}`,value:exportModel.CoreModels[i].name})
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }

            
            await this.WriteCoreList(prjID,usrID,files,(isSuccess:boolean,msg:string)=>{
            })
            for (var i in exportModel.DBConfigModels) {
                name = exportModel.DBConfigModels[i].config?.name
                index += 1;
                
                var config = exportModel.DBConfigModels[i].config;
                if(config)
                    await this.SetDBConfig(prjID,usrID,exportModel.DBConfigModels[i].id,config);
                
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.LLMModels) {
                name = exportModel.LLMModels[i].Name
                index += 1;
                await this.SetActionModel(prjID,usrID,exportModel.LLMModels[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.NodeModels) {
                name = exportModel.NodeModels[i].Name
                index += 1;
                await this.SetActionModel(prjID,usrID,exportModel.NodeModels[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }

            for (var i in exportModel.PythonModels) {
                name = exportModel.PythonModels[i].Name
                index += 1;
                
                await this.SetActionModel(prjID,usrID,exportModel.PythonModels[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.ActionModels) {
                name = exportModel.ActionModels[i].Name
                index += 1;
                await this.SetActionModel(prjID,usrID,exportModel.ActionModels[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.FlowModles) {
                name = exportModel.FlowModles[i].Name
                index += 1;
                await this.SetActionModel(prjID,usrID,exportModel.FlowModles[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.ControlModels) {
                name = exportModel.ControlModels[i].COL_NAME
                index += 1;
                await this.SetCtrlModel(prjID,usrID,exportModel.ControlModels[i])
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.PageModels) {
                name = exportModel.PageModels[i].MenuName
                index += 1;
                await this.SetPageModel(prjID,usrID,exportModel.PageModels[i])
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.ScheduleModels) {
                name = exportModel.ScheduleModels[i].Name
                index += 1;
                await this.SetActionModel(prjID,usrID,exportModel.ScheduleModels[i])   ;
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }
            for (var i in exportModel.MCPAgents) {
                var agent = exportModel.MCPAgents[i];
                name = agent.Name
                index += 1;
                
                await this.SetMcpAgentModel(prjID,usrID,agent)

                if(agent.Tools && agent.Tools?.length > 0){
                    for(var j  in agent.Tools){
                        var tool = agent.Tools[j]
                        if(agent.ID && tool.ActionID )
                            await this.UpsertMcpToolModel(agent.ID,tool.ActionID,tool.ToolName?tool.ToolName:"",tool.ToolDesc?tool.ToolDesc:"",tool.MappingParam);
                    }
                    
                }
                 
       
                progress("collection", `${name}`, Math.floor(((index) * 100) / totalCnt))
            }

              

              progress("requirements","모듈을 설치하는 중입니다.", 0)

              if(exportModel.Requirements && exportModel.Requirements.length > 0){
                
                index = 0;
                totalCnt = exportModel.Requirements.length;

                

                for(var i in exportModel.Requirements){
                    var moduleInfo = exportModel.Requirements[i];
                    var cmd = undefined;
                    var absolutePath: string | URL | undefined = undefined;
                    
                    progress("requirements",`${moduleInfo.Module}`, Math.floor(((index) * 100) / totalCnt))
                    index +=1;
                    if (moduleInfo.Type === "NODE") {
                        absolutePath = FlowCommonPath.GetNodejsDir(prjID);
                        await FlowCommonPath.WriteNodePackage(prjID, absolutePath);
                        cmd = `npm install ${moduleInfo.Module}@${moduleInfo.Version} --save`
                    }
                    else if (moduleInfo.Type === "PYTHON") {
                        var pipPath = FlowCommonPath.GetPipRunPathByProjectId(prjID);
                        cmd = `${pipPath} install ${moduleInfo.Module}==${moduleInfo.Version}`
                    }
                    if(cmd){
                        await execPromise(cmd, { cwd: absolutePath });
                    }
                        

                    
                }

              }


                
           
           await fs.promises.rm(dir, { recursive: true, force: true });

           progress("end", '작업이 완료 되었습니다.', 0)

        }
        catch (error) {
            var emsg;
            if (error instanceof Error) {
                emsg = error.message;
            } else {
                emsg = error;
            }

            progress("error", emsg, 0)
        }
    }


    public Export = async (usrID: string
        , templateID: string
        , prjID: string
        , progress: (type: "start" | "collection" | "env" | "requirements" | "end" | "error", msg: any, percent: number) => void) => {

        try {
            progress("start", "Export를 시작 하였습니다.", 0)
            progress("collection", "모델 정보를 가지고 오는중 입니다.", 0)
            var data = await this.DBClient.Datatable("ps_template_child_list", { p_template_id: templateID });


            if (data?.result && data.result.length > 0) {
                var units: any[] = data.result;



                var totalCnt = units.length;
                var exportModel: ExportModel = {
                    ProjectID :prjID
                    , IDs: []
                    , Requirements: []
                    , EnvList: []

                    , DBConfigModels: []
                    , LLMModels: []
                    , CoreModels: []

                    , ActionModels: []
                    , PythonModels: []
                    , NodeModels: []

                    , FlowModles: []
                    , ControlModels: []
                    , MCPAgents: []
                    , PageModels: []
                    , ScheduleModels: []
                }

                for (var i in units) {


                    var index = parseInt(i);
                    var unit = units[i]
                    exportModel.IDs.push(unit.id)
                    var name;
                    if (unit.type === "CTRL") {

                        var ctrlTmp = await this.GetControlModel(unit.id,prjID, usrID);
                        if (ctrlTmp) {
                            exportModel.ControlModels.push(ctrlTmp)
                            name = ctrlTmp.COL_NAME
                        }
                    }
                    else if (unit.type === "PAGE") {
                        var pageTmp = await this.GetPageModel(unit.id,prjID, usrID);
                        if (pageTmp) {
                            exportModel.PageModels.push(pageTmp)
                            name = pageTmp.MenuName
                        }
                    }
                    else if (unit.type === "DBCONFIG") {
                        var dbConTmp = await this.GetDBConfigModel(unit.id,prjID, usrID);
                        if (dbConTmp) {
                            exportModel.DBConfigModels.push(dbConTmp)
                            name = dbConTmp?.config?.name;
                        }
                    }
                    else if (unit.type === "SCHD") {
                        var actionTmp = await this.GetActionModel(unit.id,prjID, usrID);
                        if (actionTmp) {
                            exportModel.ScheduleModels.push(actionTmp as ScheduleModel)
                            name = actionTmp?.Name
                        }
                    }
                    else if (unit.type === "MCP") {
                        var mcpTmp = await this.GetMcpAgentModel(unit.id,prjID, usrID);
                        if (mcpTmp) {
                            exportModel.MCPAgents.push(mcpTmp as MCPAgentModel)
                            name = mcpTmp?.Name
                        }
                    }
                    else if (unit.type === "CORE") {

                        var respcore = await this.DBClient.Datatable("ps_core_detail", { p_unit_id: unit.id, p_user_id: usrID ,p_project_id:prjID});
                        if (respcore?.result && respcore?.result.length > 0) {


                            exportModel.CoreModels.push({ id: unit.id, name: respcore?.result[0].col_name, path: respcore?.result[0].col_path })
                            name = respcore?.result[0].col_name
                        }
                    }
                    else if (unit.type === "OCST") {
                        var actionTmp = await this.GetActionModel(unit.id,prjID, usrID);
                        if (actionTmp) {
                            exportModel.FlowModles.push(actionTmp)
                            name = actionTmp?.Name
                        }
                    }
                    else if (unit.type === "OPENAI") {
                        var actionTmp = await this.GetOpenAIModel(unit.id, prjID,usrID);

                        if (actionTmp) {
                            exportModel.LLMModels.push(actionTmp)
                            name = actionTmp?.Name
                        }
                    }
                    else if (unit.type === "FUNC") {
                        var actionTmp = await this.GetActionModel(unit.id,prjID, usrID);

                        if (actionTmp) {
                            if (actionTmp.CodeType === "python") {
                                exportModel.PythonModels.push(actionTmp)
                            }
                            else if (actionTmp.CodeType === "nodejs") {
                                exportModel.NodeModels.push(actionTmp)
                            }

                            name = actionTmp?.Name
                        }
                    }
                    else {
                        var actionTmp = await this.GetActionModel(unit.id, prjID,usrID);
                        if (actionTmp) {
                            exportModel.ActionModels.push(actionTmp)
                            name = actionTmp?.Name
                        }
                    }

                    progress("collection", `${name}`, Math.floor(((index + 1) * 100) / totalCnt))
                }

                progress("requirements", `파이썬 모듈 정보를 가지고 오는중 입니다.`, 10)

                var err = await this._pytonToRequiremnts(prjID, exportModel);
                if (!err) {
                    progress("requirements", `파이썬 모듈 정보를 가지고 오는중 입니다.`, 50)
                }
                else {
                    progress("error", err, 0)
                    return;
                }
                progress("requirements", `노드 모듈 정보를 가지고 오는중 입니다.`, 70)
                var err2 = await this._nodeToRequiremnts(prjID, exportModel);
                if (!err2) {
                    progress("requirements", `노드 모듈 정보를 가지고 오는중 입니다.`, 100)
                }
                else {
                    progress("error", err, 0)
                    return;
                }




                progress("env", `환경변수 정보를 가지고 오는중 입니다.`, 100)

                var content = JSON.stringify(exportModel)
              
                


                if (content) {
                    var envs = await this.GetProjectDefaultEnvs(usrID,prjID)

                    if (envs && envs.length > 0) {
                        for (var i in envs) {
                            var env = envs[i];
                            if(content.includes(env.Key)){
                                env.DefaultValue = ""
                                env.Value = "";
                                exportModel.EnvList.push(env)
                                exportModel.IDs.push(env.ID)
                            }
                        }

                    }


                }
                var compressPath = await this._compressExportFile(exportModel);

                var downloadLnk = compressPath
                progress("end", downloadLnk, 100)
            }
            else {
                progress("error", "모델 리스트 정보를 가지고 올 수 없습니다.", 0)

            }

        }
        catch (error) {
            var emsg;
            if (error instanceof Error) {
                emsg = error.message;
            } else {
                emsg = error;
            }

            progress("error", emsg, 0)
        }
    }


    

    private async _nodeToRequiremnts(prjID: string, exportModel: ExportModel) {
        var ids = []
        var models = exportModel.NodeModels;
        for (var i in models) {
            ids.push({ projectid: models[i].ProjectID, unitid: models[i].ID })

        }
        var id = Guid();

        await LauncherInAndOut.WriteInput(id, JSON.stringify({ ids: ids }))
        var runPath = "node"
        var sourcePath = `${FlowCommonPath.GetRootDir()}/getImported.js`;
        const { stderr } = await execPromise(`${runPath} ${sourcePath}  ${id}`);

        var resp: any = await LauncherInAndOut.GetOutput(id)


        if (!stderr && resp) {

            var obj = JSON.parse(resp);
            for (var j in obj.result) {
                var item = obj.result[j]
                exportModel.Requirements.push(item)

            }
        }
        return stderr
    }
    private async _pytonToRequiremnts(prjID: string, exportModel: ExportModel) {
        var pythonIds = []
        var models = exportModel.PythonModels;
        for (var i in models) {
            pythonIds.push({ projectid: models[i].ProjectID, unitid: models[i].ID })

        }
        var pipPath = FlowCommonPath.GetPipRunPathByProjectId(prjID);
        const pipList = await execPromise(`${pipPath} list`);
        var runPath = FlowCommonPath.GetPythonRunPathByProjectId(prjID);
        var sourcePath = `${FlowCommonPath.GetRootDir()}/getImported.py`;


        var id = Guid();

        await LauncherInAndOut.WriteInput(id, JSON.stringify({ ids: pythonIds, importlist: pipList.stdout.split('\r\n') }))

        const { stderr } = await execPromise(`${runPath} ${sourcePath}  ${id}`);

        var resp: any = await LauncherInAndOut.GetOutput(id)
        if (!stderr && resp) {

            var obj = JSON.parse(resp);

            for (var j in obj.result) {
                var str = obj.result[j]
                if (str) {
                    var strs = str.split("==");
                    if (strs && strs.length === 2) {
                        exportModel.Requirements.push({ Type: "PYTHON", Module: strs[0], Version: strs[1] })
                    }
                }

            }

        }

        return stderr;




    }
    private async _generateRequirements(projectID: string) {

        try {
            var pipPath = FlowCommonPath.GetPipRunPathByProjectId(projectID);
            var requirementsPath = `${FlowCommonPath.GetConfigDir()}/requirements.txt`

            const { stdout, stderr } = await execPromise(`${pipPath} freeze > ${requirementsPath}`);
            if (stderr) {
                console.error(`stderr: ${stderr}`);

                return "";
            }


            return requirementsPath;
        } catch {
            return undefined;
        }


    }



    private async _compressExportFile(exportModel: ExportModel) {

        var content = JSON.stringify(exportModel);

        //content에 @ENV. 관련된 단어들 추출 로직
        var jsonPath = `${FlowCommonPath.GetConfigDir()}/export_model.json`
        await fs.promises.writeFile(jsonPath, content);


        var id = v4();

        var compressPath = `${FlowCommonPath.GetConfigDir()}/Export${id}.zip`
        if (fs.existsSync(compressPath))
            await fs.promises.unlink(compressPath);

        const output = fs.createWriteStream(compressPath);

        const archive = archiver('zip', {
            zlib: { level: 9 } // 압축 레벨 설정
        });

        const archiveEnd = new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
            archive.on('error', reject);
        });
        archive.pipe(output);

        if (jsonPath) {
            archive.file(jsonPath, { name: path.basename(jsonPath) });
        }

        if (exportModel.CoreModels) {
            for (var i in exportModel.CoreModels) {
                var core = exportModel.CoreModels[i]

                archive.file(core.path, { name: core.name });
            }
        }

        await archive.finalize()
        await archiveEnd;

        if (jsonPath && fs.existsSync(jsonPath))
            await fs.promises.unlink(jsonPath);


        return compressPath;
    }
    private async _compressFileAndFolder(projectID: string, jsonPath: string, requirementsPath: string | undefined, newEnvPath: string | undefined) {

        var projectDir = `${FlowCommonPath.GetDir(projectID)}`
        var id = v4();

        var compressPath = `${FlowCommonPath.GetConfigDir()}/${id}.zip`
        if (fs.existsSync(compressPath))
            await fs.promises.unlink(compressPath);

        const output = fs.createWriteStream(compressPath);

        const archive = archiver('zip', {
            zlib: { level: 9 } // 압축 레벨 설정
        });


        const archiveEnd = new Promise((resolve, reject) => {
            output.on('close', resolve);
            output.on('error', reject);
            archive.on('error', reject);
        });
        archive.pipe(output);




        // 폴더 추가 (특정 파일 제외)
        archive.directory(projectDir, projectID, (entry) => {
            // Exclude specific files by their relative path
            const excludedFiles = ['.env']; // Add your excluded files here

            if (excludedFiles.includes(entry.name))
                return false
            else
                return entry;
        });

        if (newEnvPath)
            archive.file(newEnvPath, { name: `${projectID}/.env` });

        if (jsonPath) {
            archive.file(jsonPath, { name: `${projectID}/${path.basename(jsonPath)}` });
        }
        if (requirementsPath) {
            archive.file(requirementsPath, { name: `${projectID}/python/${path.basename(requirementsPath)}` });
        }

        await archive.finalize()
        await archiveEnd;

        if (jsonPath && fs.existsSync(jsonPath))
            await fs.promises.unlink(jsonPath);


        if (requirementsPath && fs.existsSync(requirementsPath))
            await fs.promises.unlink(requirementsPath);

        if (newEnvPath && fs.existsSync(newEnvPath))
            await fs.promises.unlink(newEnvPath);

        return compressPath;
    }
    private _getLength = (formData: FormData) => {
        return new Promise<number>((resolve, reject) => {
            formData.getLength((err, length: number) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(length);
                }
            });
        });
    };

    private async _sendFile(endpointUrl: string, filePath: string, progressHandler: Function) {

        var url = `${endpointUrl}/file/upload`;

        var formData = new FormData();

        const readStream = fs.createReadStream(filePath);

        formData.append('file', readStream)

        const length = await this._getLength(formData);

        const headers = {
            ...formData.getHeaders(),
            'Content-Length': length
        };
        var r = await axios.post(url, formData, {
            headers: headers,
            onUploadProgress: (data: any) => {
                if (data.total)
                    progressHandler(Math.round((100 * data.loaded) / data.total))
            }
        })
            .finally(
                async () => {
                    if (filePath && fs.existsSync(filePath))
                        await fs.promises.unlink(filePath);
                }
            )

        return r.data;
    }

    private async _sendApply(endpointUrl: string, prjID: string, path: string) {
        var url = `${endpointUrl}/builder/${prjID}/apply`;

        var r = await axios.post(url, { path: path })
        var applyResult = r.data;

        if (applyResult.status === "success") {
            var url = `${endpointUrl.replace(":9002", ":9004")}/mcp/${prjID}/apply`;

            r = await axios.post(url)
            applyResult = r.data;

        }

        return applyResult;

    }

    //kbh:비동기 콘솔 명령 실행 함수
    private async _executeCommand(command: string): Promise<string> {
        try {
            const { stdout, stderr } = await execPromise(command);
            if (stderr) {
                throw new Error(stderr);
            }
            return stdout;
        } catch (error: any) {
            console.error(`Command execution failed: ${error.message}`);
            throw error;
        }
    }

    //kbh:가상환경 clone 생성
    private async _checkCloneProjectCondaEnv(prj_pk_id: string): Promise<boolean> {
        const command = `conda env list`;

        var r = await this._executeCommand(command);

        return r.includes(prj_pk_id)

    }
    private async _cloneProjectCondaEnv(prj_pk_id: string): Promise<string> {
        const newEnvName = prj_pk_id;
        const baseEnv = process.env.CONDA_BASE_ENV_NAME;
        const command = `conda create --name ${newEnvName} --clone ${baseEnv} -y -q`;

        await this._executeCommand(command);
        return newEnvName;
    }

    //kbh:가상환경 삭제
    private async _deleteProjectCondaEnv(prj_pk_id: string): Promise<string> {
        const delEnvName = prj_pk_id;
        const command = `conda remove --name ${delEnvName} --all -y -q`;

        await this._executeCommand(command);
        return delEnvName;
    }

    //kbh:다이내믹 프로젝트 폴더 하위에 nodejs 폴더와 package.json 파일 생성
    private async _setNodeJSDevEnvironment(prj_pk_id: string) {

        try {
            //nodejs 디렉터리가 없으면 생성
            const nodejsPath = FlowCommonPath.GetNodejsDir(prj_pk_id);


            //package.json 파일 복사
            const packageJsonPath = path.join(nodejsPath, 'package.json');

            //nodejs 폴더안에 package.json 파일이 없으면 복사
            if (!await FlowCommonPath.FileExists(packageJsonPath)) {
                //dynamic_package_json 파일 복사
                const dynamic_package_file = './dynamic_package_json';
                await fs.promises.copyFile(dynamic_package_file, packageJsonPath);

                //package.json 파일내의 name 항목 수정
                var readPackageJson = await fs.promises.readFile(packageJsonPath, 'utf8');
                const packageJson = JSON.parse(readPackageJson);
                packageJson.name = prj_pk_id;
                await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8')
            } else {

            }
        } catch (error: any) {
            console.error(`Set NodeJS Dev Environment failed: ${error.message}`);
            throw error;
        }
    }

    public GetEndPointID() {
        return "00000000-0000-0000-0000-000000000000";
    }

    public async GetUnitLogs(p_unit_id: string) {
        return await this.DBClient.Datatable("ps_unit_log_history", {
            p_unit_id: p_unit_id
        });
    }
    public async GetLogDetail(logid: string) {
        var resp = await this.DBClient.Datatable("ps_log_detail", {
            logid: logid
        });


        if (resp && resp.result && resp.result.length > 0) {
            return resp.result[0]

        }

        return undefined;
    }

    public async DeleteLog(logid: string) {
        await this.DBClient.Datatable("pm_delete_tbl_log", {
            p_pk_id: logid
        });

        return true;
    }
    public async GetLogDetailItems(logid: string) {

        var cresp = await this.DBClient.Datatable("ps_log_items", {
            logid: logid
        });


        if (cresp && cresp.result && cresp.result.length > 0)
            return cresp.result

        return [];
    }

    public async WriteLog(log: LauncherLog, endpointID: string | undefined, projectID: string | undefined,start:Date,end:Date) {


        try {



            var strInput = await StringifyAsync(log.inputlog);
            var strMsg = await StringifyAsync(log.msglog);
            var strResult = await StringifyAsync(log.resultlog);
            var strError = await StringifyAsync(log.errlog);
            var milSec = 0
            if(end && start){
                milSec = end.getTime()-start.getTime();
            }
            await this.DBClient.Execute("pm_insert_tbl_log", {
                p_pk_id: log.loggingid,
                p_col_parent_log_id: log.parentloggingid,
                p_col_endpoint_id: endpointID,
                p_col_project_id: projectID,
                p_col_unit_id: log.actionid ? log.actionid : '00000000-0000-0000-0000-000000000000',
                p_col_name: log.name,
                p_col_input: strInput,
                p_col_result: strResult,
                p_col_msg: strMsg,
                p_col_err: strError,
                p_col_is_err: log.errlog && log.errlog.length > 0,
                p_col_start_date:start,
                p_col_end_date:end,
                p_col_total_millisecond:milSec
            });

        }
        catch (ex) {
            console.log("WriteLog", ex)
        }
    }

    public async GetTags(unitID: string) {
        var resp = await this.DBClient.Datatable("ps_unit_tags", { p_unit_id: unitID });

        if (resp && resp.result && resp.result.length > 0) {

            return resp.result;
        }

        return undefined;
    }
    public async GetProjectTags(userid: string,prjID:string) {
        var resp = await this.DBClient.Datatable("ps_tag_list", { p_user_id: userid ,p_project_id :prjID});

        if (resp && resp.result && resp.result.length > 0) {

            return resp.result;
        }

        return undefined;
    }

    private async _upsertCoreFile(prjID: string, fullpath: string, filename: string, userid: string) {
        await this.DBClient.Execute("pm_upsert_tbl_core", { p_prj_id: prjID, p_col_path: fullpath, p_col_name: filename, p_user_id: userid });
        return true;
    }

    public async UpsertTag(unitID: string, tagName: string) {
        await this.DBClient.Execute("pm_upsert_tbl_tag_unit", { p_unit_id: unitID, p_tag_name: tagName });
        return true;
    }
    public async DeleteTag(unitID: string, tagID: string) {
        await this.DBClient.Execute("pm_delete_unit_tags", { p_unit_id: unitID, p_tag_id: tagID });
        return true;
    }


}
