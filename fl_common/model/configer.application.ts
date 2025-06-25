

import { ActionAuth, ActionModel, ApplicationModels, DBConnectionInfo, DBConnectionModel, Dictionary, FunctionMap, IDBClient, IFlowConfiger, LauncherLog, OrchestrationModel } from "./models.js";
import { FlowCommonPath, GetGlobalValue, UnzipFile } from './util.server.js'
import fs from "fs";
import { MsSqlClient } from "./db.client.mssql";
import { MySqlClient } from "./db.client.mysql";
import { PostgreSqlClient } from "./db.client.postgresql";

import axios from 'axios'
import path from 'path';
import { BindingGlobalValueDBConnectionInfo } from "./util.server.js";
import { JsonQuery } from "./util.common.js";

//tet
export class ApplicationConfiger implements IFlowConfiger {
    models: ApplicationModels | undefined;
    dbClients: Dictionary<IDBClient> = {};
    updateTime: string | undefined;
    private static _instance: Dictionary<ApplicationConfiger> = {};
    public static GetInstance = (projectID: string) => {
        if (!ApplicationConfiger._instance[projectID]) {
            ApplicationConfiger._instance[projectID] = new ApplicationConfiger(projectID);
        }

        return ApplicationConfiger._instance[projectID];
    }

    public static GetProjectList = async () => {
        var fileList = ApplicationConfiger._findFlowlineModels(FlowCommonPath.GetConfigDir())
        var rtn: { ProjectID: string, ProjectName: string | undefined, ProjectDesc: string | undefined }[] = []
        for (var i in fileList) {
            try {
                var path = fileList[i];
                const data = await fs.promises.readFile(path, 'utf8');

                const obj: ApplicationModels = JSON.parse(data);
                if (obj) {


                    rtn.push({ ProjectID: obj.ProjectID, ProjectDesc: obj.ProjectDesc, ProjectName: obj.ProjectName })
                }
            }
            catch { }
        }

        return rtn;
    }

    private static _findFlowlineModels(dir: string, fileList: string[] = []) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                ApplicationConfiger._findFlowlineModels(filePath, fileList);
            } else if (file === 'flowline_models.json') {
                fileList.push(filePath);
            }
        });

        return fileList;
    }


    private _projectID: string;
    private constructor(projectID: string) {
        this._projectID = projectID;
    }

    private _loadModels = async () => {
        var path = `${FlowCommonPath.GetConfigDir()}/${this._projectID}/flowline_models.json`
        const data = await fs.promises.readFile(path, 'utf8');

        const obj = JSON.parse(data);
        if (obj) {
            this.models = obj;
        }
    }
    CheckReload = async () => {
        try {
            var filePath = `${FlowCommonPath.GetConfigDir()}/${this._projectID}/flowline_models.json`
            const stats = await fs.promises.stat(filePath);


            var isReload = this.updateTime != stats.mtime.toString();

            this.updateTime = stats.mtime.toString();
            if (isReload) {
                await this.Clear();
            }


        } catch (error) {

        }
    }


    GetLoginSetting = async () => {
        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }


        if (this.models?.Login) {

            this.models.Login.AzureTenantID = GetGlobalValue(this.models.Login.AzureTenantID, undefined, this.models.Profile?.EnvList);
            this.models.Login.AzureClientID = GetGlobalValue(this.models.Login.AzureClientID, undefined, this.models.Profile?.EnvList);
            this.models.Login.AzureAuthoriry = GetGlobalValue(this.models.Login.AzureAuthoriry, undefined, this.models.Profile?.EnvList);
            this.models.Login.AzureScopes = GetGlobalValue(this.models.Login.AzureScopes, undefined, this.models.Profile?.EnvList);

        }




        return this.models?.Login;
    }
    GetLayout = async () => {
        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }

        return this.models?.Layout;
    }

    GetPageModels = async () => {

        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }

        return this.models?.PageModels;
    }
    GetScheduleModels = async () => {
        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }
        if (this.models?.ScheduleModels && this.models?.ScheduleModels.length > 0) {
            for (var i in this.models?.ScheduleModels) {
                var schd = this.models?.ScheduleModels[i];
                if (schd.ScheduleActionID) {
                    var actModel = await this.GetActionModel(schd.ScheduleActionID);
                    if (actModel)
                        schd.Inputs = actModel.Inputs;
                }

            }
        }

        return this.models?.ScheduleModels;
    }
    GetMcpAgentModels = async()=>{
          if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }

        return this.models?.MCPAgents;
    }
    GetMcpAgentModel = async (agentid:string) =>{
        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }

        
        if (this.models?.MCPAgents && this.models?.MCPAgents.length > 0) {
            var fObj = this.models?.MCPAgents.find(x=>x.ID === agentid)
            if (fObj &&fObj?.Tools &&  fObj?.Tools?.length > 0) {
                for (var i in fObj?.Tools) {
                    var tool = fObj?.Tools[i];
                    if (tool.ActionID) {
                        tool.AcionModel = await this.GetActionModel(tool.ActionID);
                         
                    }

                }
            }

            return fObj;
        }

        return undefined;
    }

    GetActionModel = async (id: string) => {

        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }

        return this.models?.ActionModels.find(x => x.ID === id);
    }

    GetControlModel = async (id: string) => {
        if (!this.models || this.models.ControlModels.length === 0) {
            await this._loadModels();
        }


        return this.models?.ControlModels.find(x => x.PK_ID === id);
    }
    GetPageModel = async (id: string) => {
        if (!this.models || this.models.PageModels.length === 0) {
            await this._loadModels();
        }


        return this.models?.PageModels.find(x => x.ID === id);
    }

    GetDBConfigModel = async (id: string) => {
        if (!this.models || this.models.DBConfigModels.length === 0) {
            await this._loadModels();
        }


        return this.models?.DBConfigModels.find(x => x.id === id);
    }
    GetOpenAIModel = async (id: string) => {
        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }


        return this.models?.ActionModels.find(x => x.ID === id);
    }
    GetScheduleModel = async (id: string) => {

        if (!this.models || this.models.ActionModels.length === 0) {
            await this._loadModels();
        }
        return this.models?.ScheduleModels.find(x => x.ID === id);
    }
    GetActionModelsIncludeFlow = async (flowID: string) => {

        var model = await this.GetActionModel(flowID);
        var orch: OrchestrationModel = model as OrchestrationModel;
        var rtn: Dictionary<ActionModel> = {}
        if (orch && orch.MapValue) {
            var maps = orch.MapValue.FunctionMaps;

            if (maps) {

                for (var i in maps) {
                    var fmap = maps[i] as FunctionMap;
                    if (fmap && fmap.ActionID && fmap.ActionType !== "Start" && fmap.ActionType !== "End") {

                        if (!rtn[fmap.ActionID]) {
                            var findObj = this.models?.ActionModels?.find(x => x.ID === fmap.ActionID);
                            if (findObj)
                                rtn[fmap.ActionID] = findObj;
                        }
                    }

                }

            }
        }

        return rtn;
    }
    GetPublicActionModels = async () => {
        var result = JsonQuery.InnerJoin(this.models?.PublicActionModelKeys, this.models?.ActionModels, "key", "ID", "A", "B");
        if (result && result.length > 0) {
            return result.map(x => x.B);
        }
        return [];
    }
    Clear = async () => {
        await this._loadModels();
        for(var i in this.dbClients ){
            await this.dbClients[i]?.Dispose();
        }
        this.dbClients = {}
    };
    
    GetDBClient = async (id: string, envs: any[], userID?: string) => {
        if (id) {
            if (this.dbClients[id]) {
                return this.dbClients[id];
            }


            var dbConInfo = await this.GetDBConfigModel(id) as DBConnectionModel;

            if (dbConInfo && dbConInfo.config) {


                if (dbConInfo.config.dbtype === "POSTGRESQL") {
                    this.dbClients[id] = new PostgreSqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
                else if (dbConInfo.config.dbtype === "MSSQL") {
                    this.dbClients[id] = new MsSqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
                else if (dbConInfo.config.dbtype === "MYSQL" || dbConInfo.config.dbtype === "MARIADB") {
                    this.dbClients[id] = new MySqlClient(BindingGlobalValueDBConnectionInfo(dbConInfo.config, envs));
                }
            }

            return this.dbClients[id];
        }
        else return undefined;

    }
    GetProjectDefaultEnvs = async (usrId: string | undefined,prjID:string|undefined) => {

        if (this.models?.Profile)
            return this.models?.Profile?.EnvList;

        return [];
    }
    Apply = async (zipPath: string) => {
        try {

            var dir = FlowCommonPath.GetConfigDir();
            //await this._deleteBeforeFile(dir);

            await UnzipFile(zipPath, dir)

            await fs.promises.unlink(zipPath);

            await this.Clear()
        }
        catch (error) {
            var emsg;
            if (error instanceof Error) {
                emsg = error.message;
            } else {
                emsg = error;
            }

            return { status: 'error', error: emsg }
        }
        return { status: 'success', error: "" }
    }
    private _deleteBeforeFile = async (folderPath: string) => {
        FlowCommonPath.DeleteFolderRecursive(folderPath)
        if (!fs.existsSync(folderPath))
            fs.mkdirSync(folderPath, { recursive: true });
    }

  

    public GetEndPointID() {
        return this.models?.EndPointID;
    }
    public async WriteLog(log: LauncherLog, endpointID: string | undefined, projectID: string | undefined,start:Date,end:Date) {

        
        if (this.models?.LoggingLvl !== "LOGGING1") {
            log.iserr = log.errlog?.length > 0;
            var isLogging = this.models?.LoggingLvl === "LOGGING3"?true:log.iserr 


            if (isLogging) {
                var endUrl = this.models?.LoggingUrl

                var url = `${endUrl}/builder/logging/write`;

                await axios.post(url, { logging: log, endpointID: endpointID, projectID: projectID,startdt:start,enddt:end })
            }
        }
    }
}
