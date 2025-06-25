import { Fragment, ReactNode, useEffect, useState } from "react";

import clsx from "clsx";




const SplitPanel = ((props: {splitCnt:number,value?:any[], children: (v: any,i:number) => ReactNode ,className?:string }) => {
    const { splitCnt, value, className,children } = props;
    const [valueArry,setValueArry] = useState<any[][]>();
    const [colSize,setColSize] =useState<number>(12);
    useEffect(()=>{
        if(value){
            Split();
            
        }
    },[value])

    const Split = ()=>{

        if(splitCnt && splitCnt > 0){
            if (value) {

                var size = Math.floor(12 / splitCnt);
                
                setColSize(size);
                
                
                var tmps: ReactNode[][] = [];
                for (var j = 0; j < splitCnt; j++) {
                    tmps.push([]);
                }
                for (var i in value) {
                    var arrIndex = parseInt(i) % splitCnt;
                    tmps[arrIndex].push(value[i])

                }

                setValueArry(tmps)
            }
        }
    }
    return (
        <div className={clsx('row ',className?className:'')}>
           {valueArry && valueArry.map((values,i)=>{return(
                <div key={`splitItem${i}`} className={`col col-12 col-xl-${colSize}`}>
                   {values && values.map((v, si) => { 
                    var index= si + (i * valueArry.length) ;
                    return (
                    <Fragment key={`splitSubItem${index}`}>
                    {children(v,index )}
                    </Fragment>
                    ) })}  
                </div>
           )})}
        </div>
    )
})

export default SplitPanel;