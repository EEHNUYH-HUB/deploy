
import { Pool, PoolConfig } from 'pg'
import { ConvertJsonToKeyValueObject, JsonQuery } from './util.common.js'
import { DBConnectionInfo, DBResult, DBTableColumn, DBTableModel, IDBClient } from './models.js'


export class PostgreSqlClient implements IDBClient {

    private _pool: Pool;
    private _config: PoolConfig;
    constructor(config: DBConnectionInfo) {

        var numPort = undefined;
        if(config.port){
            
            numPort =  parseInt(config.port?.toString())
        }
        this._config = {
            host: config.server?.trim(),
            user: config.user?.trim(),
            password: config.password,
            database: config.database?.trim(),
            port: numPort,
            connectionTimeoutMillis: 30000
        }

        if (config?.ssl?.toString().toLowerCase() === 'true') {
            this._config.ssl = {
                rejectUnauthorized: true
            }
        }


        this._pool = new Pool(this._config)
    }
    async connectionTest() {
        try {
            var client = await this._pool.connect()
            client.release();

            return true;
        }
        catch {

            return false;
        }

    }
    private async _request(spName: string, params: any) {
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
                //     strParams += (i == 0 ? "" : ",") + "$" + (i + 1);
                // }
                for (var i in params) {
                    var intI = parseInt(i);
                    strParams += (intI == 0 ? "" : ",") + "$" + (intI + 1);
                }


            }
            else {
                params = null;
            }
            strParams += ")";
            var cmd = {
                text: 'SELECT * FROM ' + spName + strParams,
                values: params
            }


            var result = await this._pool.query(cmd);

            return result;
        }
        catch (e) {
            console.log(spName)
            console.log(params)
            console.log(e);

            return null;
        }

    }



    async Dataset(spName: string, params: any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result && result.rows)
            obj.result = result.rows;

        return obj;

    }
    async Datatable(spName: string, params: any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result && result.rows)
            obj.result = result.rows;

        return obj;

    }

    async Execute(spName: string, params: any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = true;
        
        // if (result && result.rowCount) {
        //     obj.result = result.rowCount > 0
        // }
        
        return obj;

    }

    async Scalar(spName: string, params: any) {
        var result = await this._request(spName, params);

        var obj = new DBResult;
        obj.result = null;
        if (result && result.rows && result.rows.length > 0) {

            var row = result.rows[0]
            var s = ConvertJsonToKeyValueObject(row);
            if (s && s.length > 0) {
                obj.result = s[0].value;
            }

        }

        return obj;
    }

    async Query(code: string,resultType:string="Datatable") {
        var result = await this._pool.query(code);



        var obj = new DBResult;
        obj.result = null;
        if(resultType === "Datatable"){
            
            if (result && result.rows) {
                obj.result = result.rows;
            }
        }
        else if(resultType === "FirstRow"){
            
            if (result && result.rows && result.rows.length > 0) {
                obj.result = result.rows[0];
            }
        }
        else if(resultType === "StartColumnValue"){
            if (result && result.rows && result.rows.length > 0) {

                var row = result.rows[0]
                var s = ConvertJsonToKeyValueObject(row);
                if (s && s.length > 0) {
                    obj.result = s[0].value;
                }
    
            }
        }else if(resultType === "Execute"){
            obj.result = true;
            // if (result && result.rowCount != null && result.rowCount != undefined ) {
            //     obj.result = result?.rowCount >= 0
            // }
        }
        

        return obj;
    }


    async GetProcList(){
        var code = `

        SELECT p.proname AS name,
        pg_get_function_arguments(p.oid) AS args,
        pg_get_function_result(p.oid) AS results,
        COALESCE(array_length(p.proargnames, 1), 0) AS chk,
        pg_get_functiondef(p.oid) AS content
 FROM pg_proc p
 LEFT JOIN pg_namespace n ON n.oid = p.pronamespace
 WHERE pg_function_is_visible(p.oid)
   AND n.nspname <> 'pg_catalog'
   AND n.nspname <> 'information_schema'
   AND n.nspname = 'public'
   AND p.prokind <> 'a'  -- Exclude aggregate functions


        `
        var result = await this._pool.query(code);

        
        var lst: DBTableModel[] = [];

        if (result && result.rows) {

            for (var i in result.rows) {
                var row = result.rows[i]
                var tableModel: DBTableModel = { Name: row.name, Cols: [], DBType: "POSTGRESQL" ,Content:row.content}
                var strCols = row.args;
                var chk = row.chk;
                if(strCols){
                    var cols = strCols.split(',')
                    for (var j in cols) {
                        var colModel: DBTableColumn | undefined = undefined;
                        var strCol = cols[j]?.trim()
                        if (chk === 0) {
                            colModel = { Name: `param_${j}`, Type: strCol, IsFK: false, IsPK: false, RefTableName: '', RefPKColumnName: '' }
                        }
                        else {
                            var col = strCol.split(' ');
                            if (col && col.length > 1) {
                                colModel = { Name: col[0], Type: strCol.replace(`${col}`, '').trim(), IsFK: false, IsPK: false, RefTableName: '', RefPKColumnName: '' }
                            }
                        }
                        if (colModel)
                            tableModel.Cols?.push(colModel)
                    }
                }
                lst.push(tableModel)
            }

        }
        return lst;
    }
    async GetTableList(){

        var code = `
SELECT  			T.TABLE_NAME
		,			C.COLUMN_NAME
		, 			C.DATA_TYPE
		,			CASE WHEN U.PKCNT > 0 THEN TRUE ELSE FALSE END AS PK
		,			CASE WHEN U.FKCNT > 0 THEN TRUE ELSE FALSE END AS FK
		,			U.REF_TABLE_NAME
		,			U.REF_PK_COLUMN_NAME
FROM  				INFORMATION_SCHEMA.TABLES 				AS T
INNER JOIN    		INFORMATION_SCHEMA.COLUMNS 				AS C  		ON  T.TABLE_NAME = C.TABLE_NAME  AND T.TABLE_SCHEMA = C.TABLE_SCHEMA
LEFT OUTER JOIN	    (SELECT  		A.TABLE_NAME
					,				B.COLUMN_NAME
					,				A.CONSTRAINT_NAME
					,				D.TABLE_NAME AS REF_TABLE_NAME
					,				D.COLUMN_NAME AS REF_PK_COLUMN_NAME
					,				SUM(CASE WHEN A.CONSTRAINT_TYPE = 'PRIMARY KEY' THEN 1 ELSE 0 END) PKCNT
					,				SUM(CASE WHEN A.CONSTRAINT_TYPE = 'FOREIGN KEY' THEN 1 ELSE 0 END) FKCNT
					FROM 			INFORMATION_SCHEMA.TABLE_CONSTRAINTS A
					LEFT OUTER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE B  		ON A.CONSTRAINT_NAME = B.CONSTRAINT_NAME AND A.TABLE_NAME = B.TABLE_NAME
					LEFT OUTER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS C 	ON B.CONSTRAINT_NAME = C.CONSTRAINT_NAME
					LEFT OUTER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE D 			ON C.UNIQUE_CONSTRAINT_NAME = D.CONSTRAINT_NAME
					WHERE 			A.TABLE_SCHEMA = 'public'
					AND				(A.CONSTRAINT_TYPE = 'PRIMARY KEY' OR A.CONSTRAINT_TYPE = 'FOREIGN KEY')
					GROUP BY		A.TABLE_NAME,B.COLUMN_NAME,A.CONSTRAINT_NAME,D.TABLE_NAME,D.COLUMN_NAME) 	AS U 		ON 	T.TABLE_NAME = U.TABLE_NAME AND C.COLUMN_NAME= U.COLUMN_NAME
WHERE  				T.TABLE_SCHEMA = 'public'  
AND 				T.TABLE_TYPE = 'BASE TABLE'  
ORDER BY  			T.TABLE_NAME, C.ORDINAL_POSITION; `;


        var result = await this._pool.query(code);



        var lst: DBTableModel[] = [];

        if (result && result.rows) {
            var grp = JsonQuery.GroupBy(result.rows,"table_name")
            
            var tableKeys = Object.getOwnPropertyNames(grp)
            for(var i in tableKeys){
                var tableName = tableKeys[i];
                var tableCols = grp[tableName];
                if(tableCols && tableCols.length > 0){

                    var tableModel:DBTableModel = {Name:tableName,Cols:[],DBType:"POSTGRESQL"}

                    for(var j in tableCols){
                        var col = tableCols[j]
                        var colModel:DBTableColumn = 
                         {Name:col.column_name,Type:col.data_type,IsFK:col.fk,IsPK:col.pk,RefTableName:col.ref_table_name,RefPKColumnName:col.ref_pk_column_name}
                        tableModel.Cols?.push(colModel)
                    }
                    lst.push(tableModel)
                }
            }

        }

        

        return lst;

    }

    async Dispose() {
        await this._pool.end();
    }
}
