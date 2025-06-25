/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, Fragment, useEffect } from 'react';
import clsx from 'clsx';
import { DynamicViewProps } from "./ui.models.js"
import CellCtrl from "./ctrl.cell.js";
import MuiPagination from './ctrl.pagination.mui.js';
import { CommonContainerCtrl } from './ctrl.dynamic.common.js';
import { Guid } from 'flowline_common_model/src/util.common';

const DynamicListControl = (props: DynamicViewProps) => {

    const { onCheckEventAction, functionMap, value, onSelected, onDoubleClick, onEventAction, isExpandCtrl = false } = props;

    const [pagingData, setPagingData] = useState<[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>();
    const [items, setItems] = useState<any>();
const [valueKey,setValueKey] = useState<string>();
    const OnSelectItem = (item: object) => {
        setSelectedItem(item)
        if (onSelected) {
            onSelected(item);
        }
    };

    const OnDoubleClick = (item: object) => {
        if (onDoubleClick && item === selectedItem) {
            onDoubleClick(item);
        }
    };

    useEffect(() => {
        if (value) {
            setValueKey(Guid())
            if (value.constructor != Array  && value.Data) {
                setItems([value])
            }
            else {
                setItems(value)
            }
        }
    }, [value])

    useEffect(()=>{
        if(items && functionMap.UIViewSetting?.SelectFirstItemWhenDataLoad ){
            OnSelectItem( items.length > 0?items[0]:undefined)
          }
    },[items])
    
    const [expandItem,setExpandItem]= useState<any>();
  const OnExpandEvent = (item:any)=>{
    setExpandItem(item)
  }
    return (
        <>
            {functionMap.UIViewSetting?.OutputCtrls && items&& items.length > 0  &&
                <>
                    <div className='mb-10'>

                        {pagingData?.map((item, i) => {

                            return (
                                <CommonContainerCtrl
                                 
                                key={`lstItem_${valueKey}_${i}`} 
                                expandItem={expandItem}
                                            onExpandEvent={OnExpandEvent}
                                            value={item}
                                            onCheckEventAction={onCheckEventAction}
                                            onEventAction={onEventAction}
                                            isExpandCtrl={isExpandCtrl}
                                            onSelected={OnSelectItem} 
                                            onDoubleClick={OnDoubleClick}
                                            outputCtrls={functionMap.UIViewSetting?functionMap.UIViewSetting.OutputCtrls:[]}
                                className={clsx('mb-0 p-4')}  />
                            );
                        })}

                    </div>
                    <MuiPagination data={items} defaultPageSize={20} onPagingData={(dt: []) => {
                        setPagingData(dt);
                    }} />
                </>
            }
        </>

    );
};

export default DynamicListControl;
