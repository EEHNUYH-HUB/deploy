import clsx from 'clsx';
import { ReactNode, useEffect, useMemo, useState } from 'react';

import { GetDynamicButtonCss, StringToChipColor, StringToChipVariant, StringToCss } from './ui.utils.js';
import { FlowLineStyle } from './flowline.style.js'
import { JsonViewer } from './ctrl.panel.json.js';
import { DateToStringShort, NumberToNumberStyle, RunJavascript, SetKeyValueforObj, StringKeyToValue } from "flowline_common_model/src/util.common"
import { CellConditionalItem, Conditional, KeyValue, MuiButtonStyle, OutputCtrlModel } from 'flowline_common_model/src/models';



import { FileDownloadLink, FileDownloadLink2, ImageView } from './ctrl.file.download.js'
import { Box, Checkbox, Chip, CircularProgress, LinearProgress, Typography, Tooltip, IconButton, Button, Stack, Link } from '@mui/material/index.js';
import { Download } from '@mui/icons-material';
import { MarkDownContentCtrl } from './ctrl.dynamic.chat.js';
import { IConCtrl } from './ctrl.icon.selector.js';
import { HtmlViewerCtrl } from './ctrl.editors.html.js';
import FlowLineUtils from './flowline.utils.js';
import LoadingButton from '@mui/lab/LoadingButton/index.js';
import { GetColors } from './color.selector.js';
import { useControlContext } from './ctx.control.js';


type Props = {
    outputSetting: OutputCtrlModel;
    item?: any;

    onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
    onGetCellSize?: Function
};
export const GetCellSize = (outputSetting: OutputCtrlModel, item: any) => {
    var rtn = { w: 0, h: 0 }
    if (item && outputSetting) {
        var cellSetting = outputSetting;
        if (outputSetting.COL_VALUE_TYPE === "ConditionalStyle" && outputSetting.COL_CONDITIONAL && outputSetting.COL_CONDITIONAL.length > 0) {
            var v = StringKeyToValue(outputSetting.COL_COLUMN_NAME, item);
            for (var i in outputSetting.COL_CONDITIONAL) {
                var condition = outputSetting.COL_CONDITIONAL[i]
                if (ValidConditional(condition, v)) {
                    cellSetting = condition.Style

                    break;
                }
            }

        }

        if (item) {
            if (cellSetting.COL_VALUE_TYPE !== "MulitLineStyle" && cellSetting.COL_COLUMN_NAME) {

                var v = StringKeyToValue(cellSetting.COL_COLUMN_NAME, item);


                if (v && cellSetting.COL_APPEND_TEXT && cellSetting.COL_APPEND_TEXT.indexOf("{value}") > -1) {
                    v = cellSetting.COL_APPEND_TEXT.replaceAll("{value}", v);
                }


                if (cellSetting.COL_VALUE_TYPE === "IConStyle") {

                    rtn.w = 20;
                    rtn.h = 20
                }
                else {

                    rtn.w = FlowLineStyle.CanvasContext2D?.measureText(v).width * 1.5;
                    rtn.h = 20

                }

            }
            else if (cellSetting.COL_VALUE_TYPE === "MulitLineStyle") {
                if (cellSetting.COL_MULTI_VALUE && cellSetting.COL_MULTI_VALUE.length > 0) {
                    var multiSize: { colindex: number, rowindex: number, w: number, h: number }[] = []
                    for (var i in cellSetting.COL_MULTI_VALUE) {
                        for (var j in cellSetting.COL_MULTI_VALUE[i]) {
                            var r = GetCellSize(cellSetting.COL_MULTI_VALUE[i][j], item)
                            if (r) {
                                multiSize.push({ colindex: parseInt(i), rowindex: parseInt(j), w: r.w, h: r.h })
                            }

                        }
                    }




                    const maxRowIndex = multiSize.reduce((max, item) => {
                        return item.rowindex > max ? item.rowindex : max;
                    }, -Infinity);
                    const maxColIndex = multiSize.reduce((max, item) => {
                        return item.colindex > max ? item.colindex : max;
                    }, -Infinity);


                    for (var k = 0; k <= maxColIndex; k++) {
                        var cols = multiSize.filter(x => x.colindex === k);
                        const maxW = cols.reduce((max, item) => {
                            return item.w > max ? item.w : max;
                        }, -Infinity);
                        rtn.w += maxW;

                    }

                    rtn.h = (maxRowIndex + 1) * 20


                }
            }
        }

        return rtn;
    }
}
const ValidConditional = (item: CellConditionalItem, v: any) => {
    if (!item.AndOr) {
        item.AndOr = "&&";
    }
    var setting: Conditional = { Settings: [item] };
    FlowLineUtils.BindingValueConditionalUsedByClient(setting)
    var strStaticColumn = item.Column?.replaceAll(".", "_").replaceAll("-", "_");

    if (setting.StrValue) {
        var functionStr = `if(${setting.StrValue}) return true; else return false;`;

        var r = RunJavascript([{ key: strStaticColumn, value: v }], functionStr);
        
        return r;
    }
    else {
        return true;
    }


}

const GetOnlyNum = (v?: any) => {
    if (v) {

        var rtn = Math.round(v * 100) / 100


        return rtn;
    }
    else {
        return 0
    }
}
function ExtractNumber(input:any) {
    // 정규식으로 숫자만 추출
    const match = input?.toString().match(/\d+/);
    
    // 숫자가 있으면 반환, 없으면 0 반환
    return match ? parseInt(match[0], 10) : 0;
  }
type ArrProgessValue ={
value:number
color:'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
}

const CellCtrl = ({ outputSetting, item, onEventAction }: Props) => {

    const [value, setValue] = useState<any>();
    const [isArryValue, setIsArryValue] = useState<boolean>(false)
    const ctrlContext= useControlContext()
    const [iconValue, setIconValue] = useState<string>();
    const [url,setUrl] = useState<string>();
    const [textValue, setTextValue] = useState<any>();
    const [progressColor, setProgressColor] = useState<'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'>();
    const [cellSetting, setCellSetting] = useState<OutputCtrlModel>();
    const [className, setClassName] = useState<string>();
    const [multiCellSize, setMultiCellSize] = useState<{ rowindex: number, colindex: number, w: number, h: number }[]>([]);
    const [btnCss, setBtnCss] = useState<MuiButtonStyle>();

    useEffect(() => {




        if (item && outputSetting) {

            if (outputSetting.COL_VALUE_TYPE === "ConditionalStyle" && outputSetting.COL_CONDITIONAL && outputSetting.COL_CONDITIONAL.length > 0) {
                var v = StringKeyToValue(outputSetting.COL_COLUMN_NAME, item);
                for (var i in outputSetting.COL_CONDITIONAL) {
                    var condition = outputSetting.COL_CONDITIONAL[i]
                    if (ValidConditional(condition, v)) {
                        setCellSetting(condition.Style)

                        break;
                    }
                }

            }
            else {

                setCellSetting(outputSetting)
            }
        }


    }, [item, outputSetting])

    useEffect(() => {

        setMultiCellSize([])
        if (cellSetting) {

            if (item && cellSetting.COL_VALUE_TYPE !== "MulitLineStyle") {


                if (cellSetting.ButtonStyle) {
                    var css = GetDynamicButtonCss(cellSetting.ButtonStyle?.COL_BUTTON_COLOR);

                    setBtnCss(css);
                }

                if(cellSetting.COL_URL_KEY){
                    var urlValue = StringKeyToValue(cellSetting.COL_URL_KEY, item);
                    
                    if(urlValue){
                        var index = urlValue.toString().toLowerCase().trim().indexOf("http")
                        if(index != 0){
                            urlValue = "https://"+urlValue
                        }
                        setUrl(urlValue)
                    }
                    
                }
                if (cellSetting.COL_COLUMN_NAME) {

                    
                    var v = StringKeyToValue(cellSetting.COL_COLUMN_NAME, item);

                    
                    var isArry = v?.constructor === Array;

                    setIsArryValue(isArry)
                        

                    var textv = v;

                    if (v) {





                        if (cellSetting.COL_VALUE_TYPE === "NumberStyle") {
                            v = textv = NumberToNumberStyle(v)
                        }
                        else if (cellSetting.COL_VALUE_TYPE === "DateStyle") {
                            v = textv = DateToStringShort(v)
                        }
                        else if (cellSetting.COL_VALUE_TYPE === "IConStyle") {
                            var findValue = v;
                            if (cellSetting.COL_ICONS && cellSetting.COL_ICONS.length > 0) {
                                var fObj = cellSetting.COL_ICONS.find(x => x.key?.toString().toLowerCase() === v.toString().toLowerCase())
                                if (fObj && fObj.value) {
                                    findValue = fObj.value;
                                }
                                else {
                                    var fObj = cellSetting.COL_ICONS.find(x => v.toString().toLowerCase().includes(x.key?.toString().toLowerCase()))
                                    if (fObj && fObj.value) {
                                        findValue = fObj.value;
                                    }
                                }
                            }

                            setIconValue(findValue)


                        }

                        if (cellSetting.COL_VALUE_TYPE === "ProgressCircleStyle" || cellSetting.COL_VALUE_TYPE === "ProgressLineStyle") {
                            if(!isArry){
                                
                                var floatValue = parseFloat(v);

                                if (floatValue <= 25) {
                                    setProgressColor("error")
                                }
                                else if (floatValue <= 45) {
                                    setProgressColor("warning")
                                }
                                else if (floatValue <= 55) {
                                    setProgressColor("success")
                                }
                                else if (floatValue <= 75) {
                                    setProgressColor("info")
                                }
                                else {
                                    setProgressColor("primary")
                                }
    
                            }
                            
                        }

                        if (cellSetting.COL_APPEND_TEXT && cellSetting.COL_APPEND_TEXT.indexOf("{value}") > -1) {
                            textv = cellSetting.COL_APPEND_TEXT.replaceAll("{value}", v);
                        }


                    }
                    
                    setValue(v)


                    setTextValue(textv);
                }
                else if(cellSetting.COL_APPEND_TEXT){
                    setTextValue(cellSetting.COL_APPEND_TEXT);
                }

            }

            setClassName(cellSetting.COL_CLASSNAME)
        }
        


    }, [item, cellSetting])





    return (
        <>

            {cellSetting && (url ||value || cellSetting.COL_VALUE_TYPE === "CheckBoxStyle" || cellSetting.COL_VALUE_TYPE === "ButtonStyle") &&
                <>
                    {cellSetting.COL_VALUE_TYPE === "BoldStyle" &&
                        <div className={clsx(className, 'fw-bold  d-block fs-7')} style={{ color: FlowLineStyle.GridTitleColor }} >{textValue}</div>}
                    {cellSetting.COL_VALUE_TYPE === "BoldStyleNoWrap" &&
                        <div className={clsx(className, 'fw-bold text-nowrap  d-block fs-7',)} style={{ color: FlowLineStyle.GridTitleColor }} >{textValue}</div>}
                    {(cellSetting.COL_VALUE_TYPE === "DefaultStyle" || !cellSetting.COL_VALUE_TYPE) &&
                        <div className={clsx(className, ' d-block fs-7')} style={{ color: FlowLineStyle.GridSubColor }}>
                            {textValue.toString()}
                        </div>}

                    {cellSetting.COL_VALUE_TYPE === "SubStyle" &&
                        <div className={clsx(className, 'text-nowrap  fs-7')} style={{ color: FlowLineStyle.GridSubColor }}>
                            {textValue.toString()}
                        </div>}
                        {cellSetting.COL_VALUE_TYPE === "LinkStyle" && 
                    <div className={clsx(className, 'text-nowrap  fs-7')} style={{ color: FlowLineStyle.GridSubColor }}>
                        <Link href={url ? url : "#"} target="_blank"  underline="hover">
                            {textValue?textValue:url}
                        </Link>
                    </div>
                    }
                    {(cellSetting.COL_VALUE_TYPE === "SimbolStyle" || cellSetting.COL_VALUE_TYPE === "SymbolStyle"  ) &&
                        <div className={clsx('symbol symbol-35px me-2', className)}>
                            {textValue &&
                                <span className={StringToCss(textValue)}>{(textValue as string).toString().substring(0, 2)}</span>}
                        </div>
                    }
                       
                    {cellSetting.COL_VALUE_TYPE === "CheckBoxStyle" &&
                        <div className={clsx(className, 'symbol symbol-35px me-2')}>
                            <Checkbox size="small" checked={value ? true : false} onChange={async (e, c) => {

                                SetKeyValueforObj(cellSetting.COL_COLUMN_NAME, c, item)
                                setValue(c)

                                if (onEventAction)
                                    await onEventAction(cellSetting.EventKey, item)
                            }} />
                        </div>

                    }
                    {cellSetting.COL_VALUE_TYPE === "ButtonStyle" && cellSetting.ButtonStyle &&

                        <div className='d-flex justify-content-end w-100'>
                            <LoadingButton

                                loadingPosition={cellSetting.ButtonStyle.COL_ICON ? "end" : undefined}
                                endIcon={cellSetting.ButtonStyle.COL_ICON ? <IConCtrl type={cellSetting.ButtonStyle.COL_ICON} size={16} /> : undefined}
                                variant={btnCss?.variant}
                                color={btnCss?.color} className="h-25px w-120px" size="small" onClick={async () => {
                                    if (onEventAction) {
                                        if (!cellSetting.ButtonStyle?.COL_CONFIRM_MESSAGE) {
                                            await onEventAction(cellSetting.EventKey, item)
                                        }
                                        else {
                                            ctrlContext.confirm("",cellSetting.ButtonStyle?.COL_CONFIRM_MESSAGE,async ()=>{
                                                await onEventAction(cellSetting.EventKey, item)
                                            })
                                        }
                                    }
                                    
                                }} >
                                {textValue ? textValue : cellSetting.ButtonStyle.COL_BUTTON_NAME}
                            </LoadingButton>
                        </div>
                    }
                    {cellSetting.COL_VALUE_TYPE === "DateStyle" &&
                        <span className={clsx(className, 'text-truncate   d-block fs-7 ')} style={{ color: FlowLineStyle.GridSubColor }}>{textValue}</span>}
                    {cellSetting.COL_VALUE_TYPE === "NumberStyle" &&
                        <span className={clsx(className, 'text-truncate   d-block fs-7 ')} style={{ color: FlowLineStyle.GridSubColor }}>{textValue}</span>}
                    {cellSetting.COL_VALUE_TYPE === "BadgeStyle" && !isArryValue &&
                        <Chip label={textValue.toString()} className='h-20px' size='small' color={StringToChipColor(value)} variant={StringToChipVariant(value)} />
                    }
                    {cellSetting.COL_VALUE_TYPE === "BadgeStyle" && isArryValue &&

                        <Stack direction="row" spacing={1}>


                            {value && value.map((tag: string, rindex: number) => {


                                return (

                                    <Chip key={`cellValueChipIndex${rindex}`} label={tag} className='h-20px' size='small' />
                                )


                            })}


                        </Stack>

                    }
                    {iconValue && cellSetting.COL_VALUE_TYPE === "IConStyle" && <IConCtrl type={iconValue} size={16} />}
                    {cellSetting.COL_VALUE_TYPE === "ProgressLineStyle" && !isArryValue  &&

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={GetOnlyNum(value)} color={progressColor} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'text.secondary' }}
                                >{textValue}</Typography>
                            </Box>
                        </Box>

                    } 
                    {cellSetting.COL_VALUE_TYPE === "ProgressLineStyle" && isArryValue  &&

                        <MultiValueProgress values={value}  />

                    }
                    {cellSetting.COL_VALUE_TYPE === "ProgressCircleStyle" &&
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                            <CircularProgress variant="determinate" value={GetOnlyNum(value)} color={progressColor} />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    component="div"
                                    sx={{ color: 'text.secondary' }}
                                >{textValue}</Typography>
                            </Box>
                        </Box>


                    }

                    {cellSetting.COL_VALUE_TYPE === "JSONStyle" && <JsonViewer value={value} />}
                    {cellSetting.COL_VALUE_TYPE === "MarkdownStyle" && <MarkDownContentCtrl supportCopyBtn={true} supportHtml={true} msg={value} />}
                    {cellSetting.COL_VALUE_TYPE === "HtmlStyle" && <HtmlViewerCtrl className={className} content={value} />}
                
                    {cellSetting.COL_VALUE_TYPE === "FileDownLoadStyle" && <FileDownloadLink2 className={clsx(className)} path={value} >
                        <Tooltip title={value.toString()} placement='right'>
                            <IconButton aria-label="filter" size='small'  >

                                <Download sx={{ color: FlowLineStyle.GridSubColor, width: 16, height: 16 }} />


                            </IconButton>
                        </Tooltip>
                    </FileDownloadLink2>
                    }
                    {cellSetting.COL_VALUE_TYPE === "SymbolImageStyle" && <ImageView  path={value} />}
                    {cellSetting.COL_VALUE_TYPE === "ImageViewStyle" && <ImageView className={clsx(className)} style={{ width: "100%"}} path={value} />}
                </>}
            {cellSetting && cellSetting.COL_VALUE_TYPE === "MulitLineStyle" && cellSetting.COL_MULTI_VALUE &&
                <div className={clsx(className, 'd-flex align-items-center')}>
                    {cellSetting.COL_MULTI_VALUE?.map((rows, cindex) => {
                        return (

                            <div key={`outputCol${cindex}`} className='me-1 '>
                                {rows && rows?.map((childOutputSetting, rindex) => {
                                    multiCellSize.push({ colindex: cindex, rowindex: rindex, w: -1, h: -1 })
                                    return (

                                        <CellCtrl key={`rowindex${rindex}`} outputSetting={childOutputSetting} onEventAction={onEventAction} item={item} ></CellCtrl>

                                    )
                                })}
                            </div>
                        )
                    })}
                </div>}
        </>
    );
};

const MultiValueProgress = ({values}:{ values:[] }) => {
    const [max,setMax] = useState<number>()
    const [colorArry] = useState(GetColors('brown'))
    const [data,setData] = useState<KeyValue[]>();
    useEffect(()=>{

        var total = 0 ;
        var arry = []
        for(var i in values){
            var val = values[i];

            var num = ExtractNumber(val);

            total += num;
            arry.push({key:num,value:val});    
        }
        
        setData(arry)
        setMax(total)
    },[values])
    return (
        <div  className="progress w-100px">
            {max && data && data.map((item: KeyValue, index: number) => (
                <Tooltip key={`progressKey_${index}`} title={item?.value?.toString()} placement='right'>
                    <div className="progress-bar " role="progressbar"

                        style={{ width: `${(item.key / max) * 100}%`, backgroundColor: colorArry[index], fontSize: FlowLineStyle.FontSize, color: "#424242" }} >{item.key}</div>
                </Tooltip>
            ))}
        </div>
    );
  };
  
  
export default CellCtrl;
