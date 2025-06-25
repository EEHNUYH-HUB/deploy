


import { Fragment, ReactNode, useMemo, useState } from 'react';


import { Divider, IconButton } from "@mui/material/index.js";


import { Close, Add, Draw } from '@mui/icons-material';
import { Guid } from 'flowline_common_model/src/util.common';
import { FlowLineStyle } from './flowline.style.js';
import { useDrag, useDrop } from 'react-dnd';


import { IConCtrl } from "./ctrl.icon.selector.js"


const Drop = (items: any[], dragIndex: number, dropIndex: number) => {
    if (items && items.length && dragIndex < items.length && dropIndex < items.length) {
        // 드래그된 아이템을 가져옵니다.
        const draggedItem = items[dragIndex];

        // 아이템 배열에서 드래그된 아이템을 제거합니다.
        const updatedItems = items.filter((_, index) => index !== dragIndex);

        // 드롭할 위치에 드래그된 아이템을 추가합니다.
        updatedItems.splice(dropIndex, 0, draggedItem);

        items.length = 0;

        for (var i in updatedItems) {
            items.push(updatedItems[i])
        }
    }
    return items;

}
export const VerticalAddCtrl = ({ items, onGetModel,supportDrag=false, onChanged, onGetCtrl }: {
    items: any[];
    onGetModel: Function;
    supportDrag?:boolean
    onGetCtrl: (index: number, item: any) => ReactNode
    onChanged: Function
}) => {

    const [dragAcceptID] = useState<string>(Guid())


    const [rerendering, setRerendering] = useState<string>(Guid())
    const OnRemoveItem = (index: number) => {
        if (items && items.length > 0) {
            items.splice(index, 1);
            setRerendering(Guid())
            if (onChanged)
                onChanged(items);
        }
    }

    const OnAddItem = () => {


        if (items) {
            var item = onGetModel()
            items.push(item)

            setRerendering(Guid())
            if (onChanged)
                onChanged(items);
        }
    }


    const OnDrop = (dragIndex: number, dropIndex: number) => {


        var newItems = Drop(items, dragIndex, dropIndex)
        setRerendering(Guid());
        if (onChanged) {
            onChanged(newItems);
        }
    }
    return (

        <table className="w-100">

            <tbody>
                {rerendering && items && items.map((item, index) => {

                    return (
                        <Fragment key={`verticalindex${index}`}>
                            <tr >
                                <td>
                                    <AddItemContainer index={{ index: index }} supportDrag={supportDrag}  dragAcceptID={dragAcceptID} OnRemoveItem={() => { OnRemoveItem(index) }} OnDrop={OnDrop}>
                                        {onGetCtrl(index, item)}
                                    </AddItemContainer>
                                </td>
                            </tr>

                        </Fragment>
                    )
                })}


                <tr>
                    <td className='d-flex justify-content-center mt-2'>
                        <IconButton size="small" onClick={OnAddItem}>
                            <Add viewBox="-3 -5 32 32" />
                        </IconButton>
                    </td>
                </tr>
            </tbody>
        </table>

    )

}

export const HorizontalAddCtrl = ({ items, onGetModel, supportDrag=false, onChanged, onGetCtrl }: {
    items: any[];
    onGetModel: Function;
    supportDrag?:boolean
    onGetCtrl: (index: number, item: any) => ReactNode
    onChanged: Function
}) => {


    const [dragAcceptID] = useState<string>(Guid())

    const [rerendering, setRerendering] = useState<string>(Guid())
    const OnRemoveItem = (index: number) => {
        if (items && items.length > 0) {
            items.splice(index, 1);
            setRerendering(Guid())
            if (onChanged)
                onChanged(items);
        }
    }

    const OnAddItem = () => {


        if (items) {
            var item = onGetModel()

            items.push(item)

            setRerendering(Guid())
            if (onChanged)
                onChanged(items);
        }

    }


    const OnDrop = (dragIndex: number, dropIndex: number) => {

        var newItems = Drop(items, dragIndex, dropIndex)
        setRerendering(Guid());
        if (onChanged) {
            onChanged(newItems);
        }


    }
    return (

        <table className='row align-items-center justify-content-center' style={{ backgroundColor: FlowLineStyle.ContentBackgroundColor }}>
            <tbody>
                <tr className=' d-flex align-items-center justify-content-center'>
                    {rerendering && items && items.length > 0 && items.map((item, index) => {

                        return (
                            <Fragment key={`horizontalindex${index}`} >
                                <td  className='w-100'>

                                    <AddItemContainer index={{ index: index }} supportDrag={supportDrag} dragAcceptID={dragAcceptID} OnRemoveItem={() => { OnRemoveItem(index) }} OnDrop={OnDrop}>
                                        {onGetCtrl(index, item)}
                                    </AddItemContainer>



                                </td>

                            </Fragment>
                        )
                    })}
                    <td>
                        <IconButton size="small" className='col col-auto mt-2' onClick={OnAddItem}>
                            <Add viewBox="-3 -5 32 32" />
                        </IconButton>
                    </td>
                </tr>
            </tbody>

        </table>


    )

}
const AddItemContainer = ({ index, OnDrop, OnRemoveItem,supportDrag, children, dragAcceptID }: {supportDrag?:boolean, index: { index: number }, dragAcceptID: string, OnRemoveItem: Function, children: ReactNode, OnDrop: Function }) => {

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: dragAcceptID,
            item: { index },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [dragAcceptID, index?.index],)

    const [{ isOver, canDrop }, dropRef] = useDrop(
        () => ({
            accept: dragAcceptID,
            drop: (item: any) => {
                OnDrop(item.index.index, index.index);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),

            })

        }),
        [dragAcceptID],
    )
    const ctrlUI = useMemo(() => <div className='d-flex-row w-100' >
        {children}
    </div>, [children]);
    return (

        <table ref={(n) => { dropRef(n) }} className='w-100' style={{ opacity: (isDragging || isOver) ? 0.5 : 1 }}>
            <tbody>
                <tr>
                    {supportDrag &&
                        <td className='w-40px'>
                            <div className='d-flex justify-content-center'>
                                <IconButton ref={(n) => { dragRef(n) }} size="small" >
                                    <IConCtrl type='drag' />
                                </IconButton>
                            </div>
                        </td>
                    }
                    <td className='d-flex'>
                        <div className='w-100 d-flex justify-content-center'>
                            {ctrlUI}
                        </div>

                    </td>
                    <td className='w-40px '>
                        <div className='d-flex justify-content-center'>
                            <IconButton size="small" onClick={() => { OnRemoveItem() }}>
                                <Close viewBox="-3 -5 32 32" ></Close>
                            </IconButton>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}
