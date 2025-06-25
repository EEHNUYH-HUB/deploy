/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect, ReactNode } from 'react';

import { DynamicViewProps } from "./ui.models.js"
import CellCtrl from "./ctrl.cell.js";
import SplitPanel from './ctrl.panel.split.js';
import MuiPagination from './ctrl.pagination.mui.js';
import clsx from 'clsx';
import { IconButton } from "@mui/material/index.js";
import { ArrowDropDown, ArrowRight } from '@mui/icons-material';
import { CommonContainerCtrl } from './ctrl.dynamic.common.js';
import { Guid } from 'flowline_common_model/src/util.common';

const DynamicCardControl = (props: DynamicViewProps) => {

    const {onCheckEventAction, functionMap, value, onSelected, onDoubleClick, rerendering, isExpandCtrl = false,  onEventAction } = props;



    const [pageResult, setPageResult] = useState<any[]>();
    const [colCnt, setColCnt] = useState<number>(1);
    const [selectedItem, setSelectedItem] = useState<any>();
    const [items, setItems] = useState<any>();
    const [valueKey,setValueKey] = useState<string>();
    useEffect(() => {

        if (functionMap.UIViewSetting?.OutputSetting?.ColumnCount > 0)
            setColCnt(functionMap.UIViewSetting?.OutputSetting.ColumnCount);
        else setColCnt(1);

    }, [functionMap,rerendering])


    useEffect(() => {
        if (value) {
            setValueKey(Guid())
            setPageResult(undefined);
            
            if (value.constructor != Array && value.Data) {
                setItems([value])
            }
            else {
                setItems(value)
            }
        }
    }, [value])


    useEffect(() => {
        if (items && functionMap.UIViewSetting?.SelectFirstItemWhenDataLoad) {
            OnSelectItem(items.length > 0 ? items[0] : undefined)
        }
    }, [items])

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

    const [expandItem,setExpandItem]= useState<any>();
  const OnExpandEvent = (item:any)=>{
    setExpandItem(item)
    }

    return (
        <>
            {valueKey && functionMap.UIViewSetting?.OutputCtrls && items && items.length > 0 &&
                <>
                    <SplitPanel key={`splitKey${valueKey}`} className='my-2' splitCnt={colCnt}

                        children={(v: any, i: number) => (
                            <div key={`card_div_key_${valueKey}_${i}`} className={clsx('card mb-5 mb-xl-8')} >
                                <CommonContainerCtrl
                                    key={`card_key_${valueKey}_${i}`}
                                    expandItem={expandItem}
                                    onExpandEvent={OnExpandEvent}


                                    onCheckEventAction={onCheckEventAction}
                                    onEventAction={onEventAction}
                                    isExpandCtrl={isExpandCtrl}
                                    onSelected={OnSelectItem} onDoubleClick={OnDoubleClick}
                                    outputCtrls={functionMap.UIViewSetting ? functionMap.UIViewSetting.OutputCtrls : []}
                                    value={v}
                                    className='card-body' />
                            </div>
                        )}


                        value={pageResult}
                    />


                    <MuiPagination data={items} defaultPageSize={20} onPagingData={(dt: []) => {

                        setPageResult(dt);

                    }} />
                </>
            }
        </>

    );
};

export default DynamicCardControl;
