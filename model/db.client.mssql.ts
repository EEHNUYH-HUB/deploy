import { DBConnectionInfo, DBResult, DBTableColumn, DBTableModel, IDBClient } from "./models.js";
import sql, { config, ConnectionPool }  from 'mssql'
import  {ConvertJsonToKeyValueObject, JsonQuery} from './util.common.js'



export class MsSqlClient implements IDBClient{
    
    private _pool:ConnectionPool;
    private _isConnected:boolean;
    constructor(config:DBConnectionInfo) {


        var numPort = undefined;
        if(config.port){
            
            numPort =  parseInt(config.port?.toString())
        }

      var  dbconfig:config = {
            user: config.user?.trim(),
            password: config.password,
            server: config.server?config.server.trim():"",
            database: config.database?.trim(),
            port:numPort,
            options: {
                encrypt: false,
                enableArithAbort: true,
                trustServerCertificate:true
            }
        }


        this._pool = new sql.ConnectionPool(dbconfig);
        this._isConnected = false;
    }
    async connectionTest (){
        await this.connect();
        
       return this._isConnected;
       
   }
    async connect() {
        if (!this._isConnected) {
            try {
                
                await this._pool?.connect();
                this._isConnected = true;
            }
            catch (ex) {
                this._isConnected = false;
                return null;
            }
        }

        return this._pool

    }

    private async _request(spName:string, params:any) {
        await this.connect();

        
        const rqt = this._pool.request()
        if (params) {
            
            var keyValue = (ConvertJsonToKeyValueObject(params))
            if (keyValue) {
                for (var i in keyValue) {
                    var v = keyValue[i];
                    rqt.input(v.key, v.value)
                }
            }
        }
        var r = await rqt.execute(spName);

        return r;
    }
    async Dataset(spName:string, params:any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;

        if (result && result.recordsets)
            obj.result = result.recordsets;
        return obj;

    }
    async Datatable(spName:string, params:any) {

        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result && result.recordset)
            obj.result = result.recordset;

        return obj;

    }

    async Execute(spName:string, params:any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = true;
        // if (result && result.rowsAffected && result.rowsAffected.length > 0) {
        //     obj.result = result.rowsAffected[0] > 0
        // }
        return obj;

    }

    async Scalar(spName:string, params:any) {
        var result = await this._request(spName, params);


        var obj = new DBResult;
        obj.result = null;
        if (result) {
            if(result.returnValue)
                obj.result = result.returnValue;
            else if(result.recordset && result.recordset.length > 0){

                var row = result.recordset[0];
                var s = ConvertJsonToKeyValueObject(row);
                if (s && s.length > 0) {
                    obj.result = s[0].value;
                }
            }
        }

        return obj;
    }
    async Query(code:string,resultType:string="Datatable"){
        await this.connect();

        const rqt = await this._pool.request()


        
        var result = await rqt.query(code);

        var obj = new DBResult;
        obj.result = null;
        if(resultType === "Datatable"){
            
            if (result && result.recordset)
                obj.result = result.recordset;
    
        }
        else if(resultType === "FirstRow"){
            
            if (result && result.recordset && result.recordset.length > 0) {
                obj.result = result.recordset[0];
            }
        }
        else if(resultType === "StartColumnValue"){
            if (result && result.recordset && result.recordset.length > 0) {

                var row = result.recordset[0]
                var s = ConvertJsonToKeyValueObject(row);
                if (s && s.length > 0) {
                    obj.result = s[0].value;
                }
    
            }
        }else if(resultType === "Execute"){
            obj.result = true;
            // if (result && result.rowsAffected && result.rowsAffected.length > 0) {
            //     obj.result = result.rowsAffected[0] >= 0
            // }
        }

        
        return obj;
    }
    
    async GetTableList() {

        var code = `
SELECT 
    T.TABLE_NAME,
    C.COLUMN_NAME,
    C.DATA_TYPE,
    CASE WHEN U.PKCNT > 0 THEN 1 ELSE 0 END AS PK,
    CASE WHEN U.FKCNT > 0 THEN 1 ELSE 0 END AS FK,
    U.REF_TABLE_NAME,
    U.REF_PK_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.TABLES AS T
INNER JOIN 
    INFORMATION_SCHEMA.COLUMNS AS C ON T.TABLE_NAME = C.TABLE_NAME AND T.TABLE_SCHEMA = C.TABLE_SCHEMA
LEFT OUTER JOIN (
    SELECT 
        A.TABLE_NAME,
        B.COLUMN_NAME,
        A.CONSTRAINT_NAME,
        D.TABLE_NAME AS REF_TABLE_NAME,
        D.COLUMN_NAME AS REF_PK_COLUMN_NAME,
        SUM(CASE WHEN A.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 1 ELSE 0 END) AS PKCNT,
        SUM(CASE WHEN A.CONSTRAINT_TYPE = 'FOREIGN KEY' THEN 1 ELSE 0 END) AS FKCNT
    FROM 
        INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS A
    LEFT OUTER JOIN 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS B ON A.CONSTRAINT_NAME = B.CONSTRAINT_NAME AND A.TABLE_NAME = B.TABLE_NAME
    LEFT OUTER JOIN 
        INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS C ON B.CONSTRAINT_NAME = C.CONSTRAINT_NAME
    LEFT OUTER JOIN 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS D ON C.UNIQUE_CONSTRAINT_NAME = D.CONSTRAINT_NAME
    WHERE 
        A.TABLE_SCHEMA = 'dbo'  -- Change 'public' to 'dbo' for SQL Server
        AND (A.CONSTRAINT_TYPE = 'PRIMARY KEY' OR A.CONSTRAINT_TYPE = 'FOREIGN KEY')
    GROUP BY 
        A.TABLE_NAME, B.COLUMN_NAME, A.CONSTRAINT_NAME, D.TABLE_NAME, D.COLUMN_NAME
) AS U ON T.TABLE_NAME = U.TABLE_NAME AND C.COLUMN_NAME = U.COLUMN_NAME
WHERE 
    T.TABLE_SCHEMA = 'dbo'  -- Change 'public' to 'dbo' for SQL Server
    AND T.TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    T.TABLE_NAME, C.ORDINAL_POSITION;  `;



        var result = await this.Query(code);

        
        var lst: DBTableModel[] = [];

        if (result && result.result) {
            var grp = JsonQuery.GroupBy(result.result, "TABLE_NAME")

            var tableKeys = Object.getOwnPropertyNames(grp)
            for (var i in tableKeys) {
                var tableName = tableKeys[i];
                var tableCols = grp[tableName];
                if (tableCols && tableCols.length > 0) {

                    var tableModel: DBTableModel = { Name: tableName, Cols: [], DBType: "MSSQL" }

                    for (var j in tableCols) {
                        var col = tableCols[j]
                        var colModel: DBTableColumn =
                            { Name: col.COLUMN_NAME, Type: col.DATA_TYPE, IsFK: col.FK, IsPK: col.PK,RefPKColumnName:col.REF_PK_COLUMN_NAME ,RefTableName:col.REF_TABLE_NAME }
                        tableModel.Cols?.push(colModel)
                    }
                    lst.push(tableModel)
                }
            }

        }



        return lst;

    }
    async GetProcList(){
        var lst: DBTableModel[] = [];
var code =`
SELECT  p.name AS name,
	    OBJECT_DEFINITION(p.object_id) AS content,
	    STRING_AGG(a.name, ',') AS args_names,
	    STRING_AGG(TYPE_NAME(a.system_type_id),',') AS args_types
FROM				sys.procedures p
INNER JOIN			sys.schemas s ON p.schema_id = s.schema_id
LEFT OUTER JOIN		sys.parameters a ON p.object_id = a.object_id
WHERE p.type = 'P'
AND p.is_ms_shipped = 0 
AND SCHEMA_NAME(p.schema_id) = 'dbo' 
GROUP BY			p.object_id,p.name
`


        var result = await this.Query(code);


        var lst: DBTableModel[] = [];

        if (result && result.result) {
            for (var i in result.result) {
                var row = result.result[i]
                var tableModel: DBTableModel = { Name: row.name, Cols: [], DBType: "MSSQL", Content: row.content }
                var strColNames = row.args_names;
                var strColTypes = row.args_types;
                
                if (strColNames && strColTypes) {
                    var colNames = strColNames.split(',')
                    var colTypes = strColTypes.split(',')
                    if(colNames && colTypes && colNames.length === colTypes.length){
                        for (var j in colNames) {

                            var strColName = colNames[j]?.trim()
                            var strColType = colTypes[j]?.trim()


                            var colModel: DBTableColumn = { Name: strColName.replace("@",""), Type: strColType, IsFK: false, IsPK: false, RefTableName: '', RefPKColumnName: '' }


                            tableModel.Cols?.push(colModel)
                        }
                    }
                    
                }
                lst.push(tableModel)
            }

        }



        return lst;
    }

    async Dispose() {
        await this._pool.close();
    }

}

