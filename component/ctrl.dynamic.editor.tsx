import { Fragment, ReactNode, useEffect, useState } from 'react'

import clsx from 'clsx'

import { DynamicEditProps } from "./ui.models.js"
import { KeyValueDateCtrl, KeyValueLookUpSelectCtrl, KeyValueCodeSelectCtrl, KeyValueCtrl, KeyValueBooleanCtrl, KeyValueNumberCtrl, KeyValueSelectCtrl, divEditorCss } from './ctrl.editors.js'
import { useAppContext } from './ctx.app.js'

import { GetDynamicButtonCss } from './ui.utils.js';
import FileUploadContainer from './ctrl.file.upload.js'


import { ConvertInputCtrlModelToKeyValue, ConvertKeyValueObjectToObject, Guid, ObjClone } from "flowline_common_model/src/util.common"
import { InputCtrlModel, KeyValueAndOrgObject } from 'flowline_common_model/src/models'
import LoadingButton from '@mui/lab/LoadingButton/index.js'



import { IconButton, Menu } from '@mui/material'
import { FlowLineStyle } from './flowline.style.js'
import SVG from 'react-inlinesvg'
import { HtmlEditorCtrl } from './ctrl.editors.html.js'
import { IConCtrl } from './ctrl.icon.selector.js'
import FlowLineUtils from './flowline.utils.js'
import { useFuncMapContext } from './ctx.function.map.js'
import { useControlContext } from './ctx.control.js'



const divCss = 'col col-auto mb-2'


type InputCtrlArry = {
    orientation: string
    items: InputCtrlModel[]
    isBtnArry: boolean
}

const Ctrl = ({ orientation, children, cType }: { orientation?: string, cType?: InputCtrlArry, children: ReactNode }) => {

    if (orientation === "Vertical") {
        return (
            <div className={clsx("mb-4", cType?.orientation === "Vertical" ? "" : cType?.isBtnArry ? "d-flex justify-content-end" : "d-flex justify-content-between ")} >{children}</div>

        )
    }
    else {
        return (

            <Fragment>{children}</Fragment>
        )
    }
}
export const InnerInputCtrl = ({ inputParams, isContextMenu, orientation, onEvent }: { orientation?: "Vertical" | "Horizontal", inputParams?: InputCtrlModel[], isContextMenu?: boolean, onEvent: Function }) => {
    const [htmlCtrlFocus, setHtmlCtrlFocus] = useState<boolean>(false)
    const appContext = useAppContext();
    const ctrlContext= useControlContext();
    const funcMapContext = useFuncMapContext();


    const [inputParam2Arry, setInputParam2Arry] = useState<InputCtrlArry[]>();


    useEffect(() => {

        var input2Arry: InputCtrlArry[] = []
        var beforeType = undefined
        var beforeArry: InputCtrlArry | undefined;
        if (inputParams && inputParams.length > 0) {
            for (var i in inputParams) {
                var ctrl: InputCtrlModel = inputParams[i];
                if (ctrl && ctrl.TYPE !== "HiddenValue") {
                    if (!beforeType || ((ctrl.TYPE === "ButtonParam") !== (beforeType === "ButtonParam"))) {
                        beforeArry = { orientation: (ctrl.TYPE === "ButtonParam" ? 'Horizontal' : (orientation ? orientation : "Horizontal")), items: [], isBtnArry: ctrl.TYPE === "ButtonParam" };
                        input2Arry.push(beforeArry)
                    }

                    beforeType = ctrl.TYPE;
                    if (beforeArry && beforeArry.items)
                        beforeArry.items.push(ctrl);
                }
            }
        }


        setInputParam2Arry(input2Arry)
    }, [inputParams])






    return (<Fragment>
        {orientation && inputParam2Arry && inputParam2Arry.map((parent, pindex) =>



            <Ctrl key={`inputKeyPIndex${pindex}`} orientation={orientation} cType={parent}>

                {parent && parent.items && parent.items.map((param, index) => {



                    var marginEnd = ""
                    var css = undefined
                    if (parent.items?.length > index + 1) {
                        marginEnd = "me-5"
                    }
                    if (orientation === "Vertical") {
                        css = "m-0 py-4 ps-4"
                    }
                    if (isContextMenu ? param.IsContextMenu : !param.IsContextMenu && param.TYPE !== "HiddenValue") {

                        var cellValue = param.VALUE;

                        if (param && param.VALUE && param.VALUE.constructor === Array) {
                            cellValue = param.VALUE[0]
                        }
                        var btnCss = undefined
                        if (param.ButtonSetting) {
                            btnCss = GetDynamicButtonCss(param.ButtonSetting.COL_BUTTON_COLOR)
                        }
                        return (
                            <div key={`inputKeyIndex${index}${pindex}`} className={clsx(parent.orientation === "Vertical" ? "d-flex-row" : (param.TYPE !== "ButtonParam" ? `w-100 ${marginEnd}` : marginEnd))} >

                                {param.TYPE === "DateTimeParam" &&
                                    <KeyValueDateCtrl
                                        value={cellValue}
                                        className={css ? css : undefined}
                                        displayName={param.DISPLAYNAME}
                                        readonly={funcMapContext.loading || funcMapContext.chatLoading}

                                        columnName={param.NAME} onChanged={async (k: string, v: any) => {
                                            param.VALUE = v;

                                            await onEvent(param.EventKey);

                                        }} />}
                                {(param.TYPE === "TextParam" || param.TYPE === "MultiTextParam" || param.TYPE === "PasswordParam" || param.TYPE === "LabelParam") &&
                                    <KeyValueCtrl
                                        className={css ? css : undefined}
                                        password={param.TYPE === "PasswordParam"}
                                        readonly={param.TYPE === "LabelParam" || funcMapContext.loading || funcMapContext.chatLoading}
                                        multiple={param.TYPE === "MultiTextParam"}
                                        value={cellValue}

                                        onEnter={async (k: string, v: any) => {
                                            param.VALUE = v;
                                            await onEvent(param.EventKey);
                                        }}

                                        displayName={param.DISPLAYNAME} columnName={param.NAME} onChanged={async (k: string, v: any) => {
                                            param.VALUE = v;
                                            //await onEvent(param.EventKey);
                                        }} />
                                }
                                {param.TYPE === "BooleanParam" && <KeyValueBooleanCtrl
                                    value={cellValue}
                                    className={css ? css : undefined}
                                    readonly={funcMapContext.loading || funcMapContext.chatLoading}
                                    displayName={param.DISPLAYNAME} columnName={param.NAME} onChanged={async (k: string, v: any) => {
                                        param.VALUE = v;
                                        await onEvent(param.EventKey);
                                    }} />}
                                {param.TYPE === "NumberParam" && <KeyValueNumberCtrl displayName={param.DISPLAYNAME}
                                    value={cellValue}
                                    className={css ? css : undefined}
                                    readonly={funcMapContext.loading || funcMapContext.chatLoading}
                                    columnName={param.NAME}
                                    onEnter={async (k: string, v: any) => {
                                        param.VALUE = v;
                                        await onEvent(param.EventKey);
                                    }}
                                    onChanged={async (k: string, v: any) => {
                                        param.VALUE = v;
                                        //await onEvent(param.EventKey);
                                    }} />}
                                {param.TYPE === "HtmlParam" && <HtmlEditorCtrl displayName={param.DISPLAYNAME}
                                    value={cellValue}

                                    onFocus={() => {
                                        setHtmlCtrlFocus(true)

                                    }}
                                    onBlur={async () => {
                                        setHtmlCtrlFocus(false)
                                        await onEvent(param.EventKey);
                                    }}
                                    columnName={param.NAME} onChanged={async (v: string) => {
                                        param.VALUE = v;
                                        //await onEvent(param.EventKey);
                                    }} />}
                                {param.TYPE === "LookupParam" &&
                                    <KeyValueLookUpSelectCtrl
                                        value={cellValue}
                                        className={css ? css : undefined}
                                        readonly={funcMapContext.loading || funcMapContext.chatLoading}
                                        flowLineClient={appContext.flowLineClient}
                                        displayName={param.DISPLAYNAME} columnName={param.NAME} onChanged={async (k: string, v: KeyValueAndOrgObject) => {
                                            param.VALUE = v.key;
                                            await onEvent(param.EventKey);
                                        }}
                                        lookUpSetting={param.LookUpSetting} />
                                }
                                {param.TYPE === "DropDownParam" && <KeyValueSelectCtrl
                                    value={cellValue}
                                    className={css ? css : undefined}
                                    readonly={funcMapContext.loading || funcMapContext.chatLoading}
                                    displayName={param.DISPLAYNAME} columnName={param.NAME}
                                    onChanged={async (k: string, v: KeyValueAndOrgObject) => {
                                        param.VALUE = v.key;
                                        await onEvent(param.EventKey);
                                    }}
                                    options={param.DropDownOptions} />}
                                {param.TYPE === "CodeDropDownParam" && <KeyValueCodeSelectCtrl
                                    value={cellValue}
                                    className={css ? css : undefined}
                                    readonly={funcMapContext.loading || funcMapContext.chatLoading}
                                    displayName={param.DISPLAYNAME} columnName={param.NAME} onChanged={async (k: string, v: KeyValueAndOrgObject) => {
                                        param.VALUE = v.key;
                                        await onEvent(param.EventKey);
                                    }}
                                    groupName={param.OPTION} />}

                                {(param.TYPE === "FileUploadParam" || param.TYPE === "MultiFileUploadParam") &&
                                    <FileUploadContainer

                                        useDragAndDrap={true}
                                        multiple={param.TYPE === "MultiFileUploadParam"}
                                        className={clsx(css ? css : divEditorCss)} uploadComplted={async (result: any) => {

                                            if (param.TYPE === "MultiFileUploadParam") {
                                                var arry = [];
                                                for (var i in result) {
                                                    arry.push(result[i].info.path)
                                                }
                                                param.VALUE = arry;
                                            }
                                            else {
                                                param.VALUE = result.info.path
                                            }

                                            await onEvent(param.EventKey);
                                        }}>




                                        <span className='btn btn-sm btn-primary'>{param.DISPLAYNAME ? param.DISPLAYNAME : "Upload"}</span>


                                    </FileUploadContainer>}

                                {param.TYPE === "ButtonParam" && param.ButtonSetting &&
                                    <div className={clsx(parent.orientation === "Vertical" ? " " : divCss, 'h-100 d-flex justify-content-end mt-2 align-items-center')}>
                                        <LoadingButton

                                            loading={funcMapContext.loading || funcMapContext.chatLoading}

                                            loadingPosition={param.ButtonSetting.COL_ICON ? "end" : undefined}
                                            endIcon={param.ButtonSetting.COL_ICON ? <IConCtrl type={param.ButtonSetting.COL_ICON} size={16} /> : undefined}
                                            variant={btnCss?.variant}
                                            color={btnCss?.color}
                                            sx={{whiteSpace:"nowrap",minWidth:"80px"}}
                                            className="h-25px" size="small" onClick={async () => {

                                  
                                                if (param.ButtonSetting?.COL_CONFIRM_MESSAGE) {

                                                    ctrlContext.confirm("", param.ButtonSetting?.COL_CONFIRM_MESSAGE, async () => {
                                                        await onEvent(param.EventKey);
                                                    })

                                                }
                                                else {
                                                    await onEvent(param.EventKey);
                                                }


                                            }} >
                                            {cellValue ? cellValue : (param.ButtonSetting.COL_BUTTON_NAME ? param.ButtonSetting.COL_BUTTON_NAME : "")}
                                        </LoadingButton>
                                    </div>
                                }
                            </div>



                        )
                    }

                })}



            </Ctrl>

        )}


    </Fragment>)

}
const DynamicInputControl = (props: DynamicEditProps) => {
    const { onEventAction, value, rerendering, loading, functionMap } = props;
    const appContext = useAppContext();




    const [cloneInputParam, setCloneInputParam] = useState<InputCtrlModel[]>();
    const [innerRerendering, setRerendering] = useState<string>();

    const [htmlCtrlFocus, setHtmlCtrlFocus] = useState<boolean>(false)




    useEffect(() => {
        
        if (functionMap.UIEditSetting && functionMap.UIEditSetting?.InputCtrls) {
     
            var newInput: InputCtrlModel[] = ObjClone(functionMap.UIEditSetting.InputCtrls);
            FlowLineUtils.BindingDefaultValueforInputCtrlModel(newInput)

            
            if (value) {

                for (var i in newInput) {
                    var input = newInput[i]
                    var nvalue = value[input.NAME];
                    if (nvalue)
                        input.VALUE = nvalue

                    
                    if (input.TYPE === "LookupParam" && input.LookUpSetting && input.LookUpSetting.Inputs && input.LookUpSetting.Inputs.length > 0) {
                        for (var j in input.LookUpSetting.Inputs) {
                            var lookupInput = input.LookUpSetting.Inputs[j]
                            if (!lookupInput.VALUE)
                                lookupInput.VALUE = value[lookupInput.NAME];
                        }


                    }
                }

                   
            }

            setCloneInputParam(newInput);

            setRerendering(rerendering ? rerendering : Guid())

            onEvent("CtrlLoadEvent", newInput)
        }
    }, [functionMap, value, rerendering])


    const onEvent = async (eventKey: string | undefined, params?: InputCtrlModel[]) => {

        if (!params)
            params = cloneInputParam;
        if (onEventAction && eventKey) {
            var obj: any = {}

            if (params && params.length > 0) {
                for (var i in params) {
                    var param: InputCtrlModel = params[i]
                    if (!param.VALUE && (param.TYPE === "TextParam" || param.TYPE === "MultiTextParam" || param.TYPE === "PasswordParam" || param.TYPE === "LabelParam" || param.TYPE === "HtmlParam")) {
                        param.VALUE = "";
                    }
                    else if (!param.VALUE && param.TYPE === "BooleanParam") {
                        param.VALUE = false;
                    }
                }
            }
            obj["UI"] = ConvertKeyValueObjectToObject(ConvertInputCtrlModelToKeyValue(params))
            if (value)
                obj["Data"] = value["Data"];

            await onEventAction(eventKey, obj);
            if(eventKey !== "CtrlLoadEvent")
                Clear();
        }


    }

    const Clear = () => {

        if (functionMap.UIEditSetting && functionMap.UIEditSetting.AfterClerInputValue) {


            var newInput = ObjClone(functionMap.UIEditSetting.InputCtrls);

            setCloneInputParam(newInput);
            setRerendering(Guid())
        }
    }
    const toAbsoluteUrl = (pathname: string) => process.env.PUBLIC_URL + pathname
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };




    return (<Fragment>

        <div className={clsx(functionMap.UIEditSetting?.Orientation === "Vertical" ?
             "overflow-y-hidden" : "d-flex justify-content-between overflow-y-hidden")} >

            {innerRerendering && <InnerInputCtrl orientation={functionMap.UIEditSetting?.Orientation} isContextMenu={false} onEvent={onEvent} inputParams={cloneInputParam} ></InnerInputCtrl>}

            {cloneInputParam && cloneInputParam.findIndex(x => x.IsContextMenu) > -1 && <Fragment>
                <div className={clsx('d-flex justify-content-end mt-2 align-items-center', functionMap.UIEditSetting?.Orientation === "Vertical" ? "" : divCss)}>


                    <IconButton className='me-2' onClick={handleClick} >
                        <SVG src={toAbsoluteUrl(`/svgs/contextmenu.svg`)}

                            fill={FlowLineStyle.IConColor}
                            width={16} height={16}
                            title=" "
                        />
                    </IconButton>
                    <Menu

                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                    >
                        <div className='row ms-2 mb-2 me-2 w-500px'>

                            <InnerInputCtrl orientation={functionMap.UIEditSetting?.Orientation} isContextMenu={true} onEvent={onEvent} inputParams={cloneInputParam} ></InnerInputCtrl>
                        </div>
                    </Menu>


                </div>
            </Fragment>}

        </div>
    </Fragment>
    )
}

export default DynamicInputControl;