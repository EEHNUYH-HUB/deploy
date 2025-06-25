import clsx from 'clsx';
import { CSSProperties, Fragment, useEffect, useState } from 'react';
import { Autocomplete, Button, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Popper, Select, Switch, TextField } from '@mui/material'
import { DateField, TimeField } from '@mui/x-date-pickers';
import { Editor, loader } from '@monaco-editor/react';
import dayjs from 'dayjs';

import CodeJson from './config.code.json'
import FlowLineUtils from './flowline.utils.js';
import { FlowLineStyle } from './flowline.style.js';
import FlowLineClient from './flowline.client.js';

import { JsonModel, KeyValue, LookUpSetting, KeyValueAndOrgObject, ReturnModel } from 'flowline_common_model/src/models'
import { ConvertDateToYYYY_MM_DD, ConvertInputCtrlModelToKeyValue, CopyArray, JsonQuery, StringKeyToValue } from 'flowline_common_model/src/util.common';
import { useAppContext } from './ctx.app.js';



loader.config({
    paths: {
        vs: '/monaco-editor/min/vs'
    }
});
export const divEditorMCss = 'px-4 py-2'
export const divEditorCss = 'w-100 row ' +  divEditorMCss
// export const divEditorMCss = 'p-2'
// export const divEditorCss = 'row w-100' +  divEditorMCss


export class KeyValueBase {
    displayName?: string;
    columnName?: string;
    required?: boolean;
    disabled?: boolean;
    onChanged?: Function;
    onFocusOut?: Function;
    onEnter?:Function;
    className?: string;
    changeMode?: "Input" | "Enter" | "FocusOut"
    value?: string | number | boolean | undefined;
    readonly?: boolean = false;
    placeholder?: string;
    rows?: number;
    rerendering?: string;
}
export const ValueDivCss = 'd-flex align-items-center';
const DefaultLabelCss = 'col-sm-4 col-form-label fs-6 ' + ValueDivCss;
export const VerticalDefaultLabelCss = 'col-form-label fs-6' + ValueDivCss;

export class KeyValueSelectCtrlPros extends KeyValueBase {
    options?: KeyValueAndOrgObject[] | KeyValue[];

}
export class KeyValueCodeSelectCtrlProps extends KeyValueBase {
    groupName?: string;
    withOutKeys?: string[];
}
export const GetCodeName = (code?: string) => {
    if (code) {
        var finds = JsonQuery.Where(CodeJson?.CODE, "COL_CODE", "=", code);
        if (finds && finds.length > 0) {
            return finds[0].COL_NAME;
        }
    }
    return "bar";
}
export const GetCodes = (grp?: string) => {


    var rtn = [];



    if (grp === "GROUP") {
        var grps = JsonQuery.GroupBy(CodeJson?.CODE, "COL_GROUP");
        if (grps) {
            var property = Object.getOwnPropertyNames(grps);
            for (var i in property) {
                var pName = property[i];
                rtn.push({ key: pName, value: pName })
            }
        }

    }
    else {
        if (CodeJson?.CODE && CodeJson?.CODE.length > 0) {

            var items = JsonQuery.Where(CodeJson?.CODE, "COL_GROUP", "=", grp)
            if (items && items.length > 0) {
                for (var i1 in items) {
                    rtn.push({ key: items[i1].COL_CODE, value: items[i1].COL_NAME })
                }

            }
        }

    }


    return rtn;

}

const KeyValueAutoCompleteCtrl = (props: KeyValueBase & { password?: boolean, autoCompleteOptions?: string[] }) => {

    const { changeMode = "FocusOut",onEnter, placeholder, className, autoCompleteOptions, columnName, displayName, value, required, onChanged, password = false, onFocusOut } = props;
    const [innerValue, setInnerValue] = useState<string | number | boolean | undefined>(value);


    const onChange = (e: any, v?: any, r?: any, r2?: any) => {
        setInnerValue(v);

        // if (changeMode === "Input")
        //     if (onChanged) onChanged(columnName ? columnName : displayName, e.target.value);
    };


    const onKeyDown = (e: any) => {


        if (changeMode !== "Input") {
            if (e.keyCode === 13) {
                if (value !== innerValue) {
                    if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
                }
            }
        }
        if (e.keyCode === 13 && !e.shiftKey) {
            if(onEnter){
                onEnter(columnName ? columnName : displayName, innerValue);
            }
        }
    }

    const onBlur = (e: any) => {
        if (changeMode === "Input" || changeMode === "FocusOut") {
            if (value !== innerValue) {
                if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
            }
        }

        if (onFocusOut) onFocusOut();

    }

    const [commonKeys, setCommonKeys] = useState<string[]>()
    const appContext = useAppContext();
    useEffect(() => {
        if (!autoCompleteOptions)
            LoadCommonKeys()
    }, [])
    useEffect(() => {
        if (autoCompleteOptions && autoCompleteOptions.length > 0)
            setCommonKeys(autoCompleteOptions)
    }, [autoCompleteOptions])
    const LoadCommonKeys = async () => {
        if (appContext.flowLineClient) {
            setCommonKeys(await appContext.flowLineClient.GetGlobalKeys(true))
        }
    }

    useEffect(() => {
        setInnerValue(value);
    }, [value]);
    const CustomPopper = (props:any) => {
        return (
            <Popper {...props} style={{ minWidth: '500px' }} />
        );
    };
    
    return (
        <div className={clsx(divEditorCss, className)}>


            <Autocomplete

                freeSolo
                size="small"
                fullWidth={true}
                value={innerValue ? innerValue.toString() : ''}
                onInputChange={onChange}
                isOptionEqualToValue={(option, value) => option === value}

                className='px-0'
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                PopperComponent={CustomPopper} 
                placeholder={placeholder}
                options={commonKeys ? commonKeys : []}
                
                renderOption={(props, option) => (
                    
                    <MenuItem {...props} 
                    
                    style={{...FlowLineStyle.SelectOption 
                    ,color: option === innerValue?FlowLineStyle.ActiveFontColor:FlowLineStyle.FontColor
                    
                          }}
                          
                    
                          >
                        {option} 
                    </MenuItem>
                )}
            
                renderInput={(params) =>
                    <TextField  {...params} type={password ? "password" : ""} size="small"  variant="standard" label={displayName?displayName:" "} />
                }

            />


        </div>
    );
};

const KeyValueSelectCtrl = (props: KeyValueSelectCtrlPros) => {
    const { readonly = false, className, placeholder, columnName, displayName, value, required, onChanged, options } = props;
    const [innerValue, setInnerValue] = useState<string | number | boolean | undefined>();
const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);
    const onChange = (e: any) => {
        setInnerValue(e.target.value);

        if (options !== undefined) {
            var selectItem = {};
            for (var a in options) {
                var o = options[a];

                if (o.key.toString() === e.target.value.toString()) {
                    selectItem = o;
                    break;
                }
            }
            if (onChanged) onChanged(columnName ? columnName : displayName, selectItem);
        }
    };

    useEffect(() => {
        CheckValue();
    }, [value, options]);

    const CheckValue = () => {
        if (options && value) {

            var isOK = false;
            for (var i in options) {
                var opt = options[i]
                if (opt.key === value) {
                    isOK = true;
                    break;
                }
            }
            if (!isOK) {

                setInnerValue('');
            }
            else {
                setInnerValue(value);
            }
        }
        else {
            setInnerValue('');
        }

    }
    

    return (

        
        <div className={clsx(divEditorCss, className)} >

            <FormControl variant="standard" size="small">

                <InputLabel >{displayName?displayName:" "}</InputLabel>
                <Select
                    value={innerValue ? innerValue : ''}
                    onChange={onChange}
                    readOnly={readonly}

                    label={displayName }
                >
                    <MenuItem style={{...FlowLineStyle.SelectOption,minWidth:"500px" }} value=""
                    

                    >
                        <em>None</em>
                    </MenuItem> 
                    {options && options.length > 0 && options?.map((opt: any, index: number) => {
                        const isHovered = hoveredIndex === index;

                        return (
                            <MenuItem key={`selIndex${index}`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}

                            style={{...FlowLineStyle.SelectOption,minWidth:"500px"
                                ,color: (isHovered||opt.key === innerValue)?FlowLineStyle.ActiveFontColor:FlowLineStyle.FontColor
                          
                          
                            }}
                            value={opt.key}>{opt.value}</MenuItem>

                            
                        );
                    })}

                </Select>

            </FormControl>

        </div>
    );
};

const KeyValueCodeSelectCtrl = (props: KeyValueCodeSelectCtrlProps) => {

    const { readonly = false, withOutKeys, className, placeholder, columnName, displayName, value, required, onChanged, disabled, groupName } = props;

    const [options, setOptions] = useState<KeyValueAndOrgObject[] | KeyValue[]>([]);

    useEffect(() => {
        if (groupName) LoadOptions();
    }, [groupName, withOutKeys]);

    const LoadOptions = async () => {
        var codes = GetCodes(groupName);

        if (codes !== null && codes !== undefined && codes.length > 0) {
            if (withOutKeys && withOutKeys.length > 0) {
                var newArry = [];
                for (var i in codes) {
                    var cd = codes[i];
                    var isInclude = true;
                    for (var j in withOutKeys) {
                        var withOutKey = withOutKeys[j];
                        if (cd?.key?.toString() === withOutKey?.toString()) {
                            isInclude = false;
                            break;
                        }

                    }
                    if (isInclude)
                        newArry.push(cd);

                }

                setOptions(newArry);
            }
            else {
                setOptions(codes);
            }
        }
    };

    return (
        <>
            {options && options.length > 0 &&
                <KeyValueSelectCtrl
                    className={className}

                    placeholder={placeholder}
                    columnName={columnName}
                    required={required}
                    displayName={displayName}
                    options={options}
                    value={value}

                    readonly={readonly}
                    onChanged={onChanged}
                    disabled={disabled}
                />}
        </>
    );
};

const KeyValueLookUpSelectCtrl = (props: KeyValueSelectCtrlPros & { lookUpSetting?: LookUpSetting, flowLineClient?: FlowLineClient }) => {

    const { readonly = false, rerendering, flowLineClient, className, placeholder, columnName, displayName, value, required, onChanged, disabled, lookUpSetting } = props;

    const [options, setOptions] = useState<KeyValueAndOrgObject[] | KeyValue[]>([]);

    useEffect(() => {
        if (lookUpSetting) LoadOptions();
    }, [lookUpSetting, rerendering]);

    const LoadOptions = async () => {
        
         var opts: KeyValue[] = [];
         if (lookUpSetting && lookUpSetting.ActionID) {


             var actionModel = await flowLineClient?.GetUnitDetail(lookUpSetting.ActionID, "comp", true);
             if (actionModel) {
                 var curInputValue = ConvertInputCtrlModelToKeyValue(lookUpSetting.Inputs);
                 var resp = await flowLineClient?.RunActionModel(actionModel, curInputValue);

                 
                 var keys = StringKeyToValue(lookUpSetting.ValueField, resp);
                 var values = StringKeyToValue(lookUpSetting.DisplayField, resp);


                 if (keys&& keys.length> 0 && keys?.length === values?.length) {
                    
                     for (var i in keys) {
                         opts.push({ key: keys[i], value: values[i] })
                     }
                 }
             }
         }


         setOptions(opts);
    };

    return (
        <KeyValueSelectCtrl
            className={className}

            placeholder={placeholder}
            columnName={columnName}
            required={required}
            displayName={displayName}
            options={options}
            value={value}

            readonly={readonly}
            onChanged={onChanged}
            disabled={disabled}
        />
    );
};
const KeyValueNumberCtrl = (props: KeyValueBase) => {

    const { changeMode = "Enter", onEnter,readonly = false, className, placeholder, columnName, displayName, value, required, onChanged } = props;
    const [innerValue, setInnerValue] = useState<string | number | boolean | undefined>(value);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInnerValue(parseInt(e.target.value));

        if (changeMode === "Input")
            if (onChanged) onChanged(columnName ? columnName : displayName, parseInt(e.target.value));
    };
    const onKeyDown = (e: any) => {
        if (changeMode !== "Input") {
            if (e.keyCode === 13) {
                if (value !== innerValue) {
                    if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
                }
            }
        }

        if (e.keyCode === 13 && !e.shiftKey) {
            if(onEnter){
                onEnter(columnName ? columnName : displayName, innerValue);
            }
        }

    }
    const onBlur = (e: any) => {
        if (changeMode === "Enter") {
            if (value !== innerValue) {
                if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
            }
        }
    }
    useEffect(() => {
        setInnerValue(value);
    }, [value]);

    return (
        <div className={clsx(divEditorCss, className)}>

            <TextField


                label={displayName?displayName:" "}
                placeholder={placeholder}
                type={"number"}

                required={required ? true : false}
                disabled={readonly}
                size="small"
                value={innerValue ? innerValue.toString() : ''}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                variant="standard"


            ></TextField>

        </div>
    );
};

const KeyValueCtrl = (props: KeyValueBase & { multiple?: boolean, password?: boolean }) => {


    const { rows = 3, changeMode = "FocusOut", readonly = false, className, placeholder,onEnter, columnName, displayName, value, required, onChanged, multiple = false, password = false, onFocusOut } = props;
    const [innerValue, setInnerValue] = useState<string | number | boolean | undefined>(value);
    const [lineCnt,setLineCnt] = useState<number>(1)

    const onChange = (e: any) => {
        setInnerValue(e.target.value);

        setMultiLineCnt(e.target.value)
        if (changeMode === "Input")
            if (onChanged) onChanged(columnName ? columnName : displayName, e.target.value);
    };


    const onKeyDown = (e: any) => {
        if (changeMode !== "Input") {
            if (e.keyCode === 13) {
                if (value !== innerValue) {
                    
                    if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
                }
            }
        }

        if (e.keyCode === 13 && !e.shiftKey) {
            if(onEnter){
                onEnter(columnName ? columnName : displayName, innerValue);
            }
        }
    }

    const onBlur = (e: any) => {
        if (changeMode === "FocusOut") {
            if (value !== innerValue) {
                if (onChanged) onChanged(columnName ? columnName : displayName, innerValue);
            }
        }

        if (onFocusOut) onFocusOut();

    }

    useEffect(() => {
        var txt = value;
        if (value ) {
            var valueType = value.constructor;
            
            if (valueType === Object || valueType === Array) {
                try{
                txt = JSON.stringify(value)
                }
                catch{}
            }
            
        }  
        setMultiLineCnt(txt)
        
        setInnerValue(txt);
    }, [value]);

    const setMultiLineCnt =(txt?:any) =>{
    if (multiple) {
            if (txt) {
                var strs = txt?.toString().split("\n")
                if (strs) {
                    var len = strs.length + 1;
                    
                    if (rows < len) {

                        setLineCnt(len)
                    } else {
                        setLineCnt(rows)
                    }
                }
            }
            else {
                setLineCnt(rows)
            }
        }
    }
    return (
        <div className={clsx(divEditorCss, className)}>

            <TextField


                label={displayName?displayName:" " }
                placeholder={placeholder}
                type={password ? "password" : ""}

                required={required ? true : false}
                disabled={readonly}
                size="small"
                value={innerValue ? innerValue.toString() : ''}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                multiline={multiple}
                rows={multiple ? lineCnt : 1}
                variant="standard"


            ></TextField>

        </div>

    );
};

const KeyValueBooleanCtrl = (props: KeyValueBase) => {
    const { readonly = false, className, placeholder, columnName, displayName, value, required, onChanged } = props;
    const [innerValue, setInnerValue] = useState<string | number | boolean | undefined>(value);

    useEffect(() => {

        setInnerValue(value);
    }, [value]);

    const onChange = () => {

        setInnerValue(!innerValue);
        if (onChanged) onChanged(columnName ? columnName : displayName, !innerValue);
    };

    return (
        <div className={clsx(divEditorCss, className)}>

            <FormControlLabel disabled={readonly}  className ={"ps-4"} control={<Checkbox size='small' />} checked={innerValue ? true : false} onChange={onChange} label={displayName?displayName:" " } />

        </div>
    );
};


const KeyValueDateCtrl = (props: KeyValueBase) => {
    const { readonly = false, className, columnName, displayName, value, required, onChanged } = props;
    const [innerValue, setInnerValue] = useState<any | null>(dayjs(value?.toString()));

    const onChange = (e: any) => {
        const newValue = dayjs(e.$d);
        const formattedValue = newValue.format("YYYY-MM-DD");
        setInnerValue(newValue);
        if (onChanged) onChanged(columnName ? columnName : displayName, formattedValue);
    };

    return (
        <div className={clsx(divEditorCss, className)}>

            <DateField

                format={"YYYY-MM-DD"}
                label={displayName?displayName:" " }
                required={required ? true : false}
                disabled={readonly}
                size="small"

                value={innerValue}
                onChange={onChange}
                variant="standard"


            ></DateField>


        </div>
    );
};


const defaultValueConvert = (value?: string) => {

    var strDt = ConvertDateToYYYY_MM_DD(new Date());
    return strDt + " " + value;
}
const KeyValueTimeCtrl = (props: KeyValueBase) => {
    const { readonly = false, className, columnName, displayName, value, required, onChanged } = props;

    const [innerValue, setInnerValue] = useState<any | null>(dayjs(defaultValueConvert(value?.toString())));


    const onChange = (e: any) => {
        const newValue = dayjs(e.$d);
        const formattedValue = newValue.format('HH:mm');
        setInnerValue(newValue);
        if (onChanged) onChanged(columnName ? columnName : displayName, formattedValue);
    };

    return (
        <div className={clsx(divEditorCss, className)}>

            <TimeField

                format={"HH:mm"}
                label={displayName?displayName:" " }
                required={required ? true : false}
                disabled={readonly}
                size="small"

                value={innerValue}
                onChange={onChange}
                variant="standard"




            ></TimeField>


        </div>
    );
};

const JsonModelSelectCtrl = (props: KeyValueBase & { options?: JsonModel[], parentValue?: string }) => {
    const { readonly = false, className, placeholder, columnName, displayName, value, required, onChanged, disabled, options, parentValue } = props;
    const [selectValues, setSelectValues] = useState<{ opts: JsonModel[] | undefined, key: string }[]>();



    useEffect(() => {

        if (options) {

            var newArray = ConvertValueToJsonModels(value?.toString(), options);

            setSelectValues(newArray);


        }
        else {
            setSelectValues(undefined)
        }

    }, [value, options]);
    const ConvertValueToJsonModels = (v: string | undefined, options: JsonModel[] | undefined) => {
        var rtn = [];
        var arry = options;
        if (v && v.length > 0) {
            var strs = v.split(".");


            for (var i in strs) {
                var str = strs[i];
                rtn.push({ key: str, opts: ConvertJonModelsToOptions(arry) });
                var isFind = false;
                if (arry && arry.length) {
                    for (var j in arry) {
                        var opt = arry[j];
                        if (opt.key === str) {
                            arry = opt.child;
                            // if(opt.jsonType === "Array" || opt.jsonType === "Object")
                            //     arry = opt.child;
                            // else
                            //     arry = undefined;

                            isFind = true;
                            break;
                        }

                    }
                    if (!isFind) {
                        // if(rtn.length > 0){
                        //     rtn[rtn.length-1].key = undefined;
                        // }
                        arry = undefined;
                    }
                }
                else {
                    break;
                }
            }
        }
        if (arry)
            rtn.push({ key: "", opts: ConvertJonModelsToOptions(arry) });


        return rtn;
    }

    const ConvertJonModelsToOptions = (models?: JsonModel[]) => {
        var ops = [];
        if (models && models.length > 0) {

            for (var j in models) {
                var item = models[j];

                var displayName = item.displayName;

                if (item.displayName) {
                    displayName = item.displayName;
                }
                else {
                    displayName = item.key;
                }

                ops.push({ key: item.key, value: displayName, orgItem: item })

            }
        }

        return ops
    }
    const onSelectedValue = (index: number, value?: KeyValueAndOrgObject) => {
        var newArray = CopyArray(selectValues);
        var jsonModel: JsonModel = value?.orgItem
        if (newArray.length > index + 1)
            newArray.splice(index + 1, newArray.length);
        if (jsonModel && jsonModel.child && jsonModel.child.length > 0) {
            newArray.push({ key: "", opts: ConvertJonModelsToOptions(jsonModel.child) })
        }
        setSelectValues(newArray);



        reloadValue(newArray);
    }

    const reloadValue = (newArray: JsonModel[]) => {

        var staticKey = "";
        var displayKey = "";
        var beforeOpts = options;
        if (newArray && newArray.length > 0) {
            for (var i in newArray) {
                var strKey = newArray[i].key;

                if (strKey) {
                    if (parseInt(i) > 0) {
                        staticKey += "." + strKey;
                    }
                    else {
                        staticKey = strKey;
                    }
                }

                if (beforeOpts) {
                    var tmpObj = beforeOpts?.find(x => x.key === strKey)

                    beforeOpts = undefined;
                    if (tmpObj) {
                        beforeOpts = tmpObj.child;
                        var display = strKey;
                        if (tmpObj.displayName) {
                            display = tmpObj.displayName
                        }
                        else if (tmpObj.value) {
                            display = tmpObj.value
                        }
                        if (display) {
                            if (parseInt(i) > 0) {
                                displayKey += "." + display;
                            }
                            else {
                                displayKey = display;
                            }
                        }


                    }
                }
            }
        }

        if (onChanged) onChanged(staticKey, displayKey);
    }
    return (



        <div className={clsx(className,"d-flex")}>

            {selectValues?.map((item, index) => {

                if (item.opts && item.opts.length > 0) {
                    return (

                        <KeyValueSelectCtrl
                            key={`indexValues${index}`}
                            className={index > 0 ? 'col' : 'col'}



                            placeholder={placeholder}
                            columnName={columnName}
                            required={required}
                            displayName={index === 0 ? displayName : ''}
                            options={item.opts}
                            value={item.key}
                            readonly={readonly}
                            onChanged={(k: string, v: KeyValueAndOrgObject) => {
                                item.key = v.key;

                                onSelectedValue(index, v);
                            }}
                            disabled={disabled}
                        />
                    )
                }

            })}

        </div>

    );
}


const SingleJsonModelValueItemCtrl =
    ({ value, jsonModel, rerendering, className, required, displayName, columnName, readonly = false, onChanged }:
        KeyValueBase & { value: any, jsonModel?: JsonModel }) => {
        const [objectValue, setObjectValue] = useState<any>({});
        useEffect(() => {
            if (value) {
                setObjectValue(value);
            }
        }, [value, rerendering])
        const changed = (k: string, v: any) => {
            objectValue[k] = v;
            if (onChanged) onChanged(columnName ? columnName : displayName, objectValue);
        }
        return (
            <div className={clsx(divEditorCss, className)}>


                {jsonModel && jsonModel.child && jsonModel?.child?.length > 0 && jsonModel?.child.map((model, index) => {
                    if (model.jsonType === "String" || model.jsonType === "Any")
                        return (<KeyValueCtrl key={`valueIndex${index}`} changeMode='Input' columnName={model.key}
                            displayName={displayName ? `${displayName}.${model.key}` : model.key}
                            className={'col'} readonly={readonly} value={objectValue[model.key]}
                            onChanged={changed}
                        />)
                    else if (model.jsonType === "Number")
                        return (<KeyValueNumberCtrl key={`valueIndex${index}`} className={'col'} columnName={model.key}
                            changeMode='Input' readonly={readonly}
                            displayName={displayName ? `${displayName}.${model.key}` : model.key}
                            value={objectValue[model.key]}
                            onChanged={changed}
                        />)
                    else if (model.jsonType === "Boolean")
                        return (<KeyValueBooleanCtrl key={`valueIndex${index}`} className={'col'} changeMode='Input' columnName={model.key}
                            readonly={readonly}
                            displayName={displayName ? `${displayName}.${model.key}` : model.key} value={objectValue[model.key]}
                            onChanged={changed}
                        />)
                    else if (model.jsonType === "Object")
                        return (<SingleJsonModelValueItemCtrl key={`valueIndex${index}`} className={'col'} columnName={model.key}
                            readonly={readonly}
                            displayName={displayName ? `${displayName}.${model.key}` : model.key}
                            jsonModel={model} value={objectValue[model.key]}
                            onChanged={changed}
                        />)
                    else if (model.jsonType === "Array" || (model.jsonType && model.jsonType?.indexOf("Array") > -1))
                        return (<ArrayJsonModelInputsCtrl key={`valueIndex${index}`} className={'col'} readonly={readonly} columnName={model.key}
                            displayName={displayName ? `${displayName}.${model.key}` : model.key} jsonModel={model}
                            arrayValue={objectValue[model.key]}
                            onChanged={changed}
                        />)
                })
                }

            </div>
        )
    }
const ArrayJsonModelInputsCtrl = (props: KeyValueBase & { jsonModel?: JsonModel, arrayValue?: any[] }) => {
    const { className, rerendering, placeholder, columnName, displayName, arrayValue, required, onChanged, readonly = false, jsonModel } = props;
    const [currentValue, setCurrentValue] = useState<any[]>();
    useEffect(() => {
        if (arrayValue) {
            setCurrentValue(CopyArray(arrayValue));
        }
        else {
            OnAddItem(0, [])
        }
    }, [jsonModel, arrayValue, rerendering])
    const OnRemoveItem = (index: number, beforeValue: any[]) => {
        var newArry = CopyArray(beforeValue)
        newArry.splice(index, 1);
        setCurrentValue(newArry);
        if (onChanged) onChanged(columnName ? columnName : displayName, newArry);
    }
    const OnAddItem = (index: number, beforeValue: any[]) => {

        var newArry = CopyArray(beforeValue)


        if (jsonModel && jsonModel.jsonType === "Array" && jsonModel.child && jsonModel.child.length > 0) {
            var newObj: any = {};
            for (var i in jsonModel.child) {
                var col = jsonModel.child[i].key;
                if (col)
                    newObj[col] = undefined;
            }
            newArry.push(newObj);
        }
        else if (jsonModel?.jsonType !== "Array") {
            newArry.push(undefined);
        }

        setCurrentValue(newArry);
        if (onChanged) onChanged(columnName ? columnName : displayName, newArry);
    }
    return (
        <div className={clsx(divEditorCss, className)}>


            {currentValue && currentValue.length > 0 && currentValue.map((item, index) => {
                if (jsonModel?.jsonType === "Array") {
                    return (
                        <SingleJsonModelValueItemCtrl key={`arrItem${index}`}
                            readonly={readonly}
                            displayName={displayName ? `${displayName}[${index}]` : ''}
                            jsonModel={jsonModel} value={item}
                            onChanged={(k: string, v: any) => {
                                currentValue[index] = v;
                                if (onChanged) onChanged(columnName ? columnName : displayName, currentValue);
                            }}
                        />
                    )
                }
                else if (jsonModel?.jsonType === "Array_String" || jsonModel?.jsonType === "Array_Any") {
                    return (
                        <KeyValueCtrl key={`arrItem${index}`}
                            displayName={displayName ? `${displayName}[${index}]` : ''}
                            value={item} readonly={readonly}
                            onChanged={(k: string, v: String) => {
                                currentValue[index] = v;
                                if (onChanged) onChanged(columnName ? columnName : displayName, currentValue);
                            }}
                        />)
                }
                else if (jsonModel?.jsonType === "Array_Number") {
                    return (
                        <KeyValueNumberCtrl key={`arrItem${index}`}
                            displayName={displayName ? `${displayName}[${index}]` : ''}
                            value={item} readonly={readonly}
                            onChanged={(k: string, v: Number) => {
                                currentValue[index] = v;
                                if (onChanged) onChanged(columnName ? columnName : displayName, currentValue);
                            }}
                        />)
                }
                else if (jsonModel?.jsonType === "Array_Boolean") {
                    return (
                        <KeyValueBooleanCtrl key={`arrItem${index}`}
                            displayName={displayName ? `${displayName}[${index}]` : ''}
                            value={item} readonly={readonly}
                            onChanged={(k: string, v: Boolean) => {
                                currentValue[index] = v;
                                if (onChanged) onChanged(columnName ? columnName : displayName, currentValue);
                            }}
                        />)
                }
            })}
            <div className='d-flex justify-content-center align-items-center my-4'>
                <label className='mx-1' onClick={() => { OnRemoveItem(currentValue && currentValue.length > 0 ? currentValue.length - 1 : 0, currentValue ? currentValue : []) }} >
                    <span className='badge badge-light-danger badge-sm cursor-pointer'>-</span>
                </label>
                <label className='mx-1' onClick={() => { OnAddItem(currentValue && currentValue.length > 0 ? currentValue.length : 1, currentValue ? currentValue : []) }} >
                    <span className='badge badge-light-primary badge-sm cursor-pointer'>+</span>
                </label>
            </div>

        </div>
    )
}
const EditorCtrl = ({sessionID, value, language, onChanged, className }: { sessionID?:string,className?: string, value?: string, language?: string, onChanged?: Function }) => {
    
    const [editorRef, setEditorRef] = useState<any>()
    
    useEffect(()=>{
        
        if( sessionID && editorRef){

            const strScrollPosition = sessionStorage.getItem(`EditorScrollPosition${sessionID}`);
            if (strScrollPosition) {
                const scrollPosition = JSON.parse(strScrollPosition);
                if (scrollPosition) {
                    editorRef.setScrollTop(scrollPosition.scrollTop);
                    editorRef.setScrollLeft(scrollPosition.scrollLeft);
                }
            }

            var strPosition = sessionStorage.getItem(`EditorPosition${sessionID}`)
            if (strPosition) {
                var obj = JSON.parse(strPosition)
                if (obj) {
                    editorRef.setPosition(obj);
                    editorRef.focus();
                    
                }
                
            }
            //editorRef.getAction('editor.action.formatDocument')?.run();
        }
        
        return ()=>{
            
            if (sessionID && editorRef) {
                const position = editorRef.getPosition();
                if (sessionID && position) {
                    sessionStorage.setItem(`EditorPosition${sessionID}`, JSON.stringify(position))
                }


                const scrollPosition = {
                    scrollTop: editorRef.getScrollTop(),
                    scrollLeft: editorRef.getScrollLeft(),
                };

                
                if (sessionID && scrollPosition) {
                    sessionStorage.setItem(`EditorScrollPosition${sessionID}`, JSON.stringify(scrollPosition));
                }
            }
        }
    },[sessionID,editorRef,value])

    return (
        <Editor
            value={value?value:""}
            theme={FlowLineStyle.Theme === "dark" ? "vs-dark" : ""}

            onChange={(v: string | undefined) => {
                if (onChanged)
                    onChanged(v);
            }}

            onMount={(editor) => {
                setEditorRef(editor)
                // setTimeout(function () {
                //     editor.getAction('editor.action.formatDocument')?.run();
                // }, 300);

            }}
            
            language={language}
            className={clsx(className)}
            options={{

                fontSize: 14, minimap: { enabled: true }, lineNumbers: "on",
                roundedSelection: true,//wordWrap: "on",
                scrollBeyondLastLine: false,
                scrollbar: {
                    // useShadows: false,
                    // verticalHasArrows: true,
                    // horizontalHasArrows: true,
                    // vertical: 'hidden',
                    // horizontal: 'hidden',
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                },
            }}

        ></Editor>

    )
}

const JsonModelItemCtrl = (props: {
    jsonModel: JsonModel;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    typePlaceholder?: string;

    className?: string
    onChanged?: Function;
    readonly?: boolean;
    valueInput?: boolean;
    keyInput?: boolean;
    onFocusOut?: Function
    showKey?: boolean
}) => {
    const { showKey = true, jsonModel, onFocusOut, onChanged, className, keyPlaceholder
        , valuePlaceholder, typePlaceholder, readonly = false, valueInput = false, keyInput = true

    } = props;


    const [jsonType, setJsonType] = useState<string>();

    useEffect(() => {
        if (jsonModel.value)
            jsonModel.isFixedValue = true;
        else
            jsonModel.isFixedValue = false;

        setJsonType(jsonModel.jsonType)
    }, [jsonModel, jsonModel.jsonType]);

    const chagedMethod = (jsonModel: JsonModel) => {
        if (jsonModel.jsonType !== "Object" && jsonModel.jsonType !== "Array") {
            jsonModel.child = undefined;
        }
        if (onChanged) onChanged(jsonModel);
    }
    return (
        <>

            {(!readonly || (readonly && jsonModel.key && jsonModel.key.length > 0)) &&
                <div className={clsx(className ? className : '', 'col')} >
                    <div className='row'>
                        {showKey &&
                            <Fragment>
                                {keyInput &&
                                    <KeyValueCtrl value={jsonModel.key}
                                        className='col me-2' readonly={readonly}
                                        changeMode='Input'
                                        onFocusOut={onFocusOut}
                                        displayName='Key'
                                        placeholder={keyPlaceholder} onChanged={(k: string, v: string) => {
                                            jsonModel.key = v;
                                            chagedMethod(jsonModel);

                                        }}></KeyValueCtrl>}

                                {!keyInput && (jsonType === "Object" || jsonType === "Array") &&
                                    <span className={clsx("col",divEditorMCss)} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{`${(jsonModel.displayName ? jsonModel.displayName : jsonModel.key)} (${jsonType})`}</span>
                                }
                            </Fragment>
                        }
                        {keyInput &&
                            <KeyValueCodeSelectCtrl value={jsonType} className='col me-2'
                                readonly={readonly} displayName='Type'
                                placeholder={typePlaceholder} groupName='RSTOUTPUT'
                                onChanged={(k: string, v: KeyValue) => {
                                    jsonModel.jsonType = v.key;
                                    setJsonType(jsonModel.jsonType);
                                    chagedMethod(jsonModel);
                                }}
                            ></KeyValueCodeSelectCtrl>
                        }
                        {valueInput && <>

                            <div className='col'>
                                {jsonType !== "Object" && jsonType !== "Array" &&
                                    <KeyValueAutoCompleteCtrl
                                        // changeMode="Input"
                                        value={jsonModel.value}
                                        className='col ' readonly={readonly}

                                        displayName={keyInput ? 'Value' : `${(jsonModel.displayName ? jsonModel.displayName : jsonModel.key)} (${jsonType})`}
                                        placeholder={valuePlaceholder} onChanged={(k: string, v: string) => {

                                            jsonModel.value = v;
                                            if (v)
                                                jsonModel.isFixedValue = true;
                                            else
                                                jsonModel.isFixedValue = false;


                                            chagedMethod(jsonModel);

                                        }}></KeyValueAutoCompleteCtrl>}
                            </div>

                        </>
                        }
                    </div>

                    {jsonType === "Object" && <JsonModelCtrl isFirst={false} jsonModels={jsonModel.child} showBracket={true}
                        keyPlaceholder={keyPlaceholder}
                        valuePlaceholder={valuePlaceholder}
                        typePlaceholder={typePlaceholder}
                        readonly={readonly}
                        valueInput={valueInput}
                        keyInput={keyInput}

                        onChanged={(v: JsonModel[]) => {

                            jsonModel.child = v;
                            chagedMethod(jsonModel);
                        }}
                    ></JsonModelCtrl>}
                    {jsonType === "Array" &&
                        <>
                            <span className={clsx("col col-12",divEditorMCss)} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"["}</span>

                            <div className='ps-6' style={{ listStyle: 'none' }}>

                                <JsonModelCtrl jsonModels={jsonModel.child} showBracket={true} isFirst={false}
                                    keyPlaceholder={keyPlaceholder}
                                    valuePlaceholder={valuePlaceholder}
                                    typePlaceholder={typePlaceholder}
                                    readonly={readonly}
                                    valueInput={valueInput}
                                    keyInput={keyInput}

                                    onChanged={(v: JsonModel[]) => {

                                        jsonModel.child = v;
                                        chagedMethod(jsonModel);
                                    }}
                                ></JsonModelCtrl>

                            </div>
                            <span className={clsx("col col-12",divEditorMCss)} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"]"}</span>
                        </>
                    }


                </div>}

        </>
    );
};

const ReturnModelCtrl = (props: {
    model?: ReturnModel;
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    className?: string
    onChanged?: Function;
}) => {
    const { model, onChanged, className, keyPlaceholder, valuePlaceholder } = props;

    const [jsonType, setJsonType] = useState<string>();
    const [innerModel, setInnerModel] = useState<ReturnModel>();
    const [dtlView, setDtlView] = useState<boolean>();
    useEffect(() => {
        if (model) {
            setInnerModel(model)
            setJsonType(model?.jsonType)
        }
        else {
            setInnerModel({})
        }

    }, [model, model?.jsonType]);

    const chagedMethod = () => {
        if (innerModel && innerModel?.jsonType !== "Object" && innerModel?.jsonType !== "Array") {
            innerModel.child = undefined;
        }
        if (onChanged) onChanged(innerModel);
    }
    return (
        

        <>
            <FormControlLabel className={clsx(divEditorMCss)} control={<Switch />} label="Setting" value={dtlView}
                onChange={() => { setDtlView(!dtlView) }}
            />
            {dtlView && <>


                <KeyValueCodeSelectCtrl value={jsonType} className='col w-100 p-0'
                    displayName='Type'
                    groupName='RSTOUTPUT'
                    onChanged={(k: string, v: KeyValue) => {
                        if (innerModel) {
                            innerModel.jsonType = v.key;
                            setJsonType(innerModel.jsonType);
                            chagedMethod();
                        }
                    }}
                ></KeyValueCodeSelectCtrl>





                {jsonType === "Object" && <JsonModelCtrl isFirst={false} jsonModels={innerModel?.child} showBracket={true}
                    keyPlaceholder={keyPlaceholder}
                    valuePlaceholder={valuePlaceholder}
                    onChanged={(v: JsonModel[]) => {
                        if (innerModel) {
                            innerModel.child = v;
                            chagedMethod();
                        }
                    }}
                ></JsonModelCtrl>}
                {jsonType === "Array" &&
                    <>
                        <span className={clsx("col col-12")} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"["}</span>

                        <div className='ps-6' style={{ listStyle: 'none' }}>

                            <JsonModelCtrl jsonModels={innerModel?.child} showBracket={true} isFirst={false}
                                keyPlaceholder={keyPlaceholder}
                                valuePlaceholder={valuePlaceholder}

                                onChanged={(v: JsonModel[]) => {
                                    if (innerModel) {
                                        innerModel.child = v;
                                        chagedMethod();
                                    }
                                }}
                            ></JsonModelCtrl>

                        </div>
                        <span className={clsx("col col-12")} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"]"}</span>
                    </>
                }

            </>}
        </>

        
    );
};


const JsonModelCtrl = (props: {
    jsonModels?: JsonModel[]
    onChanged?: Function
    keyPlaceholder?: string
    valuePlaceholder?: string
    typePlaceholder?: string
    className?: string
    valueCss?: string
    readonly?: boolean
    valueInput?: boolean;
    keyInput?: boolean;
    showBracket?: boolean;
    isFirst?: boolean
}) => {

    const { jsonModels, onChanged, keyPlaceholder, valuePlaceholder, typePlaceholder, className
        , showBracket = false, isFirst = true
        , readonly = false, valueInput = false, keyInput = true } = props;
    const [innerValueList, setInnerValue] = useState<JsonModel[]>();

    useEffect(() => {
        var newList: JsonModel[] = [];

        if (jsonModels && jsonModels.length > 0) {
            for (var i in jsonModels) {
                var item = jsonModels[i];
                if (item && item.key.length > 0) {
                    newList.push(item);
                }
            }
        }

        if (keyInput)
            newList.push(newItem());
        setInnerValue(newList);

    }, [jsonModels]);

    const newItem = () => {
        return { key: "", value: "", jsonType: "String", type: "", inputValue: "inputParam" }
    }
    const OnRemoveItem = (index: number) => {
        if (innerValueList && innerValueList.length > 1) {
            var newArry: JsonModel[] = [];
            innerValueList.splice(index, 1);
            newArry = newArry.concat(innerValueList);
            setInnerValue(newArry);
        }
    }

    const OnAddItem = () => {
        var index = 0;
        var newItems: JsonModel[] = [];
        if (innerValueList) {
            for (var i in innerValueList) {
                newItems.push(innerValueList[i]);
                index = index + 1;
            }

        }
        newItems.push(newItem());
        setInnerValue(newItems);
    }

    const onChangedEvent = (lst: JsonModel[]) => {

        var newList: JsonModel[] = [];
        if (lst && lst.length > 0) {
            for (var i in lst) {
                var item = lst[i];
                if (item && item.key.length > 0) {
                    newList.push(item);
                }
            }
        }
        if (onChanged) onChanged(newList);

    }

    return (
        <>
            {showBracket && <span className={clsx('col col-12')}style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"{"}</span>}
            <div className={clsx(className ? className : '', !isFirst ? 'ps-6' : '')} >
                {innerValueList?.map((item, index) => {
                    return (
                        <JsonModelItemCtrl
                            key={`rstOutputIndex${index}`}
                            jsonModel={item}
                            readonly={readonly}
                            valueInput={valueInput}
                            keyInput={keyInput}
                            className={clsx('', keyInput && innerValueList.length === index + 1 ? 'opacity-50' : '')}
                            valuePlaceholder={valuePlaceholder}
                            keyPlaceholder={keyPlaceholder}
                            typePlaceholder={typePlaceholder}
                            onFocusOut={() => {

                                var value = innerValueList[index];

                                if (innerValueList.length !== index + 1 && (!value.key || value.key.length === 0)) {
                                    OnRemoveItem(index);
                                }
                                onChangedEvent(innerValueList);

                            }}
                            onChanged={(obj: JsonModel) => {

                                var isNotSharedValue = obj.value?.indexOf('@') === -1;
                                if (isNotSharedValue) {
                                    if (obj.jsonType === 'Number') {
                                        obj.value = parseFloat(obj.value);
                                    }
                                    else if (obj.jsonType === 'Boolean') {
                                        if (obj.value?.toLowerCase() === 'true')
                                            obj.value = true;
                                        else obj.value = false;
                                    }
                                }

                                innerValueList[index] = obj;

                                if (keyInput && innerValueList.length === index + 1 && obj && obj.key.length > 0) {
                                    OnAddItem();
                                }

                                onChangedEvent(innerValueList);


                            }}

                        />
                    );
                })}


            </div>
            {showBracket && <span className={clsx("col col-12")} style={{ fontFamily: FlowLineStyle.FontFamily, fontSize: FlowLineStyle.FontSize, color: FlowLineStyle.TextBoxInnerColor }}>{"}"}</span>}
        </>
    );
};




export {
    KeyValueCtrl
    , KeyValueNumberCtrl
    , KeyValueCodeSelectCtrl
    , KeyValueLookUpSelectCtrl
    , KeyValueSelectCtrl
    , KeyValueBooleanCtrl
    , KeyValueAutoCompleteCtrl
    , JsonModelSelectCtrl
    , SingleJsonModelValueItemCtrl
    , ArrayJsonModelInputsCtrl
    , KeyValueDateCtrl
    , KeyValueTimeCtrl
    , EditorCtrl
    , JsonModelItemCtrl
    , ReturnModelCtrl
    , JsonModelCtrl
};