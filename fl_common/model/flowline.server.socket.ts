import { ActionAuth, Dictionary, IFlowConfiger, KeyValue, LauncherLog } from "./models.js"
import { RunCommand,RunChatCoder,RunAction } from "./launcher.js";
import { BuilderConfiger } from "configer.builder.js";


export class FlowLineSocketServer {
    namespace: any;
    userToSocketIds :Dictionary<any[]>;
    getConfigerHandler:(prjID?:string)=>IFlowConfiger;
    constructor(namespace: any,handler:(prjID?:string)=>IFlowConfiger) {
        this.namespace = namespace;
        this.userToSocketIds = {};
        this.getConfigerHandler = handler;

    }

    private _GetAuth(socket: any): ActionAuth {
        return { userID: socket.handshake.auth.usrid
            , token: socket.handshake.auth.token
            , userToken:socket.handshake.auth.usertoken
            , prjID :socket.handshake.auth.prjid
        };
    }

    Run() {
        this.namespace.on('connect', (socket: any) => {
            const ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
            const id = socket.id;
            //console.log(`CODE LAUNCHER 연결 - 클라이언트IP: ${ip}, 소켓ID: ${id}`);


            var obj = this._GetAuth(socket);
            if(obj.userID){
                var lst = this.userToSocketIds[obj.userID];
                if(!lst){
                    lst =[];
                    this.userToSocketIds[obj.userID] =lst;
                }
                lst.push(socket.id)

                
            }

            
            socket.on('req_action', async (connectionID: string,projectID:string,actionID:string, data: any) => {
                var configer= this.getConfigerHandler(projectID);
                
                await configer?.CheckReload();
                
                RunAction(configer,{actionid:actionID,inputs:data}, this._GetAuth(socket), (type: string, cactionid: string, cactionname: string, r: any) => {
                    socket.emit(type, connectionID, cactionid, cactionname, r);
                    
                });
            });

            socket.on('req_install', (connectionID: string, prjid: string, cmd: string) => {
                var configer= this.getConfigerHandler(prjid);
                var auth = this._GetAuth(socket)
                
                RunCommand(configer,prjid,auth.userID?auth.userID:"", cmd, (t: string, actionid: string, actionname: string, r: any) => {
                    socket.emit(t, connectionID, actionid, actionname, r);
                });
            });

            socket.on('req_core_file', async (connectionID: string, prjid: string, files: KeyValue[]) => {
                var configer= this.getConfigerHandler(prjid) as BuilderConfiger;
                var auth = this._GetAuth(socket)
                if(configer && auth.userID){
                    
                    await configer.WriteCoreList(prjid,auth.userID,files,(isSuccess:boolean,str:string)=>{
                    
                        socket.emit(isSuccess?"res_core_file_message":"res_core_file_message_err", connectionID, "", "",str);
                    });

                     socket.emit("res_close", connectionID, "", "","");
                }
                
                
            });


            socket.on('req_deploy', (connectionID: string,endpointID:string,profileID:string,loggingLvl:string,loggingUrl:string,) => {
                var auth = this._GetAuth(socket);
                var userID = auth.userID;
                var prjID= auth.prjID;
                (this.getConfigerHandler() as BuilderConfiger).Deploy(userID?userID:"",prjID,endpointID,profileID,loggingLvl,loggingUrl,"DEPLOY", (type: string, msg: string, percent: number) => {
                    socket.emit("res_deploy", connectionID, type, msg, percent);
                });
            });


             socket.on('req_export', (connectionID: string,templateID:string,prjid:string) => {
                var userID = this._GetAuth(socket).userID;
                (this.getConfigerHandler() as BuilderConfiger)?.Export(userID?userID:"",templateID,prjid, (type: string, msg: string, percent: number) => {
                    socket.emit("res_export", connectionID, type, msg, percent);
                });
            });
            socket.on('req_import', (connectionID: string,prjid:string,info:any) => {
                var userID = this._GetAuth(socket).userID;
                (this.getConfigerHandler() as BuilderConfiger)?.Import(userID?userID:"",prjid,info, (type: string, msg: string, percent: number) => {
                    socket.emit("res_import", connectionID, type, msg, percent);
                });
            });
            socket.on('req_chat_corder', (connectionID: string,ai:string,message:string,prompt:string) => {
                RunChatCoder(this.getConfigerHandler(),ai,message,prompt, this._GetAuth(socket), (type: string, actionid: string, actionname: string, r: any) => {
                    socket.emit("res_chat_corder", connectionID,type, actionid,actionname,r);
                });
            });

            socket.on('req_clear', (projectid:string) => {
                this.getConfigerHandler(projectid).Clear();
            });

            socket.on('req_user_project', (projectid: string) => {
                var obj = this._GetAuth(socket);
                if (obj.userID) {
                    var lst = this.userToSocketIds[obj.userID];

                    if (lst && lst.length > 0) {


                        lst.forEach(socketId => {

                            var targetSocket = this.namespace.sockets.get(socketId);
                            if (targetSocket) {
                                targetSocket.emit('res_user_project', projectid);
                            }
                        });

                    }
                }
            });
            socket.on('disconnect', (reason: string) => {

                var obj = this._GetAuth(socket);
                if(obj.userID){
                    var lst = this.userToSocketIds[obj.userID];
                    if(lst){
                        var findIndex = lst.findIndex(x=>x === socket.id);
                        if(findIndex > -1){
                            lst.splice(findIndex,1)
                        }
                    }
                    
                }
                //console.log(`CODE LAUNCHER 연결 종료 - 클라이언트IP: ${ip}, 소켓ID: ${socket.id}`);
            });

            socket.on('error', (error: Error) => {
                //console.log(`CODE LAUNCHER 에러 발생 - 클라이언트IP: ${ip}, 소켓ID: ${socket.id}, 에러: ${error}`);
            });
        });
    }
}

