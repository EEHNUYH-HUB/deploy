
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { forwardRef, Fragment, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { DynamicEditProps, DynamicViewProps } from "./ui.models.js"
import { useAppContext } from './ctx.app.js';
import { GetBaseUrl, isHTMLString, ReactNodeToString, StringToCss } from './ui.utils.js';

import FlowLineUtils from './flowline.utils.js';
import DynamicInputControl from './ctrl.dynamic.editor.js';
import { DateToStringShort, Guid, ConvertToTextOnlyValue, StringKeyToJsonModel, StringKeyToValue } from 'flowline_common_model/result/util.common'
import { Dictionary, FlowRunEntity, InputCtrlModel, KeyValue } from 'flowline_common_model/result/models'


//import "highlight.js/styles/a11y-dark.css";
import "highlight.js/styles/a11y-light.css";
//import "highlight.js/styles/rainbow.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from "rehype-highlight";


import { CopyToClipboard } from 'react-copy-to-clipboard';
import { MdContentCopy, MdOutlineDownloading } from 'react-icons/md';
import { FlowLineStyle } from './flowline.style.js';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';

import { CommonContainerCtrl } from './ctrl.dynamic.common.js';
import { HtmlViewerCtrl } from './ctrl.editors.html.js';
import { useFuncMapContext } from './ctx.function.map.js';
import { blue } from '@mui/material/colors';
import { useControlContext } from './ctx.control.js';

const CopyButton = ({ children }: { children: ReactNode }) => {
    //const code = React.Children.map(children as React.ReactChild, child => (typeof child === 'string' ? child : ''))?.join('');

    const [code, setCode] = useState<string>()
    useEffect(() => {
        setCode(ReactNodeToString(children))
    }, [children])

 
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
    };
    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
    return (
        <>
            {code ?
                <div style={{ position: 'relative' }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}

                >
                    <CopyToClipboard text={code} onCopy={handleCopy}>
                        <Button style={{ position: 'absolute', right: 0, top: 0 }} size='small' variant='contained' color={isCopied ? "warning" : "info"}>
                            {isCopied ? <MdOutlineDownloading /> : <MdContentCopy />}
                        </Button>
                    </CopyToClipboard>
                </div>
                : <></>}
        </>
    );
};



export const MarkDownContentCtrl = ({ msg, bgCss, widthCss = "mw-xl-800px", appendCtrl ,supportHtml=true,supportCopyBtn=true,fontSize}
    : {fontSize?:string, msg?: string, bgCss?: string, widthCss?: string, appendCtrl?: JSX.Element,supportHtml:boolean,supportCopyBtn:boolean }) => {

    
    const ConvertDownloadUrl = (src?: string) => {
        if (typeof src === 'string') {
            let lower = src.toLowerCase();
            if (!lower.includes('http')) {
                src = `${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}${checkFirstCharacter(src) ? "" : "/"}${src}`;
            }
        }

        return src;
    }
    function checkFirstCharacter(str: string) {
        if (str.length === 0) {
            return false; // 문자열이 비어있는 경우 false 반환
        }

        const firstChar = str.charAt(0);
        return firstChar === '\\' || firstChar === '/';
    }

    return (

        <div
            style={{ whiteSpace: '', color: FlowLineStyle.FontColor, fontSize: fontSize?fontSize:FlowLineStyle.TreeFontSize,fontFamily:FlowLineStyle.FontFamily }}
            className={clsx('rounded text-start align-items-center absolute-center', bgCss, widthCss)}
        >
            {msg &&
                <ReactMarkdown
                    className=""
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    components={{
                        pre({ node, ...props }) {
                            return <pre {...props} className="mt-2 rounded" />;
                        },
                        code({ node, className, children, ...props }) {
                            var content = undefined
                            var isHtml = false
                            if(supportHtml){
                                content = ReactNodeToString(children)
                                isHtml = isHTMLString(content)
                            }
                            return (
                                <Fragment>
                                    {supportCopyBtn &&
                                     <CopyButton>{children}</CopyButton> }
                                  
                                    
                                    {(isHtml &&content )?
                                    <HtmlViewerCtrl  className={clsx(className,'p-4 mt-6')} content={content} /> :
                                    <code 
                                    
                                    className={clsx(className, 'bg-light')} 
                                    style={{ fontSize: fontSize?fontSize:FlowLineStyle.TreeFontSize,fontFamily:FlowLineStyle.FontFamily, color: FlowLineStyle.FontColor, textShadow: "none" }} {...props}>
                                        {children}
                                    </code>
                                    }
                                </Fragment>
                            );
                        },
                        p: ({ node, ...props })=> { return ( <div className='my-2'><span  {...props} /></div>)},
                        a: ({ node, ...props }) => { return (<a style={{ margin: 0 }} {...props} href={ConvertDownloadUrl(props.href)} />)},
                        h1: ({ node, ...props }) => { return (<h1 style={{ margin: 0 }} {...props}  />)},
                        h2: ({ node, ...props }) => { return (<h2 style={{ margin: 0 }} {...props}  />)},
                        h3: ({ node, ...props }) => { return (<h3 style={{ margin: 0 }} {...props}  />)},
                        h4: ({ node, ...props }) => { return (<h4 style={{ margin: 0 }} {...props}  />)},
                        h5: ({ node, ...props }) => { return (<h5 style={{ margin: 0 }} {...props}  />)},
                        h6: ({ node, ...props }) => { return (<h6 style={{ margin: 0 }} {...props}  />)},
                                                   

                        img: ({ node, ...props }) => {
                            return (<img style={{ maxWidth: '100%' }} {...props} />)},
                            table: ({ node, ...props }) => {
                                return (<table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4' style={{ maxWidth: '100%' }} {...props} />)},

                    }}
                >
                    {msg}
                </ReactMarkdown>
            }

            {appendCtrl}
        </div>
    )
}


export type MessageItemProps = {
    Name?: string,

    Message: string,
    RegDate: string,
    Type: 'in' | 'out',
    Result: any | undefined

}
export class TypingModel {
    Interval?: any;
    Message?: string;
    ProgressCount: number;
    EndHandler?: Function;

    constructor() {
        this.ProgressCount = 0;
    }

}
const TypingInstance: Dictionary<TypingModel> = {}

export const MessageItemCtrl = ({ message, appendCtrl, widthCss,fontSize,supportCopyBtn,supportHtml }: { widthCss?: string, message?: MessageItemProps, appendCtrl?: JSX.Element,fontSize?:string ,supportHtml:boolean,supportCopyBtn:boolean}) => {

    const [regDate, setRegDate] = useState<string>();
    const [strMessage, setStrMessage] = useState<string>();
    const [usrName, setUserName] = useState<string>();

    const [msgType, setMsgType] = useState<'in' | 'out'>();

    const [contentClass, setContentClass] = useState<string>();
    useEffect(() => {
        if (message) {
            Load(message)
        }
    }, [message])

    const Load = (msg: MessageItemProps) => {
    
        if (msg) {
            if (msg.RegDate)
                setRegDate(msg.RegDate)


            setUserName(msg.Name)
            setStrMessage(msg.Message)
            setContentClass(`${'d-flex'} justify-content-${msg.Type === 'out' ? 'start' : 'end'} mb-10`);
            setMsgType(msg.Type)
        }
    
    }


    return (
        <div className={clsx('d-flex', contentClass)} >
            {strMessage &&
                <div className={clsx('d-flex flex-column align-items', `align-items-${msgType === 'out' ? 'start' : 'end'}`)}>
                    <div className='d-flex align-items-center mb-2'>


                        <div >
                            {msgType === 'out' && usrName &&
                                <span className='fs-7 fw-bolder me-1' style={{ color: FlowLineStyle.GridTitleColor }}>
                                    {usrName}
                                </span>}
                            <span className='fs-7 mb-1' style={{ color: FlowLineStyle.GridSubColor, fontSize: '0.8rem', marginLeft: (msgType === 'out' && usrName) ? '5px' : '' }}>
                                {regDate}
                            </span>
                        </div>

                    </div>
                    <MarkDownContentCtrl fontSize={fontSize} supportCopyBtn={supportCopyBtn} supportHtml={supportHtml} bgCss={msgType === 'in' ? 'bg-light p-5' : ''} widthCss={widthCss} msg={strMessage} appendCtrl={appendCtrl}></MarkDownContentCtrl>

                </div>
            }
        </div>
    )
}

export const MessageTypingItemCtrl = ({ connectionID, bgCss, widthCss,fontSize, onResult, onInput }: { bgCss?: string, widthCss?: string, connectionID: string,fontSize?:string, onResult: (result: any, actionID: string, actionName: string) => void, onInput?: Function }) => {


    const [strMessage, setStrMessage] = useState<string>();

    const [stateMsg, setStateMsg] = useState<string>();
    const ctrlContext = useControlContext()
    const appContext = useAppContext();

    useEffect(() => {
        Init();

        return (() => {
            if (connectionID)
                appContext.flowLineSocketClient?.RemoveReceivedMessage(connectionID)
        })
    }, [connectionID])
    const Init = () => {
        if (connectionID) {
            var progressMsg = "";
            var streamEndResult = "";
            var errorMsg= "";
            appContext.flowLineSocketClient?.AddReceivedMessage(connectionID, (resType, id, name, resMessage, typingEndEvent) => {

                if (resType === "res_result") {
                    setStateMsg(undefined)
                    streamEndResult = resMessage;
                }
                else if(resType === "res_err"){
                    errorMsg += resMessage;
                }
                else if (resType === "res_close") {
                    if(errorMsg)
                        ctrlContext.messageCtrl(errorMsg,"error");
                    errorMsg = ""

                    setStateMsg(undefined)
                    End(() => {
                        progressMsg = ""

                        onResult(streamEndResult, id, name)

                        if (typingEndEvent) {
                            typingEndEvent();
                        }
                    })


                }
                else if (resType === "req_input") {
                    if (onInput) {
                        onInput(resMessage)
                    }
                }
                else if (resType === "res_stream") {
                    streamEndResult = "";
                    progressMsg += resMessage
                    RunTyping(progressMsg)
                }
                else if (resType === "res_state") {

                    setStateMsg(resMessage)
                }

            });
        }
    }


    const End = (completedHandler: Function) => {

        var model = TypingInstance[connectionID];
        if (model) {
            model.EndHandler = completedHandler;
        }
        else {
            completedHandler();
        }

    }
    const RunTyping = (msg: string) => {


        var model = TypingInstance[connectionID];

        if (!model || !model.Interval) {
            TypingInstance[connectionID] = new TypingModel()
            model = TypingInstance[connectionID];
            model.Interval = setInterval(() => {
                TypingMessage(model)
            }, 30);
        }
        else {
            model.Message = msg;
        }


    }

    const TypingMessage = (model: TypingModel) => {

        if (model.Message && model.ProgressCount < model.Message.length) {
            let result = model.Message.substring(0, model.ProgressCount);


            var index = Math.ceil(model.ProgressCount / 100);
            if (index <= 0) {
                index = 1
            }
            model.ProgressCount = model.ProgressCount + index;

            bottomScroll("div" + connectionID);
            setStrMessage(result)
        }
        else if (model.EndHandler) {

            clearInterval(model.Interval)
            model.Interval = undefined;
            model.Message = "";
            model.ProgressCount = 0;
            model.EndHandler();
            setStrMessage('');
        }


    }

    return (

        <div id={"div" + connectionID} className={clsx('d-flex', 'justify-content-start')} >

            <div className={clsx('d-flex flex-column align-items', 'align-items-start')}>
                {strMessage && <MarkDownContentCtrl fontSize={fontSize} msg={strMessage} widthCss={widthCss} bgCss={bgCss}
                 supportCopyBtn={false} supportHtml={false} ></MarkDownContentCtrl>}

                {stateMsg &&
                    <div className='d-flex align-items-center mb-2 ' style={{ opacity: 0.5 }} >
                        <CircularProgress color="info" size={16} />

                        <div
                            style={{ whiteSpace: 'text-wrap', color: FlowLineStyle.FontColor, fontSize: FlowLineStyle.TreeFontSize }}
                            className={clsx('ps-4 rounded text-start align-items-center absolute-center', bgCss, widthCss)}
                        >    {stateMsg}
                        </div>
                    </div>
                }




            </div>
        </div>


    )
}


export const bottomScroll = (divID: string) => {

    var chatElement = document.getElementById(divID);

    if (chatElement) {
        chatElement.scrollIntoView({
            behavior: 'smooth', // 부드러운 스크롤
            block: 'end',     // 요소를 뷰포트의 하단에 정렬
            inline: 'nearest'   // 수평 정렬은 가장 가까운 위치에
        });
    }

}

const DynamicChatControl = (props: DynamicViewProps & { connectionID: string }) => {

    const { onEventAction, functionMap, pageBorder,controlHeight, value, connectionID } = props;
    const [messages, setMessages] = useState<MessageItemProps[]>(new Array<MessageItemProps>());
    const [strHeight, setStrHeight] = useState<string>();
    const [defaultName, setDefaultName] = useState<string>();
    const funcMapContext = useFuncMapContext();

    useEffect(() => {
        setMessages(new Array<MessageItemProps>())
    }, [functionMap])

    useEffect(() => {
        if (pageBorder) {

            var str = pageBorder.strHeight;
            if (str && functionMap.UIViewSetting?.ChatSubtractHeight && functionMap.UIViewSetting.ChatSubtractHeight > 0) {
                str = `calc(${pageBorder.strHeight} - ${functionMap.UIViewSetting?.ChatSubtractHeight}px)`
            }

            setStrHeight(str)
        }

    }, [pageBorder])

    useEffect(() => {
        
        
        if (value) {
            var valueArry: any[];

            if (value.constructor === Array) {
                valueArry = value;
            }
            else {
                valueArry = [value];
            }
            for (var i in valueArry) {
                var newValue = valueArry[i]
                var inputMsg = undefined;
                var outputMsg = undefined;
                var outputName = undefined;
                var inputRegdate= undefined
                var outputRegdate = undefined;
                var ps = Object.getOwnPropertyNames(newValue);
                
                
                var maxLen =0
                
                for(var j in ps){
                    var pName = ps[j]
                    if (pName !== "Data" && pName !== "UI") {
                        if (newValue[pName]?.constructor === Array) {
                            if (maxLen < newValue[pName].length) {
                                maxLen = newValue[pName].length
                            }

                            
                        }
                    }
                }
                
                if(maxLen > 0){
                    for (var k = 0; k < maxLen; k++) {
                        var obj: any = {}

                        for (var j in ps) {
                            var pName = ps[j]
                            if (pName !== "Data" && pName !== "UI") {
                                if (newValue[pName].constructor === Array) {
                                    var arrObj: any[] = newValue[pName];
                                    if (arrObj.length > k)
                                        obj[pName] = arrObj[k]
                                    else
                                        obj[pName] = undefined;
                                }
                                else {
                                    obj[pName] = newValue[pName];
                                }
                            }

                        }

                        if (functionMap.UIViewSetting?.ChatInputMessageID)
                            inputMsg = StringKeyToValue(functionMap.UIViewSetting?.ChatInputMessageID, obj)
                        if (functionMap.UIViewSetting?.ChatOutputMessageID)
                            outputMsg = StringKeyToValue(functionMap.UIViewSetting?.ChatOutputMessageID, obj)
                        if (functionMap.UIViewSetting?.ChatOutputNameID)
                            outputName = StringKeyToValue(functionMap.UIViewSetting?.ChatOutputNameID, obj)
                        if (functionMap.UIViewSetting?.ChatInputRegdateID)
                            inputRegdate = StringKeyToValue(functionMap.UIViewSetting?.ChatInputRegdateID, obj)
                        if (functionMap.UIViewSetting?.ChatOutputRegdateID)
                            outputRegdate = StringKeyToValue(functionMap.UIViewSetting?.ChatOutputRegdateID, obj)
                        
                        if (inputMsg) {
                            WriteMessage(inputMsg, 'in', undefined, undefined,inputRegdate);
                        }
                        WriteMessage(outputMsg, 'out', obj, outputName ? outputName : defaultName,outputRegdate);
                    }
                }
                else{
                   
                    if (functionMap.UIViewSetting?.ChatOutputMessageID)
                        outputMsg = StringKeyToValue(functionMap.UIViewSetting?.ChatOutputMessageID, newValue)
                    if (functionMap.UIViewSetting?.ChatOutputNameID)
                        outputName = StringKeyToValue(functionMap.UIViewSetting?.ChatOutputNameID, newValue)

                    
                    WriteMessage(outputMsg, 'out', newValue, outputName ? outputName : defaultName,undefined);
                }
               
                
            }
            bottomScroll("div" + connectionID)
        }
    
    }, [value])


    const WriteMessage = (msg: string, type: 'in' | 'out', result: any | undefined, name: string|undefined,date:any|undefined) => {
        
        const newMessage: MessageItemProps = { 
            Name: name?.toString()
            , Type: type
            , Message: msg?.toString()
            ,  RegDate: date?date?.toString():DateToStringShort(new Date())
            , Result: result };

            
        setMessages((bufferMessages) => [...bufferMessages, newMessage]);
    };

    return (
        <div className={clsx('d-flex  flex-wrap h-100')}   >
            {connectionID && <>
                <div className="scroll-y mt-4 align-self-stretch w-100"
                    style={{ height: strHeight }} >
                    {messages && messages?.map((message, index) => {
                        return (
                            <MessageItemCtrl supportCopyBtn={true} supportHtml={true} key={`message${index}`} message={message} fontSize={functionMap.UIViewSetting?.ChatFontSize}
                                appendCtrl={message.Result ?
                                    <CommonContainerCtrl value={message.Result} onEventAction={onEventAction}
                                        outputCtrls={functionMap.UIViewSetting ? functionMap.UIViewSetting.OutputCtrls : []} />
                                    : undefined} />
                        );
                    })}

                    <MessageTypingItemCtrl connectionID={connectionID}
                    fontSize={functionMap.UIViewSetting?.ChatFontSize}
                        onInput={(data: any) => {
                            funcMapContext?.setChatLoading(true);
                            var msg;
                            
                            if (functionMap.UIViewSetting?.ChatInputMessageID) {
                                msg = StringKeyToValue(functionMap.UIViewSetting?.ChatInputMessageID, data)
                            }
                            if (msg) {
                                WriteMessage(msg, 'in', undefined, undefined,undefined);

                                bottomScroll("div" + connectionID);
                            }
                        }}
                        onResult={(result: any, actionID: string, actionName: string) => {
                            setDefaultName(actionName)
                            
                            funcMapContext?.setChatLoading(false);
                        }} />

                </div>
            </>}

        </div>//d-flex align-items-end flex-column
    )
};


export default DynamicChatControl;