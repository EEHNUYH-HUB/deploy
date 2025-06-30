
import { GetCache } from './ui.utils.js';
import APIClient from './restapi.client.js';


import { ActionModel, ControlModel, DBConnectionModel, KeyValue, LoginInfo, MCPAgentModel, OrchestrationModel, PageModel, ScheduleModel, TemplateModel, UnitModel, UserInfo } from 'flowline_common_model/result/models';
import { ConvertJsonModelToObj2, Guid, RunJavascript, SetKeyValueforObj } from 'flowline_common_model/result/util.common';
import { AuthenticationResult, Configuration, EventMessage, EventPayload, PublicClientApplication } from "@azure/msal-browser";
const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export default class FlowLineClient {
    apiClient;
    projectID;
    currentUser: UserInfo | undefined;

    onLoginSuccess: Function | undefined;
    msalInstance: PublicClientApplication | undefined;
    logininfo: LoginInfo | undefined
    appendPath: string

    keyUpHandler?:Function
    keyDownHandler?:Function

    constructor(apiClient: APIClient, projectID?: string) {
        this.apiClient = apiClient;
        this.projectID = projectID;

        this.appendPath = "builder";
        if (this.projectID) {
            this.appendPath = `builder/${this.projectID}`
        }
    }


    //#region Azure Login
    async GetMsalInstance() {
        if (!this.msalInstance) {

            var config: Configuration = {
                auth: {
                    clientId: this.logininfo?.AzureClientID ? this.logininfo?.AzureClientID : "",
                    authority: this.logininfo?.AzureAuthoriry,
                    redirectUri: window.location.origin + "/login",
                    postLogoutRedirectUri: window.location.origin + "/",
                },
                cache: { cacheLocation: "localStorage", storeAuthStateInCookie: isIE },
                system: { allowNativeBroker: false }// Disables WAM Broker 
            };

            this.msalInstance = new PublicClientApplication(config);
            this.msalInstance.addEventCallback((event: EventMessage) => {

                if (event.eventType === "msal:loginSuccess") {

                    if (this.onLoginSuccess) {
                        const payload: any = event.payload;


                        this.msalInstance?.setActiveAccount(payload.account);


                        this.onLoginSuccess()
                    }
                }
            });
        }
        return this.msalInstance;

    }

    async InitLoginSetting() {

        if (!this.logininfo) {
            this.logininfo = await this.apiClient.Get(`${this.appendPath}/logininfo`);
        }

    }
    IninControlInfo() {
        const strUserInfo = sessionStorage.getItem("userInfo");

        var userInfo = undefined;
        if (strUserInfo) {

            userInfo = JSON.parse(strUserInfo)
            if (userInfo) {
                this.currentUser = userInfo;
                return { errorCode: 200, result: userInfo };
            }
        }
    }
    async InitAzureAuthInfo() {
        const strUserInfo = sessionStorage.getItem("userInfo");

        var userInfo = undefined;
        if (strUserInfo) {

            userInfo = JSON.parse(strUserInfo)
            if (userInfo) {
                this.currentUser = userInfo;


                sessionStorage.setItem("usr-id", userInfo.id ? userInfo.id : "");
                sessionStorage.setItem("usr-current-project", userInfo.prjID ? userInfo.prjID : "");
                sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
                sessionStorage.setItem("usr-token", userInfo.userToken ? userInfo.userToken : "");

                return { errorCode: 200, result: userInfo };
            }
        }

        var msalInstance = await this.GetMsalInstance();


        const accounts = msalInstance.getAllAccounts();

        if (accounts && accounts.length > 0) {
            var account = accounts[0];


            const request =
            {
                scopes: JSON.parse(this.logininfo?.AzureScopes ? this.logininfo.AzureScopes : "")
                , account: account
            };

            var response: AuthenticationResult = await msalInstance.acquireTokenSilent(request);
            var accessToken = response.accessToken;
            sessionStorage.setItem("apikey", accessToken);


            var resp = await this.LoginBizLogic({})


            return resp;

        }
        else {
            return null;
        }


    }
    async LoginBizLogic(param: any) {
        var resp = await this.apiClient.Post(`${this.appendPath}/login`, param);

        if (resp.errorCode === 200) {

            var loginResult: UserInfo = resp.result;
            sessionStorage.setItem("usr-id", loginResult.id ? loginResult.id : "");
            sessionStorage.setItem("usr-current-project", loginResult.prjID ? loginResult.prjID : "");
            sessionStorage.setItem("userInfo", JSON.stringify(loginResult));
            sessionStorage.setItem("usr-token", loginResult.userToken ? loginResult.userToken : "");
            this.currentUser = loginResult;

        }

        return resp
    }

    async LogoutBizLogic() {
        sessionStorage.setItem("apikey", "");
        sessionStorage.setItem("userInfo", "");
        sessionStorage.setItem("menus", "");
        this.currentUser = undefined;
    }
    async AzureLogin() {
        var instance = await this.GetMsalInstance();
        instance.loginRedirect({ scopes: JSON.parse(this.logininfo?.AzureScopes ? this.logininfo.AzureScopes : "") });
    }

    async AzureLogout() {
        sessionStorage.setItem("apikey", "");
        sessionStorage.setItem("userInfo", "");
        sessionStorage.setItem("menus", "");
        this.currentUser = undefined;
        var instance = await this.GetMsalInstance();
        instance.logoutRedirect();
    }

    //#endregion
    //#region RUN

    async RunActionModel(actionModel: ActionModel, inputValue?: KeyValue[]) {
        if (actionModel.CodeType === 'javascript') {
            return await this.RunJavascriptActionModelInputUsedByClient(actionModel, inputValue);


        }
        else {
            return await this.SendAction(actionModel, inputValue);
        }
    }
    async RunJavascriptActionModelInputUsedByClient(actionModel: ActionModel, inputValue?: KeyValue[]) {
        var jsonParams = ConvertJsonModelToObj2(actionModel.Inputs);
        if (inputValue) {
            for (var i in inputValue) {
                var v = inputValue[i];
                SetKeyValueforObj(v.key, v.value, jsonParams);
            }
        }
        var params = [];
        if (actionModel.Inputs) {
            for (var i in actionModel.Inputs) {
                var key = actionModel.Inputs[i].key;
                params.push({ key: key, value: jsonParams[key] })
            }
        }

        return RunJavascript(params, actionModel.Code);
    }
    async SendAction(actionModel: ActionModel, inputValue?: KeyValue[]) {
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/${actionModel.ProjectID}/${actionModel.ID}/run`,
            ConvertJsonModelToObj2(inputValue)
        );

        return rtn?.data;
    }
    async GetUnitModels(modeltype: string) {



        const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/list?modeltype=${modeltype}`);

        if (resp && resp.data && resp.data !== "ERROR") {
            return resp?.data?.sort((a: UnitModel, b: UnitModel) => {

                return a.col_name?.toLocaleLowerCase()?.localeCompare(b.col_name?.toLocaleLowerCase())
            });
        } else {
            return []
        }


    }

    async RunSchedule(model: ScheduleModel, inputValue?: KeyValue[]) {

        const resp = await this.apiClient.axiosService.post(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/${model.ID}/schedule`, ConvertJsonModelToObj2(inputValue));
        return resp?.data;
    }
    async StopSchedule(id: string) {

        const resp = await this.apiClient.axiosService.delete(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/${id}/schedule`);
        return resp?.data;
    }
    async GetPublicSettingMenu() {

        const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/publicsettingmenu`);
        return resp?.data;
    }
    async GetScheduleModels() {


        const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/schedule`);

        if (resp && resp.data && resp.data !== "ERROR") {
            return resp?.data?.sort((a: UnitModel, b: UnitModel) => {
                if (a.col_name < b.col_name) return -1;
                if (a.col_name > b.col_name) return 1;
                if (a.col_name === b.col_name) return 0;
            });
        } else {
            return []
        }
    }
    async GetApiModels() {


        const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/api`);

        if (resp && resp.data && resp.data !== "ERROR") {
            return resp?.data?.sort((a: UnitModel, b: UnitModel) => {
                if (a.col_name < b.col_name) return -1;
                if (a.col_name > b.col_name) return 1;
                if (a.col_name === b.col_name) return 0;
            });
        } else {
            return []
        }
    }
    async GetMcpModels() {


        const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/mcp`);

        if (resp && resp.data && resp.data !== "ERROR") {
            return resp?.data;
        } else {
            return []
        }
    }
    async GetUnitDetail(id: string, type: string, isCache: boolean) {


        return await GetCache(isCache, `GetUnitDetail${this.appendPath}${id}${type}`, async () => {
            const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/detail?id=${id}&type=${type}`);


            return resp?.data;
        })

    }

    async GetLayout(isCache: boolean) {


        return await GetCache(isCache, `GetLayout${this.appendPath}`, async () => {
            const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${this.appendPath}/layout`);
            return resp?.data;
        })
    }

    //#endregion



    //#region GET


    async GetGlobalKeys(isCache: boolean) {

        return await GetCache(isCache, `GetGlobalKeys`, async () => {
            const resp = await this.apiClient.axiosService.get(`${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/globalkey`);
            return resp?.data as string[];
        })

    }

    //#endregion

    //#region SAVE
    async SavePageModel(pageModel: PageModel) {


        const param = {
            pageModel: pageModel
        };
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/page`,
            param
        );

        return rtn?.data;
    }
    async SaveControlModel(ctrlModel: ControlModel) {

        if (ctrlModel.COL_TYPE && ctrlModel.COL_TYPE !== "Fixed") {
            ctrlModel.COL_CONTROL_PATH = 'component/panel/FunctionPanel';
        }

        const param = {
            ctrlModel: ctrlModel
        };
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/ctrl`,
            param
        );

        return rtn?.data;
    }
    async SaveComponentModel(actionModel: ActionModel) {

        actionModel.Regdate = new Date();
        const param = {
            actionModel: actionModel
        };
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/write`,
            param
        );

        return rtn?.data;


    }
    async SaveMCPAgent(mcpAgentModel: MCPAgentModel) {
        mcpAgentModel.Regdate = new Date();
        const param = {
            model: mcpAgentModel
        };
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/mcp/agent`,
            param
        );

        return rtn?.data;

    }
    async SaveTemplate(model: TemplateModel) {
        model.Regdate = new Date();
        const param = {
            model: model
        };
        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/template`,
            param
        );

        return rtn?.data;

    }
    async DeleteUnitModel(id?: string) {
        const rtn = await this.apiClient.axiosService.delete(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/delete?id=${id}`
        );

        return rtn?.data === "SUCCESS";
    }

    async DeleteCoreFile(id?: string) {
        const rtn = await this.apiClient.axiosService.delete(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/core?id=${id}`
        );

        return rtn?.data === "SUCCESS";
    }
    async SaveDBConnectionInfo(model: DBConnectionModel) {
        if (model.config)
            model.config.regdate = new Date();

        const rtn = await this.apiClient.axiosService.post(
            `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/config`,
            model
        );

        return rtn?.data;
    }

    onCreateProc = async () => {
        var item: ActionModel = { ID: Guid(), Name: "New Procedure", Desc: "", ModelType: "PROC", Return: {} };
        await this.SaveComponentModel(item);
        return item.ID;
    }
    onCreateFunc = async () => {
        var item: ActionModel = { ID: Guid(), Name: "New Function", Desc: "", Inputs: [], Return: {}, ModelType: "FUNC", };
        await this?.SaveComponentModel(item);

        return item.ID

    }
    onCreateRestAPI = async () => {

        var item: ActionModel = {
            ID: Guid(), Name: "New Rest API", Desc: "", Method: "GET", Url: "", SubUrl: ""
            , Inputs: [{ displayName: "Header", key: "Header", jsonType: "Object" }
                , { displayName: "Input", key: "Input", jsonType: "Object" }
                , { displayName: "Body", key: "Body", jsonType: "Object" }]
            , Return: {}
            , ModelType: "RESTAPI"
        }
        await this?.SaveComponentModel(item);
        return item.ID

    }
    OnCreateOrch = async () => {
        var item: OrchestrationModel = { ID: Guid(), Name: 'New Flow', Desc: '', ModelType: "OCST", Return: {} };
        await this.SaveComponentModel(item);

        return item.ID
    };
    onCreatePrompt = async () => {
        var item: OrchestrationModel = { ID: Guid(), Name: 'New Prompt', Desc: '', ModelType: "PROMPT", Return: {} };
        await this.SaveComponentModel(item);

        return item.ID
    };

    onCreateOpenAI = async () => {
        var item: OrchestrationModel = { ID: Guid(), Name: 'New LLM Model', Desc: '', ModelType: "OPENAI", Return: {} };
        await this.SaveComponentModel(item);

        return item.ID
    };

    onCreateSchd = async () => {
        var item: OrchestrationModel = { ID: Guid(), Name: 'New Schedule', Desc: '', ModelType: "SCHD", Return: {} };
        await this?.SaveComponentModel(item);

        return item.ID
    }

    onCreateMCPAgent = async () => {
        var item: MCPAgentModel = {
            ID: Guid()
            , Name: 'New MCP Agent Server'
            , Desc: ''
            , Version: "1.0.0.0"
            , Path: ""
            , FullUrl: ""
            , Tools: []
        };
        await this?.SaveMCPAgent(item);

        return item.ID
    }

    onCreateTemplate = async () => {
        var item: TemplateModel = {
            ID: Guid()
            , Name: 'New Template'
            , Desc: ''
            , Version: "1.0.0.0"
            , Requirements: []
            , CustomFiles: []
            , EnvKeys: []
            , UnitModels: []
        };
        await this?.SaveTemplate(item);

        return item.ID
    }
    onCreateCtrl = async () => {
        var id = Guid();
        await this.SaveControlModel({
            PK_ID: id,
            COL_NAME: 'New Control',
            COL_DESC: '',
            COL_TYPE: 'Function',
            COL_CONTROL_PATH: '',
            ShowTitle: true,
        });

        return id;
    }

    onCreatePage = async () => {


        var newMenu: PageModel =
        {
            ID: Guid(),
            ParentID: "",
            GroupName: "",
            MenuName: 'New Menu',
            MenuDesc: '',
            Path: '',
            MenuPath: '',
            Type: "Page",
            Items: undefined,
            Index: -1,
            FullUrl: '',
            FirstMenuFullUrl: '',
            ShowBreadcumb: true,
            ShowTitle: true,
            ShowControlAffix: false
        }



        await this.SavePageModel(newMenu);


        return newMenu.ID;

    }

    onCreateConfig = async () => {

        var id = Guid();
        var item: DBConnectionModel = { id: id, config: { name: "New DB Config" } };
        await this.SaveDBConnectionInfo(item);


        return id;

    }

    //#endregion



    onHandleKeyDown = (e: any) => {
        if (
            e.ctrlKey &&
            (e.keyCode == "61" ||
                e.keyCode == "107" ||
                e.keyCode == "173" ||
                e.keyCode == "109" ||
                e.keyCode == "187" ||
                e.keyCode == "189")
        ) {
            e.preventDefault();
        }
        if (this.keyDownHandler) {
            this.keyDownHandler(e)
        }

    };
    onHandleKeyUp = (e: any) => {
        if (this.keyUpHandler) {
            this.keyUpHandler(e)
        }
    }
    onHandleWheel = (e: any) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    };
}