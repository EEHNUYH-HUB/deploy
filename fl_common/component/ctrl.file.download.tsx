import  {CSSProperties, FC,ReactNode, useEffect, useState,} from 'react'
import clsx from 'clsx'

import { Guid } from 'flowline_common_model/result/util.common';
import { GetBaseUrl } from './ui.utils.js';


type WithChildren = {
    children?: ReactNode
    downloadPath?:string
    className?:string
    style?:CSSProperties
    path:string
    
}
export const FileDownloadLink:FC<WithChildren>= ({children,downloadPath="file/download",path,className})=>{
    const [url, setUrl] = useState<string>();
    const [aID]= useState<string>(Guid())
    
    useEffect(() => {
        var url = `${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${downloadPath}?path=${path}`;
        setUrl(url)
    }, [path, downloadPath])



    return (
    
       
        <div className={clsx(className ? className : '')} onClick={()=>{
            document.getElementById(aID)?.click();
        }} >
              <a href={url} id={aID} target='_blank' style={{display:'none'}} />
            {children}
        </div>


    )
}

export const FileDownloadLink2 = ({downloadPath = "file/download", path, afterDelete = false, className,children}:{downloadPath?: string,path:string,className?: string,afterDelete?:boolean,children: React.ReactNode})=>{
    
    const handleDownload = async () => {
        try {
            var url = `${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${downloadPath}?path=${path}&afterdelete=${afterDelete}`;
            if(url){
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = path.split('/').pop() || 'downloaded-file'; // 파일 이름 설정
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            }
        } catch (error) {
            console.error('파일 다운로드 중 오류 발생:', error);
        }
    };

    return (
        <div className={clsx(className ? className : '')} onClick={handleDownload}>
            {children}
        </div>
    );
};





export const ImageView: FC<WithChildren> = ({ downloadPath = "file/download", path, className, style }) => {
    const [url, setUrl] = useState<string>();
    const [aID]= useState<string>(Guid())
    
    useEffect(() => {
        
        var url = `${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${downloadPath}?path=${path}`;
        setUrl(url)
    }, [path])



    return (
        
       
        <div className={clsx(className ? className : 'symbol symbol-30px symbol-md-40px')} onClick={()=>{
                document.getElementById(aID)?.click();
        }}>
            <a href={url} id={aID} target='_blank' style={{display:'none'}} />
            <img src={url} alt='' style={style}/>
        </div>
     
    )
}



