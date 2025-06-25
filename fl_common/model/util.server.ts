import { ActionModel,  PromptInputs,  ActionAuth, DBConnectionInfo, EnvModel } from "./models.js";
import fs from 'fs'
import path from 'path'
import dotenv from "dotenv"
import {  RunJavascriptActionModelInput } from "./util.common.js";
import jwt from "jsonwebtoken";
import axios from 'axios';
import { Decrypt } from "./util.crypto.js";
import unzipper from 'unzipper';
dotenv.config();

//test2
export class FlowCommonPath{

    private static _rootDir:string = "./src/dynamic";
    static SetRootDir =(dir:string) =>{ this._rootDir = dir;}
    static GetRootDir = () => {
        return this._rootDir;
    }

    static GetConfigDir = () => {
        return `${this.GetRootDir()}/config`;
    }

    static GetImportDir = (path:string) => {
        var rtn = `${this.GetRootDir()}/import/${path}`;
        if (!fs.existsSync(rtn))
            fs.mkdirSync(rtn, { recursive: true });
        return rtn;
    }

    static GetDir = (id: string) => {
        var rtn = `${this.GetConfigDir()}/${id}`;
        if (!fs.existsSync(rtn))
            fs.mkdirSync(rtn, { recursive: true });
        return rtn;
    }

    static GetPythonDir = (prjID: string) => {
        var rtn = `${this.GetDir(prjID)}/python`;
        if (!fs.existsSync(rtn))
            fs.mkdirSync(rtn, { recursive: true });
        return rtn;
    }
    static GetNodejsDir = (prjID: string) => {
        var rtn = `${this.GetDir(prjID)}/nodejs`;
        if (!fs.existsSync(rtn))
            fs.mkdirSync(rtn, { recursive: true });
        return rtn;
    }

    static GetPythonPath = (prjID: string, id: string) => {
        return `${this.GetPythonDir(prjID)}/${id}.py`
    }
    static GetNodejsPath = (prjID: string, id: string) => {
        return `${this.GetNodejsDir(prjID)}/${id}.js`
    }

    static GetEnvSettingPath = (prjID: string) => {
        return `${this.GetDir(prjID)}/.env`
    }

    //#endregion
    static GetRunPath = (prjID: string | undefined, actionID: string, type?: string) => {

        var path = ""
        var runPath = ""

        if (prjID) {
            if (type === "python") {

                path = this.GetPythonPath(prjID, actionID)
                runPath = "python"
                if (process.env.PYTHONPATH){
                    // kbh: python 경로를 각 프로젝트의 가상환경 경로로 변경
                    runPath = this.GetPythonRunPathByProjectId(prjID);
                    // runPath = process.env.PYTHONPATH;
                }
            }
            else {

                path = this.GetNodejsPath(prjID, actionID);
                runPath = "node"
            }
        }

        return { SourcePath: path, RunPath: runPath };
    }

    //폴더 삭제, 하위폴더, 모든 파일 삭제
    static DeleteFolderRecursive= async (folderPath:string) =>{
    
        if (await fs.promises.stat(folderPath).catch(() => false)) {
            const files = await fs.promises.readdir(folderPath);
            for (const file of files) {
                const curPath = path.join(folderPath, file);
                const stat = await fs.promises.lstat(curPath);
                if (stat.isDirectory()) {
                    await FlowCommonPath.DeleteFolderRecursive(curPath); // 재귀적으로 삭제
                } else {
                    try{
                        await fs.promises.unlink(curPath); // 파일 삭제
                    }catch(error:any){
                        console.log('Error occurred while deleting:', error)
                    }
                }
            }
            try{
                await fs.promises.rmdir(folderPath); // 폴더 삭제
            }catch(error:any){
                console.log('Error occurred while deleting:', error)
            }
        }
    }

    //프로젝트 가상환경의 파이썬 실행 경로 반환
    static GetPythonRunPathByProjectId = (prjID: string | undefined) => {
        var runPath = "";
        if(prjID && process.env.PYTHONPATH && process.env.CONDA_BASE_ENV_NAME) {
            runPath = process.env.PYTHONPATH;
            var baseEnvName = process.env.CONDA_BASE_ENV_NAME;
            runPath = runPath.replace(baseEnvName, prjID);
        }else{
            console.log('GetPythonRunPathByProjectId not replace!');
        }
        
        return runPath;
    }

    //프로젝트 가상환경의 Pip 실행 경로 반환
    static GetPipRunPathByProjectId = (prjID: string | undefined) => {
        var runPath = "";
        if(prjID && process.env.PIPPATH && process.env.CONDA_BASE_ENV_NAME) {
            runPath = process.env.PIPPATH;
            var baseEnvName = process.env.CONDA_BASE_ENV_NAME;
            runPath = runPath.replace(baseEnvName, prjID);
        }else{
            console.log('GetPipRunPathByProjectId not replace!');
        }
        
        return runPath;
    }

    //파일 존재 여부 확인
    static FileExists = async (filePath: string): Promise<boolean> => {
        try{
            await fs.promises.access(filePath);
            return true;
        }catch{
            return false;
        }
    }

    static WriteNodePackage = async (prjID: string, absolutePath: string) => {
        const packageJsonPath = path.join(absolutePath, 'package.json');


       if (!await FlowCommonPath.FileExists(packageJsonPath)) {
                        var str = `{
  "name": "${prjID}",
  "version": "1.0.0",
  "main": "index.js",
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}`
            await fs.promises.writeFile(packageJsonPath, str);
        }
    }
}



export const DownloadImage = async (url:string, path:string, token:string) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', headers: { Authorization: token } });
        
        await fs.promises.writeFile(path, response.data);
        
    } catch (ex) {
        console.log("ERROR", ex);
    }
}

export const TokenToPayload =(token:string)=>{
    
    if (token) {
        const decoded = jwt.decode(token, {
            complete: true
        });

        
        return decoded?.payload;
    }
    return undefined;

    
}

export const GenerateUserToken =(userInfo:any,key:any)=>{
    return jwt.sign(userInfo, key);
}
export const ValidUserToken =(token:string,key:any)=>{
    return jwt.verify(token, key);
}
export const CheckFileExists = async (filePath:string) => {
    try {
        await fs.promises.access(filePath);
        return true
    } catch (err) {
       return false
    }
}

  
  
export const  GetGlobalValue = (key: any|undefined, auth: ActionAuth|undefined,envs:EnvModel[]|undefined) =>{

    
    var strKey = key?.toString();
    if (strKey && strKey.indexOf("@USER.") > -1) {
        var userKey = strKey.replace("@USER.","");

        
        if (userKey === "TOKEN") {
            
            key = auth?.token;
        }
        else if(userKey === "AUTHORIZATION"){
            
            key = `Bearer ${auth?.token}`;
        }
        else if((userKey === "NAME" || userKey === "EMAIL" ) &&auth?.token){
            
            var payload:any = TokenToPayload(auth?.token);
            if(payload){
                if(userKey === "NAME" && payload.name){
                    key = payload.name;
                }
                else if(userKey === "EMAIL" && payload.upn){
                    key = payload.upn;
                }
                else if(userKey === "AZUREOBJECTID" && payload.oid){
                    key = payload.oid;
                }
            }
        }
        else if(auth?.userToken){
            var userInfo:any = ValidUserToken(auth?.userToken,auth.prjID)
            
            if(userInfo){
                key =userInfo[userKey]
            }

        }
    }
    else if (envs && envs.length > 0 && strKey && strKey.indexOf("@ENV.") > -1) {
        var envKey = strKey.replace("@ENV.", "");


        var findObj = envs.find(x => x.Key === envKey);
        if (findObj) {
            var strValue = findObj.Value ? findObj.Value : findObj.DefaultValue;
            if (strValue) {
                if (findObj.Type === "String") {
                    key = strValue;
                }
                else if (findObj.Type === "Password") {
                    key = Decrypt(strValue);
                }
                else if (findObj.Value === "Boolean") {
                    key = strValue?.toString()?.toLocaleLowerCase() === "true" ? true : false;
                }
                else if (findObj.Type === "Number") {
                    try {
                        key = parseInt(strValue);
                    }
                    catch {

                    }
                }
            }
        }

        

    }
    
    
    return key;   
}
export  const BindingGlobalValueDBConnectionInfo= (info:DBConnectionInfo,envs:EnvModel[] )=>{
    
    info.server = GetGlobalValue(info.server,undefined,envs);
    info.user = GetGlobalValue(info.user,undefined,envs);
    info.password = GetGlobalValue(info.password,undefined,envs);
    info.database = GetGlobalValue(info.database,undefined,envs);
    info.port = GetGlobalValue(info.port,undefined,envs);
    info.ssl = GetGlobalValue(info.ssl,undefined,envs);
    return info;
}
export const GetPromptInputs = (auth:ActionAuth,actionModel: ActionModel, inputValue: any,envs:EnvModel[] ) => {
    var rtn: PromptInputs = {};
    
    rtn.in_api_key = GetGlobalValue(actionModel.ApiKey,auth,envs);
    rtn.in_azure_endpoint = GetGlobalValue(actionModel.EndPoint,auth,envs);
    rtn.in_temperature =  GetGlobalValue(actionModel.Temperature,auth,envs);
    rtn.in_max_tokens =  GetGlobalValue(actionModel.MaxTokens,auth,envs);
    rtn.in_api_version =  GetGlobalValue(actionModel.ApiVersion,auth,envs);
    rtn.in_azure_deployment =  GetGlobalValue(actionModel.Deployment,auth,envs);
    if (actionModel.Code)
        rtn.in_prompt_content = RunJavascriptActionModelInput(actionModel.Inputs, inputValue, actionModel.Code)
    else
        rtn.in_prompt_content = "";
    return rtn;
}
export const BindingGlobalValueInputValue = (auth:ActionAuth,inputValue: any,envs:EnvModel[] ,  findHandle?: Function) => {
    if (inputValue) {
        if (inputValue.constructor === Array) {
            for (var i in inputValue) {
                BindingGlobalValueInputValue(auth,inputValue[i],envs);
            }
        }
        else if (inputValue.constructor === Object) {
            var ps = Object.getOwnPropertyNames(inputValue);
            for (var i in ps) {
                var pName = ps[i];
                BindingGlobalValueInputValue(auth,inputValue[pName], envs, (newValue: any) => {
                    inputValue[pName] = newValue;
                });
            }
        }
        else {

            var value = GetGlobalValue(inputValue,auth,envs); //sharedValue.find(x => x.key === inputValue);
            if (value !== undefined && value !== null && inputValue !== value && findHandle) {
                findHandle(value)
            }

        }
    }
}


 export const UnzipFile = async (zipFilePath: string, outputDir: string) => {
            return new Promise((resolve, reject) => {
                fs.createReadStream(zipFilePath)
                    .pipe(unzipper.Parse())
                    .on('entry', (entry) => {
                        const filePath = path.join(outputDir, entry.path);
                        const directory = path.dirname(filePath);
    
                        // 디렉토리가 존재하지 않으면 생성
                        fs.mkdir(directory, { recursive: true }, (err) => {
                            if (err) {
                                console.error('Error creating directory:', directory, err);
                                reject(err);
                                return;
                            }
    
                            // 파일이 디렉토리인지 확인
                            if (entry.type === 'Directory') {
                                fs.mkdir(filePath, { recursive: true }, (err) => {
                                    if (err) {
                                        console.error('Error creating directory:', filePath, err);
                                        reject(err);
                                    } else {
                                        entry.autodrain();
                                    }
                                });
                            } else {
                                entry.pipe(fs.createWriteStream(filePath))
                                    .on('error', (err: any) => {
                                        console.log('Error writing file:', filePath, err);
                                        reject(err);
                                    });
                            }
                        });
                    })
                    .on('close', resolve)
                    .on('error', (err) => {
                        console.log('Error during extraction:', err);
                        reject(err);
                    });
            });
        };