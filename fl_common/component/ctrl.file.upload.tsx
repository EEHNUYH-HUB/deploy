import  {useRef,FC,ReactNode,useState, Fragment, useEffect, CSSProperties} from 'react'

import { useAppContext } from './ctx.app.js'
import clsx from 'clsx'

import { Guid } from 'flowline_common_model/result/util.common';
import { FlowLineStyle } from './flowline.style.js'


type WithChildren = {
    useDragAndDrap?:boolean
    children?: ReactNode
    uploadComplted:Function
    uploadPath?:string
    className?:string
    parameter?:object
    multiple?:boolean
    rerendering?:string
    useProgressTitle?:boolean
    accept?:string
}
type fileStatus ={
    name?:string
    value?:number
    status?:number
    file?:any

}
const FileUploadContainer:FC<WithChildren>= ({accept,useProgressTitle=true,useDragAndDrap = false,rerendering,multiple=false,children,uploadPath="file/upload",parameter,className,uploadComplted})=>{
    const appContext= useAppContext();
    const [uploadStatus,setUploadStatus] = useState<fileStatus[]>();
    const [uirerendering,setReRendering] = useState<string>(Guid());
    
    const [dragAndDropStyle]=useState<CSSProperties>(
        {border: `1px dashed ${FlowLineStyle.GridSubColor}`
        , backgroundColor: FlowLineStyle.HeaderActiveBackgroundColor
        , display: "flex"
        , minHeight:'100px'
        , padding:'10px'
        , flexDirection: "column"
        , alignItems: "center", justifyContent: "center", position: "relative"
        , borderRadius: "8px"
        // ,cursor: "pointer"
    }
    )
    const [uploadInfo]=useState<CSSProperties>(
        { display: "flex"
        , alignItems: "center"
        , marginBottom: '1rem'
        , color: FlowLineStyle.IConColor
    }
    )
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputClick =() =>{
        fileInputRef.current?.click();
    }
    
    const fileInputChaged =async (e:any)=>{
        var fileList = null;

        if(e.type === 'drop' ){
            
            if (e.dataTransfer && e.dataTransfer.files?.length > 0) {
                if (multiple)
                    fileList = e.dataTransfer.files;
                else
                    fileList = [e.dataTransfer.files[0]];
            }
        }
        else{
            fileList = e.target.files;
        }
        var arry:fileStatus[] =[];

        if (fileList && fileList?.length > 0) {
            for (var i = 0; i < fileList.length; i++) {
                const file = fileList[i];

                if (file && file.name) {

                    arry.push({ name: file.name, value: 0, status: 1, file: file })
                }

            }

            setUploadStatus(arry)

            var rtn = [];
            for (var j in arry) {
                var item = arry[j];
                var result = await appContext.apiClient?.FileUpload(uploadPath, item.file, parameter, (p: number) => {

                    item.status = 2;
                    item.value = p;

                    setReRendering(Guid())
                });
                if(result)
                    rtn.push(result);
            }



            if (uploadComplted !== null && rtn && rtn.length > 0) {
                if (multiple)
                    uploadComplted(rtn);
                else
                    uploadComplted(rtn[0]);
            }
        }
    };

    const handleDrop = (event:any)=>{
        
        event.preventDefault()
        
        fileInputChaged(event)
    }
    const handleDragOver =(event:any)=>{
        
        event.preventDefault()
    }

useEffect(()=>{
if(rerendering){
    setUploadStatus([])
    setReRendering(rerendering)
}
},[rerendering])
    return (
        

        <div className={clsx(className ? className : '')}>
            <div style={useDragAndDrap ? dragAndDropStyle : undefined} onDrop={handleDrop} onDragOver={handleDragOver} >
                {uirerendering && uploadStatus && uploadStatus.length > 0 ?
                    <Fragment>
                        {uploadStatus.map((ent, index) => {

                            return (
                                <Fragment key={`fileupload${index}`} >
                                    {uirerendering &&
                                        <div style={{ display: ent.status === 1 ? 'flex' : 'flex' }}
                                            className='align-items-center w-100  flex-column '>
                                            {useProgressTitle &&
                                            <div className='d-flex justify-content-between mt-auto mb-2'>
                                                <span className='fs-8 ' style={{color:FlowLineStyle.IConColor}}>{ent.name}</span>
                                                <span className='fw-bolder mx-3 fs-8'>{ent.value}%</span>
                                            </div>}
                                            <div className='h-5px w-100 mb-3'>
                                                <div
                                                    className='bg-success rounded h-5px'
                                                    role='progressbar'
                                                    style={{ width: ent.value + '%' }}
                                                ></div>
                                            </div>
                                        </div>}
                                </Fragment>
                            )

                        })}

                    </Fragment> :
                    <Fragment>
                        {useDragAndDrap &&
                            <div style={uploadInfo}>
                               <svg width="16px" height="16px" viewBox="0 0 24 24" >
                                    <g>
                                        <g >
                                            <g>
                                                <path d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7" fill="none" stroke={FlowLineStyle.IConColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                                <g>
                                                    <polyline fill="none" points="7.9 6.7 12 2.7 16.1 6.7" stroke={FlowLineStyle.IConColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                                    <line fill="none" stroke={FlowLineStyle.IConColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12" x2="12" y1="16.3" y2="4.8" />
                                                </g>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                                <div className='ms-4' >
                                    Drag and drop your {multiple?'files':'file'} here

                                </div>
                            </div>}
                    </Fragment>
                }



                <input accept={accept?accept:undefined} type='file' ref={fileInputRef} onChange={fileInputChaged} multiple={multiple} style={{ display: 'none' }}></input>



                <div onClick={fileInputClick} className={useDragAndDrap?'':className} >
                    {children}
                </div>

            </div>
        </div>

    )
}



export default  FileUploadContainer;
