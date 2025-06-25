import ReactQuill,{Quill} from "react-quill";

import 'react-quill/dist/quill.snow.css';

import { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import dompurify from "dompurify";
import clsx from "clsx";
import { isHTMLString, ReactNodeToString } from "./ui.utils.js";
import { FlowLineStyle } from "./flowline.style.js";



const colors = ["red","green","blue","orange","violet"]
const formats = [
    [
        {
            className:"ql-font",
            options:['serif','monospace']
        },
        {
            className:"ql-size",
            options:["small","large","huge"]
        }
    ],
    [
        {className:"ql-bold"},{className:"ql-italic"},{className:"ql-underline"},{className:"ql-strike"}
    ],
    [
        {
            className:"ql-color"
            ,options:colors
        },
        {
            className:"ql-background"
            ,options:colors
        }
    ],
    [
        {
            className:"ql-script",
            value:"sub"
        },
        {
            className:"ql-script",
            value:"super"
        }
    ],
    [
        {
            className:"ql-header",
            value:"1"
        },
        {
            className:"ql-header",
            value:"2"
        },
        {
            className:"ql-blockquote"
        },
        {
            className:"ql-code-block"
        }
    ],
    [
        {
            className:"ql-list",
            value:"ordered"
        },
        {
            className:"ql-list",
            value:"bullet"
        },
        {
            className:"ql-indent",
            value:"-1"
        },
        {
            className:"ql-indent",
            value:"+1"
        }
    ],
    [
        {
            className:'ql-direction',
            value:'rtl'
        },
        {
            className:'ql-align',
            options:['right','center','justify']
        }
    ],
    [
        {className:'ql-link'},{className:'ql-image'},{className:'ql-video'},{className:'ql-formula'}
    ],

]

const ReactModule = () => {

    return (
        <>
            <div className="ql-formats">
                <select className="ql-header" defaultValue="7">
                    <option value="1">Header 1</option>
                    <option value="2">Header 2</option>
                    <option value="3">Header 3</option>
                    <option value="4">Header 4</option>
                    <option value="5">Header 5</option>
                    <option value="6">Header 6</option>
                    <option value="7">Normal</option>
                </select>
                <select className="ql-size" defaultValue="medium">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="huge">Huge</option>
                </select>
                <select className="ql-font" defaultValue="sans-serif" />
            </div>
            <div className="ql-formats">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-strike" />
                <button className="ql-blockquote" />
            </div>

            <div className="ql-formats">
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
                <button className="ql-indent" value="-1" />
                <button className="ql-indent" value="+1" />
            </div>
            <div className="ql-formats">
                <select className="ql-color" />
                <select className="ql-background" />
                <select className="ql-align" />
            </div>
            <div className="ql-formats">
                <button className="ql-code-block" />
                <button className="ql-link" />
                <button className="ql-image" />
            </div>
           
        </>
    )
}
const renderOptions = ({className,options}:{className?:string,options:string[]})=>{
    
    return (
        <select className = {className}>
            <option selected></option>
            {
                options.map(value =>{
                    return (
                        <option value={value}></option>
                    )
                })
            }
        </select>
    )
}
const renderSingle = ({className,value}:{className?:string,value?:string})=>{
    
    return (
        <button className = {className} value = {value}></button>
    )
}
const CustomToolbar = () => (
    <div id="toolbar">
        {
            formats.map(classes => {
                return (
                    <span className = "ql-formats">
                        {
                            classes.map((item:any,index) => {
                                return item.options?renderOptions(item):renderSingle(item)
                            })
                        }
                    </span>
                )
            })
        }
    </div>
  )



export const HtmlEditorCtrl =({displayName,columnName,value,onChanged,onFocus,onBlur}:{onFocus?:Function,onBlur?:Function,columnName?:string,displayName?:string,value?:string,onChanged?:Function})=>{
    const [content, setContent] = useState<string>(value?value:"");
    const formats = [
        'font','size',
        'bold','italic','underline','strike',
        'color','background',
        'script',
        'header','blockquote','code-block',
        'indent','list',
        'direction','align',
        'link','image','video','formula',
      ]
    const modules:{} = useMemo(() => ({
        toolbar: {
            container: "#toolBar"
        }
    }), []);
    
    return (
        <div>
            <div id="toolBar">
                <ReactModule />
            </div>
            <ReactQuill 
            onFocus={()=>{
                if(onFocus)onFocus();
            
            }}
            onBlur={()=>{
                if(onBlur)onBlur();
            
            }}
            theme="snow" modules={modules} formats={formats}
                value={content} 
                
                
                onChange={(v: string) => {
                    setContent(v)

                    if (onChanged) {
                        onChanged(v)
                    }
                }}	style={{height: "300px", width: "100%"}}/>
        </div>
    )
}


export const HtmlViewerCtrl2 = ({ content, className, useSanitizer = true }: { useSanitizer?: boolean, className?: string, content?: string }) => {
    const sanitizer = dompurify.sanitize;
    const [isHtml, setIsHtml] = useState<boolean>()
    useEffect(() => {
        if (content) {
            setIsHtml(isHTMLString(content))
        }
    }, [content])
    return (
        <>
            {isHtml &&
              
                <div className={clsx(className?className:'scroll-x mt-4')} dangerouslySetInnerHTML={{ __html: useSanitizer ? sanitizer(`${content}`) : `${content}` }} />
            }
        </>
    )
}


export const HtmlViewerCtrl = ({ content, className}: { className?: string, content?: string }) => {
    
    const [isHtml, setIsHtml] = useState<boolean>()
    useEffect(() => {
        if (content) {
            setIsHtml(isHTMLString(content))
        }
    }, [content])
    return (
        <>
            {isHtml &&
                <iframe srcDoc={content} width="100%" height={"500"}
                    className={clsx(className ? className : 'scroll-x mt-4')}
                    style={{ border: 'none', backgroundColor: "#eceff5" }} >

                </iframe>
          }
        </>
    )
}

