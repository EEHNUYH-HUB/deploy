import { ActionModel, JsonModel, KeyValue, Map, Conditional, Dictionary, MapValue, FlowRunEntity, FunctionMap, JoinMap, DBTableColumn, DBTableModel, ReturnModel, ColumnMappingModel, InputCtrlModel } from "./models.js";

import moment from 'moment';

export const EnumToKeyValueArray = (enumObj: any): { key: string; value: string }[] => {
    return Object.keys(enumObj)
        .filter((key) => isNaN(Number(key))) // 숫자 키를 제외 (TypeScript의 숫자 enum 지원을 고려)
        .map((key) => ({
            key: key,
            value: enumObj[key],
        }));
};

export function Guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function GetBirthDay(str: string) {
    return str.replace(/(\d{4})(\d{2})(\d{2})/g, '$1년$2월$3일');
}

export function GetPhoneNumber(str: string) {
    return str.replace(/(\d{3})(\d{4})(\d{4})/g, '$1-$2-$3');
}

export function OnlyAllowNumber(value: string) {
    return !value || /^\d+$/.test(value);
}
export function OnlyAllowDouble(value: string) {
    return !value || /^\d{0,22}(\.\d{0,22}){0,1}$/.test(value);
}
export function ConvertDateToYYYYMMDD(date: Date) {
    var strYear = String(date.getFullYear());
    var strMonth = String(date.getMonth() + 1);
    var strDay = String(date.getDate());
    if (strMonth.length === 1) {
        strMonth = '0' + strMonth;
    }
    if (strDay.length === 1) {
        strDay = '0' + strDay;
    }
    return strYear + strMonth + strDay;
}
export function ConvertDateToYYYY_MM_DD(date: Date) {
    var strYear = String(date.getFullYear());
    var strMonth = String(date.getMonth() + 1);
    var strDay = String(date.getDate());
    if (strMonth.length === 1) {
        strMonth = '0' + strMonth;
    }
    if (strDay.length === 1) {
        strDay = '0' + strDay;
    }
    return strYear + '-' + strMonth + '-' + strDay;
}

export function ConvertYYYYMMDDToDate(yyyymmdd: string) {
    var y = parseInt(yyyymmdd.substring(0, 4));
    var m = parseInt(yyyymmdd.substring(4, 6)) - 1;
    var d = parseInt(yyyymmdd.substring(6, 8));
    return new Date(y, m, d);
}

export function ConvertYYYYMMDDToStringDate(yyyymmdd: string) {
    var y = parseInt(yyyymmdd.substring(0, 4));
    var m = parseInt(yyyymmdd.substring(4, 6));
    var d = parseInt(yyyymmdd.substring(6, 8));
    return y + '년 ' + m + '월 ' + d + '일';
}

export function DateToString(utc: any) {
    return moment(utc).format('YYYY년MM월DD일 HH시mm분ss초');
}
export function DateToStringShort(utc: any) {
    return moment(utc).format('YY.MM.DD HH:mm:ss')?.replace(' 00:00:00', '');
}
export function MillisecondToString(ms:number){
    
if(ms){
   const days = Math.floor(ms / (24 * 60 * 60 * 1000)); // 1일 = 24시간 * 60분 * 60초 * 1000밀리초
    ms %= (24 * 60 * 60 * 1000); // 남은 밀리초 계산

    const hours = Math.floor(ms / (60 * 60 * 1000)); // 1시간 = 60분 * 60초 * 1000밀리초
    ms %= (60 * 60 * 1000); // 남은 밀리초 계산

    const minutes = Math.floor(ms / (60 * 1000)); // 1분 = 60초 * 1000밀리초
    ms %= (60 * 1000); // 남은 밀리초 계산

    const seconds = Math.floor(ms / 1000); // 1초 = 1000밀리초
    ms %= 1000; // 남은 밀리초 계산

    const milliseconds = ms; // 남은 밀리초

    var rtn = "";
    if (days > 0) {
        rtn = ` ${days} 일`
    }
    if (hours > 0) {
        rtn += ` ${hours} 시간`
    }
    if (minutes > 0) {
        rtn += ` ${minutes} 분`
    }
    if (seconds > 0) {
        rtn += ` ${seconds} 초`
    }
    if (milliseconds > 0){
         rtn += ` ${milliseconds} 밀리초`
    }
    return rtn;
}
else {
    return ""
}


}
export function NumberToNumberStyle(v: any) {
    try {
        if (v) {
            var rtn;
            var type = v.constructor;
            if (type === String) {
                rtn = Number(v).toLocaleString();

            }
            else if (type === Number) {
                rtn = v.toLocaleString();
            }

            if (!Number.isNaN(rtn)) {
                return rtn;
            }
        }
    } catch { }
    return v;

}
export function IsNotNullOrUndefined(v: any) {
    return (v !== null && v !== undefined)

}


export function AddWeeks(weeks: number, date = new Date()) {
    date.setDate(date.getDate() + weeks * 7);

    return date;
}
export function AddMonths(months: number, date = new Date()) {
    date.setMonth(date.getMonth() + months);

    return date;
}

export function CommonSplit(str: string, splitValue: string, index: number) {
    var strs = str.split(splitValue);
    if (strs && strs.length > index) {
        return strs[index];
    }

    return str;
}
export function ParseJwt(token: string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

export function GetFormatDay(date: Date) {
    var year = date.getFullYear();
    var month = 1 + date.getMonth();
    var day = date.getDate();

    var strMonth = month >= 10 ? month : '0' + month;
    var strDay = day >= 10 ? day : '0' + day;
    return year + '' + strMonth + '' + strDay;
}

export function GetYear() {
    let sinitDate = new Date();
    sinitDate.setDate(sinitDate.getDate());

    return GetFormatDay(sinitDate).substring(0, 4).toString();
}

export function GetMonth() {
    let sinitDate = new Date();
    sinitDate.setDate(sinitDate.getDate());

    return GetFormatDay(sinitDate).substring(6, 4).toString();
}

export function ConvertJsonToKeyValueObjectList(json: any) {
    if (json && json.constructor === Array) {
        var rtn = [];
        for (var i in json) {
            rtn.push(ConvertJsonToKeyValueObject(json[i]));
        }

        return rtn;
    } else {
        return [ConvertJsonToKeyValueObject(json)];
    }
}
export function CopyArray(arry?: Array<any>) {
    if (arry && arry.length > 0) {
        var newArry: any[] = [];
        return newArry.concat(arry);

    }
    return [];
}
export function ObjClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

export const ConvertJsonToKeyValueObject = (json: any) => {
    var property = Object.getOwnPropertyNames(json);

    var rtn: KeyValue[] = [];
    for (var i in property) {
        var pName = property[i];
        rtn.push({ key: pName, value: json[pName] });
    }
    return rtn;
}

export function ConvertKeyValueObjectToObject(obj: any) {
    if (obj && obj.length > 0) {
        if (obj[0].key !== undefined) {
            var rtn: any = {};

            for (var i in obj) {
                if (obj[i].key) rtn[obj[i].key] = obj[i].value;
            }
            return rtn;
        }
    }

    if (obj) {
        if (obj.constructor === Array) return {};
        else return obj;
    } else {
        return {};
    }
}
export function GetColumnsforDataTable(dt: Array<any>) {
    var rtn = [];
    if (dt && dt.length > 0) {
        var obj = ConvertJsonToKeyValueObject(dt[0]);
        if (obj) {
            for (var i in obj) {
                rtn.push(obj[i].key);
            }
        }
    }
    return rtn;
}

export const ConvertJsonModelToObj = (inputs?: JsonModel[]) => {
    var rtn: Dictionary<any> = {};

    if (inputs && inputs.length > 0) {

        for (var i in inputs) {
            var input = inputs[i];
            if (input.jsonType !== "Object" && input.jsonType !== "Array") {
                rtn[input.key] = input.value;
            }
            else if (input.jsonType === "Object") {
                rtn[input.key] = ConvertJsonModelToObj(input.child);
            }
            else if (input.jsonType === "Array") {
                rtn[input.key] = []
            }
        }
    }

    return rtn;
}

export const ConvertJsonModelToObj2 = (inputs?: JsonModel[]) => {
    var rtn: any = {};

    if (inputs && inputs.length > 0) {



        for (var i in inputs) {
            var input = inputs[i];
            if (input) {
                var key = input.key;

                if (key) {
                    var split = key.split(".");

                    var obj = rtn;
                    if (split && split.length) {
                        var tIndex = split.length - 1;

                        for (var j = 0; j < tIndex; j++) {
                            var sub = split[j];
                            if (!obj[sub])
                                obj[sub] = {};


                            obj = obj[sub];
                        }

                        key = split[tIndex];

                    }


                    if (input.jsonType !== "Object" && input.jsonType !== "Array" && input.jsonType !== "Any") {
                        obj[key] = input.value;
                    }
                    else if (input.jsonType === "Object") {
                        obj[key] = ConvertJsonModelToObj2(input.child);
                    }
                    else if (input.jsonType === "Any") {
                        obj[key] = {}
                    }
                    else if (input.jsonType === "Array") {
                        obj[key] = []
                    }

                }
            }
        }
    }


    return rtn;
}
export function ConvertToTextOnlyValue(result: any) {
    var msg = "";
    if (result) {
        if (result.constructor === Array) {
            for (var i in result) {
                var str = ConvertToTextOnlyValue(result[i]);
                if (str) {
                    msg += ((msg ? "\r\n" : "") + str);
                }
            }
        }
        else if (result.constructor === Object) {

            var property = Object.getOwnPropertyNames(result);
            if (property && property.length > 0) {
                for (var j in property) {
                    var pn = property[j];
                    var value = result[pn];
                    if (value)
                        msg = ((msg ? "\r\n" : "") + ConvertToTextOnlyValue(value));
                }
            }

        }
        else {
            msg = result;
        }
    }


    return msg;
}
export const StringKeyToValue = (key: string | undefined, obj: any) => {


    var rtn = obj;

    if (key && obj) {

        var strs = key.split(".");

        for (var i in strs) {
            var str = strs[i];

            if (rtn) {

                if (rtn.constructor === Array) {
                    var newArry = [];
                    for (var j in rtn) {
                        var item = rtn[j];
                        if (item)
                            newArry.push(item[str]);
                    }
                    rtn = newArry;
                }
                else {

                    var nRtn = rtn[str];

                    // object에 guid.컬럼명 형식의 데이터가 있을경우 value값을 못찾아서 
                    // keyvalue형식으로 변환후 다시 obj 형식으로 변환
                    if (!IsNotNullOrUndefined(nRtn)) {
                        var tmp: any = {}
                        var isOk = false;
                        var keys = ConvertObjectToStringFullKeyValue(rtn)
                        if (keys && keys.length > 0) {
                            for (var j in keys) {
                                var strKey = keys[j].key
                                var value = keys[j].value
                                var targetStr = str + ".";
                                if (strKey && strKey.indexOf(targetStr) === 0) {

                                    var newKey = strKey.replace(targetStr, "")
                                    if (newKey) {
                                        tmp[newKey] = value
                                        isOk = true
                                    }

                                }
                            }
                        }
                        if (isOk)
                            nRtn = tmp;


                    }

                    rtn = nRtn;

                }
            }
        }
        return rtn;

    }

    return ''


}
export const SetKeyValueforObj = (key: string, value: any, obj: any) => {

    try {

        var target = obj;
        var isBool = value?.constructor === Boolean;
        if (key && ((value !== undefined && value !== null)) || isBool) {
            var strs = key.split(".");

            var tIndex = strs.length;
            if (strs && strs.length > 0) {
                for (var i in strs) {
                    var str = strs[i];

                    if (target && target.constructor === Array) {
                        target = target[0];
                    }
                    if (target) {

                        var isInclude = IncludeProperty(target, str);
                        if (!isInclude && target.constructor === Object) {
                            target[str] = {}
                            isInclude = true;
                        }
                        if (isInclude) {
                            if ((parseInt(i) + 1) === tIndex) {

                                target[str] = value;
                                return true;
                            }
                            else {
                                target = target[str];
                            }
                        }

                    }
                }
            }
        }

        return false;
    }
    catch (ex) {
        return false;
    }
}

export const StringKeyToJsonModel = (key: string | undefined, models: JsonModel[] | undefined) => {

    var findModel: JsonModel = { key: "", child: models };
    if (key && key.length > 0) {
        var strs = key.split(".");
        var arry = models;
        for (var i in strs) {
            var str = strs[i];

            var isFind = false;
            if (arry && arry.length) {
                for (var j in arry) {
                    var opt = arry[j];
                    if (opt.key === str) {
                        findModel = opt;
                        arry = opt.child;
                        isFind = true;
                        break;
                    }

                }
            }

            if (!isFind) {
                return undefined;
            }
        }
    }
    return findModel;
}
export const ConvertObjectToStringFullKeyValue = (obj: any) => {
    var ps = Object.getOwnPropertyNames(obj);

    var rtn: KeyValue[] = [];
    for (var i in ps) {
        var k = ps[i];
        var v = obj[k]

        if (v && v.constructor === Object) {
            var kv = ConvertObjectToStringFullKeyValue(v)
            for (var j in kv) {
                var tmp = kv[j];
                rtn.push({ key: `${k}.${tmp.key}`, value: tmp.value })
            }
        }
        else {
            rtn.push({ key: k, value: v })
        }


    }

    return rtn
}
export const IncludeProperty = (obj: any, property: string) => {
    var ps = Object.getOwnPropertyNames(obj);
    for (var i in ps) {
        var pName = ps[i];
        if (pName === property) {
            return true;
        }
    }
    return false;
}
export const BindingValueUsedByServer = (result: any, map: Map | undefined, inputs: any | undefined, value: any) => {

    var rtn = result ? result : {};


    rtn[`in${map?.PK_ID}`] = inputs;

    rtn[`out${map?.PK_ID}`] = value;


    return rtn;

}
export const BindingMappingValue = (result: Dictionary<any> | undefined, inputs: KeyValue[] | JsonModel[], mappings: ColumnMappingModel[]) => {
    for (var i in inputs) {
        var inputParam = inputs[i];

        if (mappings) {
            for (var j in mappings) {
                var mapping = mappings[j];

                if (mapping.InputColName === inputParam.key) {


                    if (result && mapping.ValueColName) {
                        var v;

                        if (!mapping.IsFixed) {
                            v = StringKeyToValue(mapping.ValueColName, result);
                        }
                        else {
                            v = mapping.ValueColName
                        }

                        if (v)
                            inputParam.value = v;
                    }
                    break;
                }
            }
        }
    }
}

export const ConvertJsonModelToKeyValue = (params: JsonModel[]) => {
    var inptCtrls = ConvertJsonModelToInputCtrlModel(params,true);
    return ConvertInputCtrlModelToKeyValue(inptCtrls)
}

export const GetInputCtrlModelsForActionModel = (model: ActionModel | undefined) => {

    var rtn: InputCtrlModel[] = []

    if (model && model.Inputs)
        return ConvertJsonModelToInputCtrlModel(model.Inputs,false)



    return rtn;
}
export const ConvertInputCtrlModelToKeyValue = (params: InputCtrlModel[] | undefined) => {
    var rtn: KeyValue[] = [];
    if (params) {

        for (var j in params) {
            rtn.push({ key: params[j].NAME, value: params[j].VALUE })
        }
    }
    return rtn;
}

 const ConvertJsonModelToInputCtrlModel = (params: JsonModel[],supportFixed:boolean) => {
    var inputLst: InputCtrlModel[] = []
    Binding("", "", inputLst, params)
    function Binding(parentkey: string, parentDisplay: string, rtn: InputCtrlModel[], options: JsonModel[] | undefined) {
        if (options) {

            for (var i in options) {
                var jsonModel = options[i];

                if (jsonModel.key && jsonModel.key.length > 0) {

                    var currentKey = jsonModel.key;
                    var currentDisplay = jsonModel.displayName ? jsonModel.displayName : currentKey;


                    if (parentkey) {
                        currentKey = parentkey + "." + currentKey
                    }
                    if (parentDisplay) {
                        currentDisplay = parentDisplay + "." + currentDisplay
                    }


                    if (jsonModel.jsonType === "Object") {

                        Binding(currentKey, currentDisplay, rtn, jsonModel.child);
                    }
                    else if (jsonModel.jsonType === "Array" || (jsonModel && jsonModel.jsonType && jsonModel.jsonType.indexOf("Array") > -1)) {
                        rtn.push({ NAME: currentKey, TYPE: "MultiValueParam", VALUE: '', DISPLAYNAME: currentDisplay, OPTION: '', JsonModel: jsonModel });
                    }
                    else if (jsonModel.isFixedValue?.toString().toLowerCase() !== 'true') {

                        var type = "";
                        if (jsonModel.jsonType === "String") { type = "TextParam"; }
                        else if (jsonModel.jsonType === "Number") { type = "NumberParam"; }
                        else if (jsonModel.jsonType === "Boolean") { type = "BooleanParam"; }

                        rtn.push({ NAME: currentKey, TYPE: type, VALUE: '', DISPLAYNAME: currentDisplay, OPTION: '', JsonModel: jsonModel });
                    }
                    else if(supportFixed){

var type = "";
                        if (jsonModel.jsonType === "String") { type = "TextParam"; }
                        else if (jsonModel.jsonType === "Number") { type = "NumberParam"; }
                        else if (jsonModel.jsonType === "Boolean") { type = "BooleanParam"; }

                        rtn.push({ NAME: currentKey, TYPE: type, VALUE: jsonModel.value, DISPLAYNAME: currentDisplay, OPTION: '', JsonModel: jsonModel });
                    }
                }
            }
        }
    }

    return inputLst;
}
export const RunJavascriptActionModelInput = (inputs: JsonModel[] | undefined, inputValue: any, code?: string) => {
    var jsonParams = ConvertJsonModelToObj(inputs);

    if (inputValue) {
        var property = Object.getOwnPropertyNames(inputValue);

        if (property) {
            for (var i in property) {
                var key = property[i];
                var value = inputValue[key];
                SetKeyValueforObj(key, value, jsonParams);
            }
        }
    }


    var params = [];
    if (inputs) {
        for (var i in inputs) {
            var keyValue = inputs[i].key;

            params.push({ key: keyValue, value: jsonParams[keyValue] })
        }
    }


    return RunJavascript(params, code);
}
export const RunConditional = (params: KeyValue[], conditional: Conditional, onMessage?: Function) => {


    try {
        var functionStr = `if(${conditional.StrValue}) return true; else return false;`;

        var result = RunJavascript(params, functionStr);

        if (onMessage) {
            onMessage(functionStr, result);
        }



        return result;
    }
    catch (ex) {
        console.log(ex)

        return false;
    }

}
export const RunJavascript = (params: KeyValue[], functionStr?: string) => {
    if (functionStr) {
        var strFunctionParams = "";
        for (var i in params) {
            strFunctionParams += `${strFunctionParams ? "," : ""}${params[i].key}`;
        }

        var actionMethod = new Function(strFunctionParams, functionStr);

        const values = params.map(param => param.value);

        var rtn = actionMethod.apply(null, values);
        return rtn
    }

    return undefined;
}
export const TryParseJson = (str: string, callback: Function) => {
    process.nextTick(function () {
        try {
            callback(null, JSON.parse(str));
        } catch (ex) {

            callback(ex)
        }
    })
}
export const PromiseParseJson = (str: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(str));
        } catch (ex) {
            reject(ex);
        }
    });
};


export const GetStartFlowLineRunEntity = (mapValue: MapValue, actModels: Dictionary<ActionModel>) => {


    const Binding = (flowLineEntitList: FlowRunEntity[], parent: FlowRunEntity, maps: FunctionMap[], joins: JoinMap[] | undefined) => {
        var map = parent.Map;



        if (joins && joins.length > 0) {
            for (var i in joins) {
                var join = joins[i];


                if (join.FK_START_MAP_ID === map.PK_ID) {
                    if (maps) {

                        for (var j in maps) {
                            var cmap = maps[j];

                            if (join.FK_END_MAP_ID === cmap.PK_ID) {
                                var acModel = undefined;
                                if (cmap.ActionID) {
                                    acModel = actModels[cmap.ActionID]
                                }
                                else if (cmap.CodeType === "javascript" && cmap.JavaScript) {
                                    acModel = cmap.JavaScript;
                                }

                                var findObj = flowLineEntitList.find(x => x.ID === join.FK_START_MAP_ID + join.FK_END_MAP_ID);
                                if (!findObj) {
                                    findObj = new FlowRunEntity(cmap, join, acModel, parent)
                                    flowLineEntitList.push(findObj);

                                    Binding(flowLineEntitList, findObj, maps, joins);
                                }

                                parent.Items.push(findObj)


                            }
                        }
                    }
                }
            }
        }


        if (parent && parent.Items && parent.Items.length > 0) {
            parent.Items = parent.Items.sort((a, b) => {

                if (a.Map && b.Map) {
                    var aCol = a.Map.COL_MINCOLUMN * 10;
                    var aRow = a.Map.COL_MINROW * 1000;
                    var bCol = b.Map.COL_MINCOLUMN * 10
                    var bRow = b.Map.COL_MINROW * 1000;

                    return (aRow + aCol) - (bRow + bCol);
                }
                return -1;
            });
        }
    }

    var functionMaps: FunctionMap[] = []
    if (mapValue?.FunctionMaps && mapValue?.FunctionMaps.length > 0) {
        for (var i in mapValue?.FunctionMaps) {
            functionMaps.push(mapValue?.FunctionMaps[i] as FunctionMap)
        }
    }

    var joinMaps: JoinMap[] | undefined = mapValue?.JoinMaps;
    var startObj = null;
    if (mapValue) {
        if (functionMaps) {
            for (var i in functionMaps) {
                var fmap: FunctionMap = functionMaps[i] as FunctionMap;
                if (fmap.ActionType === "Start") {
                    startObj = fmap;
                    break;
                }
            }
        }



        if (startObj) {

            var startRunEntity = new FlowRunEntity(startObj, undefined, undefined, undefined);
            startRunEntity.Parent = undefined
            var entList: FlowRunEntity[] = []
            Binding(entList, startRunEntity, functionMaps, joinMaps);

            return startRunEntity;

        }
    }

    return undefined;
}
export const ValidNextItems = (nextItems: FlowRunEntity[], value: any) => {

    var rtn = [];
    for (var i in nextItems) {
        var item = nextItems[i]
        if (item.JoinMap?.Conditional && item.JoinMap?.Conditional.StrValue) {
            var condition = item.JoinMap.Conditional;

            if (ValidConditional(condition, value)) {
                rtn.push(item)
            }
        }
        else {
            rtn.push(item)
        }
    }

    return rtn;

}


export const ValidConditional = (condition: Conditional, value: any, onMessage?: Function) => {

    if (condition && condition.Settings) {
        var params = [];
        for (var j in condition.Settings) {

            var setting = condition.Settings[j];

            var paramValue = StringKeyToValue(setting.Column ? setting.Column : "", value);

            var strColumn = setting.Column?.replaceAll(".", "_").replaceAll("-", "_");
            if (strColumn) {
                var findObj = params.find(x => x.key === strColumn);
                if (!findObj) {
                    params.push({ key: strColumn, value: IsNotNullOrUndefined(paramValue) ? paramValue : "" });
                }
            }
        }


        if (condition.Settings && condition.Settings.length > 0) {
            return RunConditional(params, condition, onMessage)
        }
    }


    return true
}

export function AutoPostgreSQLQuery(table: DBTableModel, queryType: string) {
    var rtn;
    if (table && table.Name) {

        var cols = ''
        var insert = ''
        var update = ''
        var where = ''
        var colIndex = 0;
        var whereIndex = 0;
        var upsertWhere = ''
        var upsert = ''
        function getParm(col: DBTableColumn) {

            var notStringType = [
                "smallint",
                "integer",
                "bigint",
                "decimal",
                "numeric",
                "real",
                "double",
                "serial",
                "bigserial",
                "boolean"
            ]
            var typeLower = col.Type.toLocaleLowerCase();
            var finds = notStringType.filter(x => typeLower.includes(x));

            if (finds && finds.length > 0) {
                return `@${col.Name}`
            }
            else {
                return `'@${col.Name}'`
            }
        }
        if (table.Cols && table.Cols.length > 0) {
            for (var i in table.Cols) {
                var col = table.Cols[i];
                if (col.Target) {
                    cols += (colIndex === 0 ? "" : " \r\n ,") + col.Name;
                    insert += (colIndex === 0 ? "" : " \r\n ,") + getParm(col);
                    update += (colIndex === 0 ? "" : " \r\n ,") + col.Name + ' = ' + getParm(col);
                    upsert += (colIndex === 0 ? "" : " \r\n ,") + col.Name + ' = ' + `EXCLUDED.${col.Name}`;
                    colIndex += 1
                }

                if (col.Where) {
                    where += (whereIndex === 0 ? "" : " \r\nAND ") + col.Name + ' = ' + getParm(col);
                    upsertWhere += (whereIndex === 0 ? "" : " , ") + col.Name;
                    whereIndex += 1
                }
            }
        }

        if (queryType === "Select") {
            rtn = `SELECT  ${cols} \r\n`
            rtn += `FROM ${table.Name} \r\n`
            if (where)
                rtn += `WHERE ${where}`
        } else if (queryType === "Insert") {

            rtn = `INSERT INTO ${table.Name} ( \r\n`
            rtn += ` ${cols} \r\n`
            rtn += `) VALUES ( \r\n`
            rtn += ` ${insert} \r\n`
            rtn += `)`;


        } else if (queryType === "Update") {
            rtn = `UPDATE ${table.Name} \r\n`
            rtn += `SET ${update} \r\n`
            if (where)
                rtn += `WHERE ${where}`
        } else if (queryType === "Delete") {
            rtn = `DELETE \r\n`
            rtn += `FROM ${table.Name} \r\n`
            if (where)
                rtn += `WHERE ${where}`
        } else if (queryType === "Upsert") {
            rtn = `INSERT INTO ${table.Name} ( \r\n`
            rtn += ` ${cols} \r\n`
            rtn += `) VALUES ( \r\n`
            rtn += ` ${insert} \r\n`
            rtn += `)\r\n`
            rtn += `ON CONFLICT (${upsertWhere}) \r\n`
            rtn += `DO UPDATE SET \r\n`
            rtn += `${upsert} \r\n`
        }
    }
    return rtn;
}
export function AutoMSSQLQuery(table: DBTableModel, queryType: string) {
    var rtn;
    if (table && table.Name) {

        var cols = '';
        var insert = '';
        var update = '';
        var where = '';
        var colIndex = 0;
        var whereIndex = 0;
        var upsertWhere = '';
        var upsert = '';

        function getParm(col: DBTableColumn) {

            var notStringType = [
                "int",
                "bigint",
                "smallint",
                "tinyint",
                "float",
                "real",
                "decimal",
                "numeric",
                "bit"
            ]
            var typeLower = col.Type.toLocaleLowerCase();
            var finds = notStringType.filter(x => typeLower.includes(x));

            if (finds && finds.length > 0) {
                return `@${col.Name}`
            }
            else {
                return `'@${col.Name}'`
            }
        }

        if (table.Cols && table.Cols.length > 0) {
            for (var i in table.Cols) {
                var col = table.Cols[i];
                if (col.Target) {
                    cols += (colIndex === 0 ? "" : "\r\n, ") + col.Name;
                    insert += (colIndex === 0 ? "" : "\r\n, ") + getParm(col);
                    update += (colIndex === 0 ? "" : "\r\n, ") + col.Name + ' = ' + getParm(col);
                    colIndex += 1;
                }

                if (col.Where) {
                    where += (whereIndex === 0 ? "" : "\r\nAND ") + col.Name + ' = ' + getParm(col);
                    upsertWhere += (whereIndex === 0 ? "" : ", ") + col.Name;
                    whereIndex += 1;
                }
            }
        }

        if (queryType === "Select") {
            rtn = `SELECT ${cols} \r\n`;
            rtn += `FROM ${table.Name} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Insert") {
            rtn = `INSERT INTO ${table.Name} ( \r\n`;
            rtn += ` ${cols} \r\n`;
            rtn += `) VALUES ( \r\n`;
            rtn += ` ${insert} \r\n`;
            rtn += `)`;
        } else if (queryType === "Update") {
            rtn = `UPDATE ${table.Name} \r\n`;
            rtn += `SET ${update} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Delete") {
            rtn = `DELETE \r\n`;
            rtn += `FROM ${table.Name} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Upsert") {
            rtn = `MERGE ${table.Name} AS target \r\n`;
            rtn += `USING (SELECT ${insert} AS ${cols}) AS source \r\n`;
            rtn += `ON ${where} \r\n`;
            rtn += `WHEN MATCHED THEN \r\n`;
            rtn += `UPDATE SET ${upsert} \r\n`;
            rtn += `WHEN NOT MATCHED THEN \r\n`;
            rtn += `INSERT (${cols}) VALUES (${insert});`;
        }
    }
    return rtn;
}

export function DBTypeToFlowLineType(dbType: string) {
    var numType = ["int", "integer",
        "smallint", "smallint",
        "tinyint", "smallint",
        "bigint", "bigint",
        "float", "real",
        "real", "double",
        "decimal", "numeric"]


    var boolType = ["bit", "boolean"]

    var typeLower = dbType.toLowerCase();

    var finds = numType.filter(x => typeLower.includes(x));
    if (finds && finds.length > 0) {
        return "Number"
    }

    finds = boolType.filter(x => typeLower.includes(x));
    if (finds && finds.length > 0) {
        return "Boolean"
    }

    return "String"


}
export function AutoMySQLQuery(table: DBTableModel, queryType: string) {
    var rtn;
    if (table && table.Name) {

        var cols = '';
        var insert = '';
        var update = '';
        var where = '';
        var colIndex = 0;
        var whereIndex = 0;
        var upsertWhere = '';

        function getParm(col: DBTableColumn) {

            var typeLower = col.Type.toLowerCase();

            var isString = DBTypeToFlowLineType(typeLower) === "String"


            if (!isString) {
                return `@${col.Name}`;
            } else {
                return `'@${col.Name}'`;
            }
        }

        if (table.Cols && table.Cols.length > 0) {
            for (var i in table.Cols) {
                var col = table.Cols[i];
                if (col.Target) {
                    cols += (colIndex === 0 ? "" : "\r\n, ") + col.Name;
                    insert += (colIndex === 0 ? "" : "\r\n, ") + getParm(col);
                    update += (colIndex === 0 ? "" : "\r\n, ") + col.Name + ' = ' + getParm(col);
                    colIndex += 1;
                }

                if (col.Where) {
                    where += (whereIndex === 0 ? "" : "\r\nAND ") + col.Name + ' = ' + getParm(col);
                    upsertWhere += (whereIndex === 0 ? "" : ", ") + col.Name;
                    whereIndex += 1;
                }
            }
        }

        if (queryType === "Select") {
            rtn = `SELECT ${cols} \r\n`;
            rtn += `FROM ${table.Name} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Insert") {
            rtn = `INSERT INTO ${table.Name} ( \r\n`;
            rtn += ` ${cols} \r\n`;
            rtn += `) VALUES ( \r\n`;
            rtn += ` ${insert} \r\n`;
            rtn += `)`;
        } else if (queryType === "Update") {
            rtn = `UPDATE ${table.Name} \r\n`;
            rtn += `SET ${update} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Delete") {
            rtn = `DELETE \r\n`;
            rtn += `FROM ${table.Name} \r\n`;
            if (where)
                rtn += `WHERE ${where}`;
        } else if (queryType === "Upsert") {
            rtn = `INSERT INTO ${table.Name} ( \r\n`;
            rtn += ` ${cols} \r\n`;
            rtn += `) VALUES ( \r\n`;
            rtn += ` ${insert} \r\n`;
            rtn += `) \r\n`;
            rtn += `ON DUPLICATE KEY UPDATE \r\n`;
            rtn += `${update} \r\n`;
        }
    }
    return rtn;
}



export function StringifyAsync(input: any) {

    return new Promise((resolve, reject) => {
        try {
            if (input) {
                const result = JSON.stringify(input);
                resolve(result);
            }
            else {
                resolve("");
            }
        } catch (error) {
            resolve(resolve);
        }
    });

}
export class JsonQuery {

    static MaxNumber(dataList: any[], propertyName: string) {
        var max: number = 0;
        if (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                var curValue = parseInt(dataList[i][propertyName]);
                if (max === 0 || curValue > max)
                    max = curValue;
            }
        }
        return max;

    }
    static Sort(dataList: any[], sortPropertyName: string, isAsc: boolean) {
        if (dataList && dataList.length > 0) {

            var rtn = dataList.sort((a: any, b: any) => {
                if (a && b) {
                    var aV = a[sortPropertyName] ? a[sortPropertyName] : 0
                    var bV = b[sortPropertyName] ? b[sortPropertyName] : 0
                    if (isAsc)
                        return aV - bV;
                    else
                        return bV - aV
                }
                return 0;
            })
            return rtn;
        }
        else {
            return dataList
        }
    }
    static Where(dataList: any[], wherePropertyName: string, whereType: string, whereValue: any) {
        var whereIndexs = JsonQuery.WhereIndex(dataList, wherePropertyName, whereType, whereValue);
        var rtn = [];
        for (var i in whereIndexs) {
            var index = whereIndexs[i];
            rtn.push(dataList[index]);
        }
        return rtn;
    }
    static GroupBy(dataList: any[] | undefined, groupbyPropertyName: string) {

        if (dataList) {
            const result = dataList.reduce((carry, el) => {  // [1]
                var group = el[groupbyPropertyName];

                if (carry[group] === undefined) {
                    carry[group] = []
                }

                carry[group].push(el)
                return carry                        // [5]
            }, {});

            return result;
        }
        return undefined;
    }
    static Upsert(dataList: any[], wherePropertyName: string, whereType: string, whereValue: any, value: any) {
        var selItems = JsonQuery.Where(dataList, wherePropertyName, whereType, whereValue);
        if (selItems.length === 0) {
            dataList.push(value);
        }
        else {
            JsonQuery.Update(dataList, wherePropertyName, whereType, whereValue, value)
        }

    }
    static Update(dataList: any[], wherePropertyName: string, whereType: string, whereValue: any, value: any) {
        var whereIndexs = JsonQuery.WhereIndex(dataList, wherePropertyName, whereType, whereValue);

        for (var i in whereIndexs) {
            var index = whereIndexs[i];
            dataList[index] = value;
        }
    }
    static WhereIndex(dataList: any[], wherePropertyName: string, whereType: string, whereValue: any) {
        var rtn = [];
        var lowerString = whereValue?.toString().toLowerCase();
        if (dataList) {
            for (var i = 0; i < dataList.length; i++) {
                if (dataList[i][wherePropertyName] !== null) {

                    if (whereType === "<") {
                        if (dataList[i][wherePropertyName] < whereValue) {
                            rtn.push(i);
                        }
                    } else if (whereType === "<=") {
                        if (dataList[i][wherePropertyName] <= whereValue) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === ">") {
                        if (dataList[i][wherePropertyName] > whereValue) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === ">=") {
                        if (dataList[i][wherePropertyName] >= whereValue) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === "=") {
                        if (dataList[i][wherePropertyName]?.toString().toLowerCase() === lowerString) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === "!=") {
                        if (dataList[i][wherePropertyName]?.toString().toLowerCase() !== lowerString) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === "contains") {
                        if (dataList[i][wherePropertyName]?.toString().toLowerCase().indexOf(lowerString) > -1) {
                            rtn.push(i);
                        }
                    }
                    else if (whereType === "!contains") {
                        if (dataList[i][wherePropertyName]?.toString().toLowerCase().indexOf(lowerString) < 0) {
                            rtn.push(i);
                        }
                    }
                }
            }
        }
        return rtn;
    }
    static InnerJoin(dataA: any, dataB: any, aProperty: string, bProperty: string, aAlias: string, bAlias: string) {
        var rtn = [];
        if (dataA && dataB) {
            for (var i in dataA) {
                var A = dataA[i];
                for (var j in dataB) {
                    var B = dataB[j];
                    if (A[aProperty] === B[bProperty]) {
                        var obj: Dictionary<any> = {};
                        obj[aAlias] = A;
                        obj[bAlias] = B;
                        rtn.push(obj)
                    }
                }
            }
        }

        return rtn;
    }
    static LeftOuterJoin(dataA: any, dataB: any, aProperty: string, bProperty: string, aAlias: string, bAlias: string) {
        var rtn = []; if (dataA && dataB) {
            for (var i in dataA) {
                var A = dataA[i];
                var isFind = false;
                for (var j in dataB) {
                    var B = dataB[j];
                    if (A[aProperty] === B[bProperty]) {
                        var obj: Dictionary<any> = {};
                        obj[aAlias] = A;
                        obj[bAlias] = B;
                        rtn.push(obj)
                        isFind = true;
                    }
                }
                if (!isFind) {
                    obj = {};
                    obj[aAlias] = A;
                    obj[bAlias] = null;
                    rtn.push(obj)
                }
            }
        }
        return rtn;
    }


    static Delete(dataList: any[], wherePropertyName: string, whereType: string, whereValue: any) {

        if (dataList) {
            var whereIndexs = JsonQuery.WhereIndex(dataList, wherePropertyName, whereType, whereValue);

            if (whereIndexs && whereIndexs.length > 0) {
                for (var i in whereIndexs) {

                    var index = whereIndexs[i];
                    dataList.splice(index - parseInt(i), 1);
                }
            }
        }
    }



}