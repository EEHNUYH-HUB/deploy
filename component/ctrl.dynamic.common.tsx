/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, Fragment, useEffect, ReactNode } from 'react';

import { DynamicViewProps } from "./ui.models.js"
import CellCtrl from "./ctrl.cell.js";
import clsx from 'clsx';
import { IconButton } from "@mui/material/index.js";
import { ArrowDropDown, ArrowRight } from '@mui/icons-material';
import { OutputCtrlModel } from 'flowline_common_model/src/models.js';



export const CommonContainerCtrl = (
    {
        onCheckEventAction, className, outputCtrls, value, onSelected, onDoubleClick, expandItem, onExpandEvent,
        isExpandCtrl = false, onEventAction }: {
            value: any, onCheckEventAction?: Function, onSelected?: Function, onDoubleClick?: Function, outputCtrls: OutputCtrlModel[], className?: string, isExpandCtrl?: boolean
            , expandItem?: any
            , onExpandEvent?: Function
            , onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]
            >

        }) => {



    const [showExpandButton, setShowExpandButton] = useState<boolean>(false)

    const [loadItemCtrls, setLoadItemCtrls] = useState<ReactNode[]>()
    const [expandCtrls, setExpandCtrls] = useState<ReactNode[]>()
    const [columns, setColumns] = useState<OutputCtrlModel[]>();
    useEffect(() => {
        setColumns(outputCtrls?.filter(x => x.COL_VALUE_TYPE !== "HiddenStyle"))
    }, [outputCtrls])
    useEffect(() => {
        if (isExpandCtrl && value && value.Data && onCheckEventAction) {

            if (onCheckEventAction)
                setShowExpandButton(onCheckEventAction(value, "ExpandEvent"))
        }
    }, [isExpandCtrl, value])

    useEffect(() => {
        if (value && value.Data && onEventAction) {

            BindingAppendCtrl(value)
        }
    }, [ value])


    const BindingAppendCtrl = async (row: any) => {
        if (onEventAction) {

            let loadCtrls = await onEventAction("ItemLoadEvent", row)

            if (loadCtrls?.constructor === Array) {
                setLoadItemCtrls(loadCtrls)
            }
        }
    }


    const BindingExpandCtrl = async (row: any) => {
        if (onEventAction) {
            let expandCtrls = await onEventAction("ExpandEvent", row)
            if (expandCtrls?.constructor === Array) {
                setExpandCtrls(expandCtrls)
            }

        }
    }
    return (

        <div className={clsx(className)}>
            <div className='d-flex'>
                {isExpandCtrl && showExpandButton &&
                    <div className="me-4 d-flex align-items-center" onClick={() => {
                        if (expandItem !== value) {

                            if (onExpandEvent)
                                onExpandEvent(value)
                            BindingExpandCtrl(value);
                        } else {
                            if (onExpandEvent)
                                onExpandEvent(undefined)
                        }

                    }}>
                        <IconButton size="small" >
                            {expandItem === value ? <ArrowDropDown /> : <ArrowRight />}
                        </IconButton>
                    </div>}
                <div className='w-100' onClick={() => {
                    if (onSelected)
                        onSelected(value)
                }} onDoubleClick={() => {
                    if (onDoubleClick)
                        onDoubleClick(value)
                }}>

                    {columns && columns?.map((output, index) => {


                        return (
                            <div key={`contentItem${index}`}>
                                {<div className={clsx(index > 0 ? 'mt-5' : '')}>
                                    {output.COL_DISPLAY_NAME &&
                                        <div className='fs-7 mb-2'>
                                            <span>{output.COL_DISPLAY_NAME}</span>
                                        </div>
                                    }

                                    <CellCtrl key={`contentItem${index}`} outputSetting={output} item={value} onEventAction={onEventAction}></CellCtrl>

                                </div>
                                }
                            </div>


                        );
                    })}



                    {isExpandCtrl && expandCtrls && expandCtrls.length > 0 && expandCtrls?.map((ctrl, pindex) => {

                        return (
                            <div hidden={expandItem !== value} key={`rowindex${pindex}`} >

                                {ctrl}
                            </div>
                        )
                    })}
                    {loadItemCtrls && loadItemCtrls.length > 0 && loadItemCtrls?.map((ctrl, pindex) => {
                        return (
                            <Fragment key={`rowindex${pindex}`} >
                                {ctrl}
                            </Fragment>
                        )

                    })}

                </div>
            </div>

        </div>


    )

}

