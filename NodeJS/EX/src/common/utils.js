const ConvertJsonToKeyValueObject = (json) => {
    var property = Object.getOwnPropertyNames(json);

    var rtn = new Array();
    for (var i in property) {
        var pName = property[i];
        rtn.push({ key: pName, value: json[pName] });
    }
    return rtn;
}


module.exports = { ConvertJsonToKeyValueObject }