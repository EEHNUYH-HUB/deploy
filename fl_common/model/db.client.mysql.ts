import mysql,{Pool,PoolOptions} from 'mysql2/promise'

import { DBConnectionInfo, DBResult, DBTableModel, IDBClient } from "./models.js";
import { ConvertJsonToKeyValueObject } from './util.common.js';

export class MySqlClient implements IDBClient{

    private _pool:Pool;
    constructor(config:DBConnectionInfo) {


        var numPort = undefined;
        if(config.port){
            
            numPort =  parseInt(config.port?.toString())
        }
        var dbconfig:PoolOptions = {
            host: config.server?.trim(),
            user: config.user?.trim(),
            password: config.password,
            database: config.database?.trim(),
            port: numPort
        }


        this._pool = mysql.createPool(dbconfig);
    }

    async connect() {
        var conn = await this._pool.getConnection();
        return conn;
    }

    async connectionTest (){
        try{
         var conn = await this.connect()
         
         conn.release();

         return true;
        }
        catch (e) {
            return false;
        }
        
    }
    private async _request(spName:string, params:any) {
        try {

            var strParams = "(";

            if (params && params.constructor === Object) {
                var property = Object.getOwnPropertyNames(params);
                var newParams = [];
                for (var i in property) {
                    var pName = property[i];
                    newParams.push(params[pName]);
                }
                params = newParams;
            }
            if (params && params.length > 0) {

                // for (var i = 0; i < params.length; i++) {
                //     strParams += (i == 0 ? "" : ",") + "?";
                // }
                for (var i in params) {
                    var intI = parseInt(i);
                    strParams += (intI == 0 ? "" : ",") + "?";
                 }
            }
            else {
                params = null;
            }
            strParams += ")";
            var cmd = {
                text: 'call ' + spName + strParams,
                values: params
            }


            var conn = await this.connect();
            var [result] = await conn.query(cmd.text, params)

            conn.release();

            return result;
        }
        catch (e) {
            console.log(spName)
            console.log(params)
            console.log(e);
            return null;
        }
    }
    async Dataset(spName:string, params:any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result){
            if (result.constructor === Array) {
                if (result.length > 0) {
                    obj.result = [];
                    for (var i in result) {
                        var table = result[i];
                        if (table.constructor === Array) {
                            obj.result.push(table);
                        }
                    }
                }

            }
           
        }
        return obj;

    }
    async Datatable(spName:string, params:any) {

        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result){
        if ( result.constructor === Array) {
            if (result.length > 0)
                obj.result = result[0];
        }
       
    }
        return obj;

    }

    async Execute(spName:string, params:any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = true;
        // obj.result = null;
        // if (result) {
        //     if (result.constructor === Array) {
        //         if (result.length > 0)
        //             obj.result = true;
        //     }
        // }
        return obj;

    }

    async Scalar(spName: string, params: any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result) {
            if (result.constructor === Array) {
                var firstObj = this._getFirstObject(result);
                if (firstObj) {

                    var ps = Object.getOwnPropertyNames(firstObj);

                    if (ps && ps.length > 0)
                        obj.result = firstObj[ps[0]];
                }

            }
        }
        return obj;
    }
    async Query(code: string,resultType:string="Datatable") {
        var conn = await this.connect();
        var [result] = await conn.query(code)

        var obj = new DBResult;
        if (resultType === "Datatable") {

            if (result) {
                obj.result = result;
            }
        }
        else if (resultType === "FirstRow") {

            if (result && result.constructor === Array && result.length > 0) {
                obj.result = result[0];
            }
            else {
                obj.result = result
            }
        }
        else if (resultType === "StartColumnValue") {

            if (result && result.constructor === Array && result.length > 0) {
                var row = result[0]
                var s = ConvertJsonToKeyValueObject(row);
                if (s && s.length > 0) {
                    obj.result = s[0].value;
                }
            }
            else {
                var s = ConvertJsonToKeyValueObject(result);
                if (s && s.length > 0) {
                    obj.result = s[0].value;
                }
            }

        } else if (resultType === "Execute") {
            obj.result = true
            // if (result && result.constructor === Array && result.length > 0) {
            //     obj.result = result.length > 0;
            // }
            // else {
            //     obj.result = result
            // }
        }

        return obj;
    }
     
    private _getFirstObject(obj: any[]) {
        if (obj.constructor === Array && obj.length > 0) {
            return obj[0];
        }
        else {
            return obj;
        }
    }

    async GetTableList(){

        
        var lst: DBTableModel[] = [];

      

        return lst;

    }

    async GetProcList(){
        var lst: DBTableModel[] = [];

      

        return lst;
    }

    async Dispose() {
        await this._pool.end();
    }

}