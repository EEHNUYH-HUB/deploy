/* eslint-disable jsx-a11y/anchor-is-valid */

import clsx from "clsx"
import React, { CSSProperties, Fragment, ReactNode, useEffect, useRef, useState } from "react"

import { Guid } from 'flowline_common_model/src/util.common';
import { FlowLineStyle } from "./flowline.style.js";


import { useControlContext } from "./ctx.control.js";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { Box, IconButton, styled, Tab, Tabs, Tooltip } from "@mui/material/index.js";
import {ArrowDownward, ArrowLeft, ArrowRight, ArrowUpward, Close,ExpandMore} from '@mui/icons-material';



import MuiAccordion, { AccordionProps } from '@mui/material/Accordion/index.js';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary/index.js';
import MuiAccordionDetails from '@mui/material/AccordionDetails/index.js';
import Typography, { typographyClasses } from '@mui/material/Typography/index.js';





const _splitSize = 2
const _colDivCss = "d-flex flex-row flex-row-fluid"
const _rowDivCss = "d-flex flex-column flex-column-fluid"



export const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary

        {...props}
    />
))(({ theme }) => ({
    backgroundColor: FlowLineStyle.ContentBackgroundColor,
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
        color:FlowLineStyle.ActiveFontColor
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1.7),
        color:FlowLineStyle.FontColor

    },
    height: FlowLineStyle.HeaderHeight,
    minHeight: FlowLineStyle.HeaderMinHeight
}));
export const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    // '&:not(:last-child)': {
    //     borderBottom: `1px solid ${theme.palette.divider}`,
    // },
    '&:last-child': {
        borderBottom: `0px solid ${theme.palette.divider}`,
    },
    '&::before': {
        display: 'none',
    }, backgroundColor: FlowLineStyle.ContentBackgroundColor
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(0),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: FlowLineStyle.ContentBackgroundColor
}));



const DockPanel = ({mainID, className, width, height, children }: { mainID:string,className?: string, width?: string, height?: string, children?: ReactJSXElement }) => {

    
    const [mainWidth, setMainWidth] = useState<number | undefined>();
    const [mainHeight, setMainHeight] = useState<number | undefined>();
    const elementRef = useRef(null);

    useEffect(() => {
        const updateDimensions = () => {
            const element = elementRef.current;
            if (element) {
                const { clientWidth, clientHeight } = element;
                if (clientWidth !== mainWidth || clientHeight !== mainHeight) {
                    
                    setMainWidth(clientWidth);
                    setMainHeight(clientHeight);
                }
            }
        };

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (elementRef.current) {
            resizeObserver.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                resizeObserver.unobserve(elementRef.current);
            }
        };
    }, [mainWidth, mainHeight]);
    
    

    return (
        <DndProvider backend={HTML5Backend}>
            <div id={mainID} ref={elementRef} className={clsx('d-flex', className)}
                style={{ width: width ? width : "100%", height: height ? height : "calc(100vh - 230px)" }}>


                <DockContent width={mainWidth} height={mainHeight}  >
                    {children}
                </DockContent>


            </div>
        </DndProvider>
    )
}

export const SubDockPanel = ({ parentDockID, width, height, children }: { parentDockID?: any, width?: number, height?: number, children?: ReactJSXElement }) => {

    const ctrlContext = useControlContext();
    const [defaultWidth, setdefaultWidth] = useState<number>()
    const [defaultHeight, setdefaultHeight] = useState<number>()
    const divRef = useRef<any>();
    useEffect(() => {
        
        setdefaultWidth(divRef?.current?.offsetParent?.clientWidth)
        setdefaultHeight(divRef?.current?.offsetParent?.clientHeight - divRef?.current?.offsetParent?.offsetTop)

    }, [divRef])

    useEffect(() => {

        if (parentDockID) {
            ctrlContext.addEventHandler(`Resize${parentDockID}`, (w: number, h: number) => {
                setdefaultWidth(w)
                setdefaultHeight(h)
            })
        }

        return () => {
            if (parentDockID)
                ctrlContext.removeEventHandler(`Resize${parentDockID}`);
        }
    }, [parentDockID])
    return (
        <div ref={divRef}>

            <DockContent width={width ? width : defaultWidth} height={height ? height : defaultHeight}  >
                {children}
            </DockContent>

        </div>

    )
}
export const DockItem = ({ children }: DockItemProps) => {
    return (
        <Fragment>
            {children}
        </Fragment>
    )
}

export const DockItems = ({ children }: DockItemsProps) => {
    return (
        <Fragment>
            {children}
        </Fragment>
    )
}
Object.assign(DockItems, { displayName: "DockItems" })
Object.assign(DockItem, { displayName: "DockItem" })
class DockItemsProps {
    width?: number;
    height?: number;
    sizeRate?: number;
    children?: ReactNode;
    valueID?: any;
    autoClosed?: boolean;
    onTabChanged?: Function
    onTabClick?: Function
    onTabContentClick?: Function
    isActived?: boolean
    showLeftRightArrowBtn?:boolean
    itemsType: 'Accordion' | 'Tab' | 'Orientation' = 'Orientation'
    orientation?: "Horizontal" | "Vertical"
    variant?: 'standard' | 'scrollable' | 'fullWidth' = 'scrollable'
    dragAcceptID?: string
    drop?: Function

}
class DockItemProps {
    width?: number;
    height?: number;
    sizeRate?: number;
    children?: ReactJSXElement;
    title?: string;
    id: any;
    onResize?: (width?: number, height?: number) => void;
    useCloseBtn?: boolean;
    onClosed?: Function;
    appendCtrl?: ReactNode;
    onActived?: Function;
    isShowTitleBar?: boolean;
    className?:string
    
    minimum?:boolean;
    
    beforesize?: number;


    static getDockInfoItem = (child: any) => {

        return {
            children: child.props.children
            , sizeRate: child.props.sizeRate
            , title: child.props.title
            , id: child.props.id
            , onClosed: child.props.onClosed
            , useCloseBtn: child.props.useCloseBtn
            , updateSizeRate: child.props.updateSizeRate
            , onActived: child.props.onActived
            , appendCtrl: child.props.appendCtrl
            , onResize: child.props.onResize
            , minimum :child.props.minimum
            
            , isShowTitleBar: child.props.isShowTitleBar
            , className:child.props.className
        };
    }
}

const getChildrenType = (children?: any) => {

    var rtn = children?.type?.displayName;


    if (rtn !== "DockItem") {
        if (children.props.itemsType) {
            {
                return children.props.itemsType
            }
        }
        else {
            return "Div"
        }
    }

    return rtn;



}
const convertDockItemToDockItemInfo = (children?: ReactJSXElement, beforeInfos?: DockItemProps[]) => {


    var infos = [];
    var childrens = [];

    var isArray = children?.props?.children?.constructor === Array;
    if (isArray) {
        childrens = children?.props?.children;


    }
    else {

        if (children?.props?.children && children?.props?.children !== false)
            childrens.push(children?.props?.children);

    }

    if (childrens && childrens.length > 0) {
        for (var i in childrens) {
            var child = childrens[i]

            if (child && child.constructor === Object) {

                if (getChildrenType(child) === "DockItem") {
                    infos.push(_convertToInfo(child, parseInt(i), beforeInfos))
                }
                else if (child?.constructor === Array) {
                    for (var j in child) {
                        if (getChildrenType(child[j]) === "DockItem") {
                            infos.push(_convertToInfo(child[j], parseInt(j), beforeInfos))
                        }
                    }
                }
            }

        }
    }


    function _convertToInfo(child: any, index: number, beforeInfos?: DockItemProps[]) {


        var before = beforeInfos?.find(x => x.id === child.props.id);//(beforeInfos && beforeInfos.length > 0 ? beforeInfos[index] : undefined);

        if (before) {
            before.children = child.props.children;
            return before
        } else {
            return DockItemProps.getDockInfoItem(child)
        }
    }

    return infos;
}
const DockContent = ({ width, height, children }: { width?: number, height?: number, children?: ReactJSXElement }) => {
    const [downIndex, setDownIndex] = useState<number>(-1)
    const [rerendering, setRerendering] = useState<string>(Guid());
    const [orientation, setOrientation] = useState<"Horizontal" | "Vertical">("Horizontal");
    const [showLeftRightArrowBtn,setShowLeftRightArrowBtn] = useState<boolean>()
    const elementRef = useRef(null);

    const [itemInfos, setItemInfos] = useState<DockItemProps[]>();
    const mouseDown = (index: number) => {
        setDownIndex(index)
    }
    const move = (mx: number, my: number, targetIndex: number) => {
        if (width && height && itemInfos && itemInfos.length > 0 && targetIndex > 0) {

            var widhtWithOutSplitSize = width - ((itemInfos.length - 1) * _splitSize);
            var heightWithOutSplitSize = height - ((itemInfos.length - 1) * _splitSize);



            var leftCnt = targetIndex;
            var rightCnt = itemInfos.length - targetIndex;

            var sumRate = 0;
            itemInfos.map((info, i) => {
                if (mx !== 0 && info.width) {
                    if (i < targetIndex) {
                        info.width = info.width + mx / leftCnt;
                    }
                    else {
                        info.width = info.width - mx / rightCnt;
                    }
                    info.sizeRate = info.width * 100 / widhtWithOutSplitSize;
                    sumRate += info.sizeRate;

                }

                if (my !== 0 && info.height) {
                    if (i < targetIndex) {
                        info.height = info.height + my / leftCnt;
                    }
                    else {
                        info.height = info.height - my / rightCnt;
                    }
                    info.sizeRate = info.height * 100 / heightWithOutSplitSize;
                    sumRate += info.sizeRate;
                    
                }

                if(sumRate > 100 && info.sizeRate){
                    info.sizeRate = info.sizeRate - (sumRate - 100)
                }

            })
            setRerendering(Guid())
        }
    }
    const mouseMove = (e: any) => {
        var mx = 0;
        var my = 0;
        if (orientation === "Horizontal")
            mx = e.movementX;
        else
            my = e.movementY;

        move(mx, my, downIndex)

    }
    const mouseUp = (e: any) => {
        setDownIndex(-1)
    }

    useEffect(() => {
        renderDockContent();
        const resizeObserver = new ResizeObserver(renderDockContent);

        if (elementRef.current) {
            resizeObserver.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                resizeObserver.unobserve(elementRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [width, height, children])

    const renderDockContent = () => {
        if (children) {
            if (getChildrenType(children) === "Orientation") {
                setOrientation(children?.props.orientation);
                setShowLeftRightArrowBtn(children?.props.showLeftRightArrowBtn);
                var infos: DockItemProps[] = convertDockItemToDockItemInfo(children, itemInfos);
                updateDimensions(infos)

            }
        }

    }


    const updateDimensions = (infos: DockItemProps[]) => {

        if (infos && infos.length > 0 && width && height && width > 0 && height > 0 && orientation) {

        

            var widhtWithOutSplitSize = width;
            var heightWithOutSplitSize = height;
            var infoCnt = infos.length;
            if (orientation === "Horizontal") {
                widhtWithOutSplitSize = widhtWithOutSplitSize - ((infoCnt - 1) * _splitSize);
            }
            else {
                heightWithOutSplitSize = heightWithOutSplitSize - ((infoCnt - 1) * _splitSize);
            }


            var totalRate: number = 0;
            var undefinedRateCnt = 0;
            for (var i in infos) {
                var info = infos[i];
                if (info && info.sizeRate != null && info.sizeRate != undefined) {
                    totalRate = totalRate + info.sizeRate;
                }
                else {
                    undefinedRateCnt += 1;
                }
            }

            var defaultRate = (100 - totalRate) / undefinedRateCnt;

            if (defaultRate <= 0 || totalRate > 100 || defaultRate === Infinity|| defaultRate === -Infinity) {

                defaultRate = 100 / infos.length;
                for (var i in infos) {
                    var info = infos[i];
                    info.sizeRate = undefined;
                }

            }


            infos.map((info, i) => {
                var rate: number = defaultRate;
                if (info.sizeRate) {
                    rate = info.sizeRate;
                }
                if (orientation === "Horizontal") {
                    

                     if(info.minimum){
                         info.width = 0;
                     }
                     else{
                        info.width = widhtWithOutSplitSize * rate / 100;
                    }
                    info.height = height;
                }
                else {
                     if(info.minimum){
                         info.height = 0;
                     }
                     else{
                        info.height = heightWithOutSplitSize * rate / 100;  
                    }
                    info.width = width;
                }

            })

           

            setItemInfos(infos);
            setRerendering(Guid());
        }

    }
    const changeSizeRate = () => {
        
        if (width && height && itemInfos && itemInfos.length > 0) {

            var widhtWithOutSplitSize = width - ((itemInfos.length - 1) * _splitSize);
            var heightWithOutSplitSize = height - ((itemInfos.length - 1) * _splitSize);
            var sumRate = 0;

            itemInfos.map((info, i) => {
                if (orientation === "Horizontal") {
                    if (info.width) {
                        info.sizeRate = info.width * 100 / widhtWithOutSplitSize;
                        sumRate += info.sizeRate;
                    }
                    else {
                        info.sizeRate = 0;
                    }
                } else {


                    if (info.height) {

                        info.sizeRate = info.height * 100 / heightWithOutSplitSize;
                        sumRate += info.sizeRate;

                    }
                    else {
                        info.sizeRate = 0;
                    }
                }
                if (sumRate > 100 && info.sizeRate) {
                    info.sizeRate = info.sizeRate - (sumRate - 100)
                }


            })


            setRerendering(Guid())
        }
    }
    const changeMinMax = (mx: number, my: number, targetIndex: number,isMinMode:boolean) => {
        
        // if (width && height && itemInfos && itemInfos.length > 0 ) {

        //     var widhtWithOutSplitSize = width - ((itemInfos.length - 1) * _splitSize);
        //     var heightWithOutSplitSize = height - ((itemInfos.length - 1) * _splitSize);


        //     var unMinCnt = itemInfos.length ;
        //      if(itemInfos && isMinMode ){
        //         var unminarry = itemInfos.filter(x=>!x.minimum);
        //          if(unminarry){
        //              unMinCnt = unminarry.length;
        //          }
        //      }

            
        //     var sizeYDivde = my/unMinCnt;
        //     var sizeXDivde = mx/unMinCnt;
         

        //     var sumRate = 0;
        //     itemInfos.map((info, i) => {
        //         if (mx !== 0 && info.width) {
        //             if(i === targetIndex){
        //                 info.width = info.width + mx;
        //             }
        //             else if(!info.minimum){
        //                     info.width = info.width - sizeXDivde;
        //             }
        //             info.sizeRate = info.width * 100 / widhtWithOutSplitSize;
        //             sumRate += info.sizeRate;

        //         }

        //         if (my !== 0 && info.height) {
        //             if(i === targetIndex){
        //                 info.height = info.height + my
        //             }
        //             else if(!info.minimum){
        //                 info.height = info.height - sizeYDivde;
        //             }
        //             info.sizeRate = info.height * 100 / heightWithOutSplitSize;
        //             sumRate += info.sizeRate;
                    
        //         }

        //         if(sumRate > 100 && info.sizeRate){
        //             info.sizeRate = info.sizeRate - (sumRate - 100)
        //         }
                

        //     })

            
        //     setRerendering(Guid())
        // }
    }
    const LeftSize = (index: number) => {

        if (itemInfos && itemInfos.length > 0 && index > 0) {
           

            var targetItem = itemInfos[index-1];
            var rightItem = itemInfos[index];


            if (targetItem) {

                if (rightItem.minimum) {
                    rightItem.minimum = false;


                    if (orientation === "Horizontal") {
                        targetItem.width = targetItem.beforesize;
                        rightItem.width = rightItem.beforesize;

                    }
                    else {
                        targetItem.height = targetItem.beforesize;
                        rightItem.height = rightItem.beforesize;
                    }
                    targetItem.beforesize = 0;
                    rightItem.beforesize = 0;
                } else {
                    targetItem.minimum = true;


                    var targetWidth = targetItem.width ? targetItem.width : 0;
                    var targetHeight = targetItem.height ? targetItem.height : 0;


                      if (orientation === "Horizontal") {
                        targetItem.width = 0;
                        targetItem.beforesize = targetWidth;
                        rightItem.beforesize = rightItem.width;
                        rightItem.width =(rightItem.width?rightItem.width:0) + targetWidth + _splitSize;

                    }
                    else {
                          targetItem.height = 0;
                          targetItem.beforesize = targetHeight;
                          rightItem.beforesize = rightItem.height;
                        rightItem.height =(rightItem.height?rightItem.height:0) + targetHeight + _splitSize;
                    }
                }

                changeSizeRate()
                
            }

        }
    }
    const RightSize = ( index: number) => {

     if (itemInfos && itemInfos.length > 0 && index > 0) {
           

            var leftItem = itemInfos[index-1];
            var targetItem = itemInfos[index];


            if (targetItem) {

                if (leftItem.minimum) {
                    leftItem.minimum = false;

                    
                    if (orientation === "Horizontal") {
                        targetItem.width = targetItem.beforesize;
                        leftItem.width =leftItem.beforesize;

                    }
                    else {
                         targetItem.height = targetItem.beforesize;
                        leftItem.height =leftItem.beforesize;
                    }
                    targetItem.beforesize = 0;
                    leftItem.beforesize = 0;
                } else {
                    targetItem.minimum = true;


                    var targetWidth = targetItem.width ? targetItem.width : 0;
                    var targetHeight = targetItem.height ? targetItem.height : 0;


                      if (orientation === "Horizontal") {
                        targetItem.width = 0;
                        targetItem.beforesize = targetWidth;
                        leftItem.beforesize = leftItem.width;
                        leftItem.width =(leftItem.width?leftItem.width:0) + targetWidth + _splitSize;

                    }
                    else {
                          targetItem.height = 0;
                          targetItem.beforesize = targetHeight;
                          leftItem.beforesize = leftItem.height;
                          leftItem.height =(leftItem.height?leftItem.height:0) + targetHeight + _splitSize;
                    }
                }

                changeSizeRate()
                
            }

        }

    }


    return (

        <Fragment>{rerendering && itemInfos && orientation &&
            <div ref={elementRef} className={clsx(orientation === "Horizontal" ? _colDivCss : _rowDivCss, 'position-relative')}
                style={{ height: height, cursor: downIndex > 0 ? (orientation === "Horizontal" ? "ew-resize" : "ns-resize") : undefined }}
                onMouseMove={mouseMove} onMouseUp={mouseUp}>
                {itemInfos.map((info, index:number) => {

                    return (
                        <Fragment key={`dockItemIndex${index}`}>


                            {rerendering &&
                                <Fragment>
                                     
                                    {showLeftRightArrowBtn && index > 0 && <>
                                        {!(itemInfos[index-1].minimum) &&   <LeftCtrl orientation={orientation} onAction={() => { LeftSize(index) }} /> }


                                          {!info.minimum &&<RightCtrl orientation={orientation} onAction={() => { RightSize(index); }} />}
                                    </>
                                    }
                                        
                                    

                                    {index > 0 && !info.minimum &&!(itemInfos[index-1].minimum)&&  <DockSplit isActive={downIndex === index} 
                                    onMouseDown={(e: any) => { mouseDown(index) }} orientation={orientation}></DockSplit>}

                                    <div style={{ display: info.minimum ? 'none' : '' }}>
                                        <DockDiv dockItemProps={info} />
                                    </div>
                                </Fragment>
                            }
                        </Fragment>
                    )
                })}
            </div>
        }
        </Fragment>
    )
}
const DockDiv = ({ dockItemProps, onContentClick }: { dockItemProps: DockItemProps, onContentClick?: Function }) => {


    const [activeValue, setActiveValue] = useState<any>();
    const [divType, setDivType] = useState<string>();

    const [items, setItems] = useState<DockItemProps[]>();
    const [dragAcceptID, setDragAcceptID] = useState<string>()

    const ctrlContext = useControlContext();

    const tabChange = (event: React.SyntheticEvent, newValue: any) => {

        ActivePanel(newValue);

        if (dockItemProps.children?.props?.onTabChanged) {
            dockItemProps.children?.props?.onTabChanged(newValue)
        }
    };
    const tabClick = (id: any) => {
        if (dockItemProps.children?.props?.onTabClick) {
            dockItemProps.children?.props?.onTabClick(id)
        }
    }
    const tabContentClick = (id: any) => {
        if (dockItemProps.children?.props?.onTabContentClick)
            dockItemProps.children?.props.onTabContentClick(id)
    }


    useEffect(() => {

        try {
            
            if (dockItemProps) {
                var eleType = getChildrenType(dockItemProps.children);

                if (eleType === "Tab" || eleType === "Accordion") {


                    var infos: DockItemProps[] = convertDockItemToDockItemInfo(dockItemProps.children);

                    if (infos && infos.length > 0) {
                        if (dockItemProps.children?.props?.valueID)
                            ActivePanel(dockItemProps.children?.props?.valueID)
                        else if ((!activeValue || infos?.findIndex(x => x.id === activeValue) < 0) && infos && infos.length > 0)
                            ActivePanel(infos[0].id)

                        setItems(infos);


                        setDragAcceptID(dockItemProps.children?.props?.dragAcceptID)

                    }

                }
                onActionResize(dockItemProps)

                setDivType(eleType)
            }

        }
        catch (ex) {
            console.log(ex)
        }

    }, [ dockItemProps.width, dockItemProps.height, dockItemProps.children,dockItemProps.title])

    // const [{ isOver, canDrop }, dropRef] = useDrop(
    //     () => ({
    //         accept: dragAcceptID ? dragAcceptID : "",
    //         drop: (source: any, monitor) => {

    //             if (dockItemProps?.children?.props?.drop) {
    //                 dockItemProps.children.props.drop(dockItemProps.id, source.tab.id)
    //             }
    //         },
    //         collect: (monitor) => ({
    //             isOver: monitor.isOver(),
    //             canDrop: monitor.canDrop(),

    //         })

    //     }),
    //     [dragAcceptID, dockItemProps.id],
    // )
    const ActivePanel = (id: any , isMustActive:boolean =false) => {

        if (id !== activeValue || isMustActive) {
             if(dockItemProps.id === id && dockItemProps.onActived){
                dockItemProps.onActived();
            }
            else if (items && items.length > 0) {
                var findObj = items.find(x => x.id === id)
              
                if (findObj && findObj.onActived) {
                    findObj.onActived();
                }
              
            }
            setActiveValue(id)

        }


    }

    const IsExpanded = (id: any) => {
        if (dockItemProps.children?.props?.autoClosed)
            return id === activeValue

        return undefined;
    }

    const GetAccordionHeight = () => {

        if (items) {
            if (dockItemProps.children?.props?.autoClosed)
                return (dockItemProps.height ? dockItemProps.height - (items.length * (FlowLineStyle.HeaderHeightInt + 1)) : 0)
            else
                return (dockItemProps.height ? (dockItemProps.height - (items.length * (FlowLineStyle.HeaderHeightInt + 1))) / items.length : 0)
        }
    }



    const onActionResize = (info: DockItemProps) => {

        var w = info.width
        var h = info.height

        h = info.isShowTitleBar ? ((info.height ? info.height : 0) - (FlowLineStyle.HeaderHeightInt + 1)) : info.height

        if (info && info.onResize) {
            info.onResize(w, h)
        }

        
        var event = ctrlContext.getEvent(`Resize${info.id}`);

        if (event) {
            event(w, h)
        }


    }

    if (divType === "Orientation") {
        return (

            <DockContent width={dockItemProps.width} height={dockItemProps.height}>
                {dockItemProps.children}
            </DockContent>
        )
    }
    else if (divType === "Div") {
        return (



            <div style={{ width: dockItemProps.width, height: dockItemProps.height, position: "relative", backgroundColor: FlowLineStyle.ContentBackgroundColor }}>
                {(dockItemProps.isShowTitleBar) &&
                    <Box sx={{ borderBottom: 1, borderTop: 0, borderColor: "divider", height: FlowLineStyle.HeaderHeightInt }}>
                        <div onClick={() => {  ActivePanel(dockItemProps.id,true) }}  
                            className=" d-flex justify-content-between align-items-center cursor-pointer">
                            {dockItemProps.title &&
                                <Typography style={
                                    {
                                        height: FlowLineStyle.HeaderHeightInt
                                        , fontSize: FlowLineStyle.FontSize
                                        , fontFamily: FlowLineStyle.FontFamily
                                        , paddingTop: 7
                                        , color: FlowLineStyle.FontColor
                                        , paddingLeft: 15
                                        , cursor:"pointer"
                                    }}>
                                    {dockItemProps.title}
                                </Typography>
                            }
                            {dockItemProps.appendCtrl &&
                                <Fragment>{dockItemProps.appendCtrl}</Fragment>
                            }
                        </div>
                    </Box>
                }

                <div onClick={() => {
                    if (onContentClick)
                        onContentClick()
                }} className={clsx(dockItemProps.className?dockItemProps.className:'overflow-auto')} style={{ height: dockItemProps.isShowTitleBar ? ((dockItemProps.height ? dockItemProps.height : 0) - FlowLineStyle.HeaderHeightInt) : dockItemProps.height }}>
                    {dockItemProps.children}
                </div>
            </div>

        )
    }
    else if (divType === "Accordion") {
        return (
            <div className={clsx('')} style={{ width: dockItemProps.width, height: dockItemProps.height, position: "relative", backgroundColor: FlowLineStyle.ContentBackgroundColor }}>
                {items && items.map((item, accIndex) => {

                    item.width = dockItemProps.width ? dockItemProps.width - 30 : 0;
                    item.height = GetAccordionHeight();
                    onActionResize(item)


                    return (
                        <Accordion key={`accindexContentID${accIndex}`} expanded={IsExpanded(item.id)} >
                            <AccordionSummary expandIcon={<ExpandMore />} onClick={() => { ActivePanel(item.id,true) }}  >
                                <div className=" d-flex justify-content-between align-items-center" style={{ width: item.width }}>
                                    {item.title && <Typography style={{ fontSize: FlowLineStyle.FontSize,color:FlowLineStyle.FontColor, fontFamily: FlowLineStyle.FontFamily }}>
                                        {item.title}
                                    </Typography>}
                                    {item.appendCtrl && <Fragment>{item.appendCtrl}</Fragment>}
                                </div>
                            </AccordionSummary>
                            <AccordionDetails className="overflow-auto" sx={{ height: item.height }}>
                                {item.children}
                            </AccordionDetails>
                        </Accordion>)
                })}
            </div>
        )
    }
    else if (divType === "Tab") {

        return (
            <div className={clsx("")} style={{ width: dockItemProps.width, height: dockItemProps.height, position: "relative", backgroundColor: FlowLineStyle.ContentBackgroundColor, opacity: dockItemProps.children?.props?.isActived ? 1 : 0.5 }}>

                <Box sx={{ borderBottom: 1, borderTop: 0, borderColor: "divider" }}>

                    <Tabs value={activeValue} onChange={tabChange}
                        ref={(n) => {

                           // dropRef(n);
                        }}



                        style={{ height: FlowLineStyle.HeaderHeight, minHeight: FlowLineStyle.HeaderMinHeight, backgroundColor: FlowLineStyle.TabHeaderBackgroundColor, marginLeft: 0 }}
                        variant={dockItemProps.children?.props?.variant ? dockItemProps.children?.props?.variant : 'scrollable'} scrollButtons allowScrollButtonsMobile > 

                        {items && items.map((tab, tbIndex) => {

                            return (<Tab key={`tabindexHeaderID${tbIndex}`}
                                style={{ height: FlowLineStyle.HeaderHeight, minHeight: FlowLineStyle.HeaderMinHeight, backgroundColor: tab.id === activeValue ? FlowLineStyle.HeaderActiveBackgroundColor : '' }} value={tab.id}
                                label={

                                    <TabHeaderContent activeValue={activeValue} tab={tab} tabClick={tabClick} 
                                    dragAcceptID={dragAcceptID} 
                                    />

                                } wrapped />)
                        })}

                    </Tabs>
                </Box>

                <TabContent

                    items={items} width={dockItemProps.width} height={dockItemProps.height} activeValue={activeValue} tabContentClick={tabContentClick}></TabContent>
            </div>
        )
    }

    else {
        return (<div className={clsx('', 'overflow-auto')} style={{ width: dockItemProps.width, height: dockItemProps.height, position: "relative", backgroundColor: FlowLineStyle.ContentBackgroundColor }}></div>)
    }

}

const TabHeaderContent = ({ activeValue, tab, tabClick, dragAcceptID }: { dragAcceptID?: string, activeValue: string, tab: DockItemProps, tabClick: Function }) => {

    // const [{ isDragging }, dragRef] = useDrag(
    //     () => ({
    //         type: dragAcceptID ? dragAcceptID : "",
    //         item: { tab },
    //         collect: (monitor) => ({
    //             isDragging: monitor.isDragging(),
    //         }),
    //     }),
    //     [dragAcceptID, tab.id],

    // )


    return (
        <div className="d-flex">
        <div onClick={() => { tabClick(tab.id) }}
            className="d-flex justify-content-between align-items-center">
            
            <Tooltip title={tab.title} placement='bottom'>
                <span >
                    {tab.title}
                </span>
            </Tooltip>

            
           
        </div>

        {tab.useCloseBtn && tab.onClosed &&
                <IconButton size="small" component="span" style={{ marginLeft: 0, color: tab.id === activeValue ? '' : '', fontSize: "1px" }} onClick={() => {
                    if (tab.onClosed)
                        tab.onClosed(tab.id)
                }}>
                    <Close viewBox="-4 -3 32 32" />
                </IconButton>
            }
        </div>
    )

}
const TabContent = ({ items, width, height, activeValue, tabContentClick }: { items?: DockItemProps[], width?: number, height?: number, activeValue?: any, tabContentClick: Function }) => {
    const [isStay]= useState<boolean>(false);//true를 할경우 UI 상태가 유지 됩니다.
    return (
        <Fragment>
            {items && items.map((tab, tbIndex) => {

                tab.width = width;
                tab.height = height ? height - FlowLineStyle.HeaderHeightInt : height

                if (isStay) {
                    return (

                        <div hidden={tab.id !== activeValue}>
                            <DockDiv dockItemProps={tab} onContentClick={() => { tabContentClick(tab.id); }} />
                        </div>


                    )
                }
                else {
                    return (
                        <Fragment key={`tabindexContentID${tbIndex}`} >
                            {tab.id === activeValue &&
                                <div hidden={tab.id !== activeValue}>
                                    <DockDiv dockItemProps={tab} onContentClick={() => { tabContentClick(tab.id); }} />
                                </div>}
                        </Fragment>


                    )
                }

            })}
        </Fragment>
    )
}
const DockSplit = ({ onMouseDown, orientation, isActive = false }: { isActive: boolean, onMouseDown?: Function, orientation?: "Horizontal" | "Vertical" }) => {
    
    
    const [splitStyle,setSplitStyle]=useState<CSSProperties>();
    
    const mouseDown = (e: any) => {
        if (onMouseDown) onMouseDown(e);
    }

    useEffect(()=>{
    var cssP:CSSProperties={  position: "relative",  backgroundColor: (isActive ) ? "#1389fd" : FlowLineStyle.ContentBackgroundColor }
        if (orientation === "Horizontal") {
        cssP.cursor = "ew-resize";
        cssP.width = `${_splitSize}px`;
            
        } else {
        cssP.cursor = "ns-resize";
        cssP.height = `${_splitSize}px`;
            
        }

        setSplitStyle(cssP)
    },[orientation,isActive ])


    return (
        <div style={splitStyle} onMouseDown={mouseDown}>
            <div style={{ width: "100%", height: "100%", backgroundColor: FlowLineStyle.SplitColor }}>
                
            </div>
        </div>
    )

   
};
const LeftCtrl = ({onAction ,orientation}: {orientation: "Horizontal" | "Vertical", onAction: () => void }) => {

     const [divStyle, setDivStyle] = useState<any>();

    useEffect(() => {
        if (orientation === "Horizontal")
            setDivStyle({left: '-32px', top: 'calc( 50% - 16px )', zIndex: 1000 })
        else
            setDivStyle({ left: 'calc( 50% - 16px )', top: '-32px', zIndex: 1000 })
    }, [orientation])


    return (
        <div className="position-relative ">
        <div className="position-absolute "
           
            style={divStyle}  >
            <IconButton size="small" onClick={() => {
                onAction()
            }}   >
                
                <ArrowLeft style={{transform:orientation === "Horizontal"?"rotate(0deg)":"rotate(90deg)"}} /> 
            </IconButton>
          

        </div>
        </div>
    );
}
const RightCtrl = ({  orientation, onAction }: {  orientation: "Horizontal" | "Vertical", onAction: () => void }) => {
     const [divStyle, setDivStyle] = useState<any>();

    useEffect(() => {
        if (orientation === "Horizontal")
            setDivStyle({left: '4px', top: 'calc( 50% - 16px )', zIndex: 1000 })
        else
            setDivStyle({ left: 'calc( 50% - 16px )', top: '36px', zIndex: 1000 })
    }, [orientation])



    return (
        <div className="position-relative ">
        <div className="position-absolute "
            onClick={() => {
                onAction()
            }}
                style={divStyle}  >
                <IconButton size="small"        >
                    <ArrowRight style={{transform:orientation === "Horizontal"?"rotate(0deg)":"rotate(90deg)"}} /> 
                </IconButton>


        </div>
        </div>
    );
}

export default DockPanel;

