import io, {Socket} from "socket.io-client";
import { ActionModel, KeyValue } from  'flowline_common_model/src/models'


import { ConvertJsonModelToObj2, Guid } from "flowline_common_model/src/util.common";
import { GetBaseUrl } from './ui.utils.js';


export default class FlowLineSocketClient {
    
    
    url : string ="";
    path : string ="";
    socketClient? :Socket;


    
    receivedEvents?:any;
    
    onConnectedEvent? : ()=>void;
    
    public constructor(url:string, path:string){
        this.url  = url;
        this.path  = path;
        
    }
    public Connection(usrID:string,token:string,prjID:string,userToken:string){
        this.receivedEvents = {};
        
        
        //userInfo
        this.socketClient = io(this.url, { path: this.path, transports: ['websocket']
            ,auth:{token:token,usrid:usrID,prjid:prjID,usertoken:userToken} });
        this.socketClient.on("connect", () => {
            if(this.onConnectedEvent)
                this.onConnectedEvent();
        });

        var cmds = ['res_out','res_err','res_close','res_result','res_stream','res_state', 'res_input', 'res_sub_result','res_log','res_core_file_message','res_core_file_message_err']

        for(var i in cmds){
            this.BindingEvent(cmds[i])
        }

        this.socketClient?.on("res_deploy", (connectionID,type,msg,percent) => {
            if (this.receivedEvents && this.receivedEvents[connectionID]){
                this.receivedEvents[connectionID](type, msg,percent)
            }
        });
        this.socketClient?.on("res_export", (connectionID,type,msg,percent) => {
            if (this.receivedEvents && this.receivedEvents[connectionID]){
                this.receivedEvents[connectionID](type, msg,percent)
            }
        });
        this.socketClient?.on("res_import", (connectionID,type,msg,percent) => {
            if (this.receivedEvents && this.receivedEvents[connectionID]){
                this.receivedEvents[connectionID](type, msg,percent)
            }
        });
        this.socketClient?.on("res_chat_corder",(connectionID,messageType,aiID,aiName,message)=>{
            if (this.receivedEvents && this.receivedEvents[connectionID]){
                this.receivedEvents[connectionID](messageType,aiID,aiName,message)
            }
        })
        this.socketClient?.on("res_user_project",(projectId)=>{

            localStorage.setItem("flowline", "");
            
            sessionStorage.setItem("usr-current-project", projectId);
            var strUserInfo = sessionStorage.getItem("userInfo");
            if (strUserInfo) {
                var userInfo = JSON.parse(strUserInfo)
                userInfo.prjID = projectId
                sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
            }
            
            sessionStorage.setItem("GetGlobalKeys", "")
            window.location.reload()
        })
        
        
    }
    private BindingEvent(type:string){
        this.socketClient?.on(type, (connectionID,actionid,actionname,data) => {
            
            if (this.receivedEvents && this.receivedEvents[connectionID]){
                this.receivedEvents[connectionID](type, actionid,actionname,data)
            }
        });
    }
    public GetReceivedEvents =()=>{
        return this.receivedEvents
    }
    public AddReceivedMessage(id: string, handler: (responseType: string, actionID: any, actionName: any, result: any,typingEndEvent?:Function) => void) {
        if (this.receivedEvents)
            this.receivedEvents[id] = handler;
    }
    public RemoveReceivedMessage(id: string) {
        if (this.receivedEvents)
            this.receivedEvents[id] = undefined;
    }
    public SendDeploy(connctionID:string,endpointID:string,profileID:string,loggingLvl:string){
        this.socketClient?.emit("req_deploy",  connctionID,endpointID,profileID,loggingLvl,`${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}`);
    }
    public SendExport(connctionID:string,templateID:string,projectid:string){
        this.socketClient?.emit("req_export",  connctionID,templateID,projectid);
    }
    public SendImport(connctionID:string,projectid:string,info:any){
        this.socketClient?.emit("req_import",  connctionID,projectid,info);
    }
    public SendAction(connectionID:string,projectid:string,actionModel:ActionModel,inputValue?:KeyValue[]){
        this.socketClient?.emit("req_action",  connectionID,projectid,actionModel.ID,ConvertJsonModelToObj2(inputValue));
    }
    public SendActionAndReceivedEvents(connectionID:string,projectid:string,actionModel:ActionModel,inputValue:KeyValue[]|undefined
        ,handler: (responseType: string, actionID: any, actionName: any, result: any) => void){
        this.AddReceivedMessage(connectionID,handler)
        this.socketClient?.emit("req_action",  connectionID,projectid,actionModel.ID,ConvertJsonModelToObj2(inputValue));
    }

    public SendActionAsync(projectid:string,actionModel:ActionModel,inputValue:KeyValue[]|undefined): Promise<any> {
        
        var rtn: any;
        var connectionID = Guid()
        return new Promise((resolve, reject) => {

            const innerHandler = (responseType: string, actionID: any, actionName: any, result: any) => {

                if (responseType === "res_result") {
                    rtn = result;
                }
                else {
                    if (responseType === "res_close") {
                        resolve(rtn);
                    }
                }

            };

            this.AddReceivedMessage(connectionID, innerHandler);
            this.socketClient?.emit("req_action", connectionID, projectid, actionModel.ID, ConvertJsonModelToObj2(inputValue));
        });
    }
    
    public SendInstall(connectionID:string,cmd:string){
        var prjID = sessionStorage.getItem("usr-current-project")
        this.socketClient?.emit("req_install",connectionID,prjID, cmd);
    }
    public SendCoreFileList(connectionID:string,files:KeyValue[]){
        var prjID = sessionStorage.getItem("usr-current-project")
        this.socketClient?.emit("req_core_file",connectionID,prjID, files);
    }
    public SendChatCorder(connectionID:string,ai:string,message:string,prompt:string){
        this.socketClient?.emit("req_chat_corder",connectionID,ai, message,prompt);
    }
    public SendClear(projectid?:string){
        this.socketClient?.emit("req_clear",projectid);
    }
    public SendUserProjectId(projectid?:string){
        this.socketClient?.emit("req_user_project",projectid);
    }
    public IsConnected(){
        return this.socketClient?.connected;
    }
    public Disconnection(){
        this.socketClient?.disconnect();
        this.onConnectedEvent = undefined;
        this.receivedEvents = undefined;
    }
   
    
}

