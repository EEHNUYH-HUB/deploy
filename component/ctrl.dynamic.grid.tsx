
import { DynamicViewProps } from "./ui.models.js"


import MuiGrid from './ctrl.grid.mui.js';

import { useEffect, useState } from "react";



const DynamicDataTableControl = (props: DynamicViewProps) => {

    const {functionMap, value,rerendering,onCheckEventAction,onSelected,onDoubleClick,isExpandCtrl=false,
        onEventAction} = props;

    const OnSelectItem = (item: object) => {

        if (onSelected) {
            onSelected(item);
        }
    };

    const OnDoubleClick = (item: object) => {
        if (onDoubleClick) {
            onDoubleClick(item);
        }
    };
    const [data, setData] = useState<any>();
    useEffect(() => {
        if (value) {
            if (value.constructor != Array) {
                setData([value])
            }
            else {
                setData(value)
            }
        }
    }, [value])

    return (
        <>
            {functionMap.UIViewSetting && functionMap.UIViewSetting?.OutputCtrls&&rerendering &&    
                    
                    <MuiGrid 
                    
                    
                    isExpandCtrl = {isExpandCtrl}
                    storageID={functionMap.PK_ID}
                    rerendering={rerendering}
                    selectFirstItemWhenDataLoad={functionMap.UIViewSetting?.SelectFirstItemWhenDataLoad}
                    data={data} 
                    columns={functionMap.UIViewSetting?.OutputCtrls} 
                    onSelectItem={OnSelectItem} 
                    onDoubleClick={OnDoubleClick}
                    onCheckEventAction={onCheckEventAction}
                    onEventAction={onEventAction}
                     ></MuiGrid>
                
                
            }

            {(!data || data.length === 0 ) &&
                <div className=' d-flex justify-content-center fs-7 align-items-center text-muted mt-5' >
                    검색 결과가 없습니다.
                </div>
            }

        </>

    );
};

export default DynamicDataTableControl;
