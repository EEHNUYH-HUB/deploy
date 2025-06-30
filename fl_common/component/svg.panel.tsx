/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-redeclare */
import { useState, useEffect, ReactNode, forwardRef, useImperativeHandle, Fragment } from 'react';
import Popover from '@mui/material/Popover/index.js';



import { FlowLineStyle } from './flowline.style.js';
import {  SvgObjListToRect, JoinObj, SvgObj, SvgPoint, SvgRect, GetOffsetPoint } from './svg.common.js';
import Drawing from './svg.drawing.js';
import SvgMover from './svg.mover.js';
import { GroupRectCtrl ,JoinFactory } from './svg.ctrls.js'
import { Guid } from 'flowline_common_model/result/util.common';
import { FormControlLabel, IconButton, Switch } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';


export const SvgMaxLine:number = 2;

export type SvgPanelRefType = {
    DrawObj: (sObj: SvgObj, width: number, height: number, point: SvgPoint | undefined,isWrap:boolean) => SvgObj
    GetSvgList: Function
    FindSvg: Function
    GetJoinList: Function
    DrawJoin: Function
    DrawGroupZone:(id:string,svgObjs:SvgObj[])=>void
    ClearGroupZone:Function
    Clear: Function
    DeleteSvgObj: Function
    DeleteJoinObj: Function
    ClearSvgObjForJoinObjs: Function
    ShowPopCtrl: Function
    ClosePop: Function
    ResizeObj:Function
    GetPicker:()=>Drawing
}


var MouseUpPoint: any = null;



const SvgPanel = forwardRef((props: {
    defaultLineSize?:number
    , onDeleteSvgObj?: Function
    , onDrawJoinObj?: Function
    , onDeleteJoinObj?: Function
    , onSelectSvgObj?: Function
    , onUnselectSvgObj?:Function
    , onDrawSvgObj?: Function
    , onBeforeDeleteSvgObj?: Function
    , onSelectJoinObj?: Function
    , onDbClickSvgObj?: Function
    , isMoveChildItem?:boolean
    , isEditMode?:boolean
    , isMultiSelectMode?:boolean
    , onGetShowPopupCtrl?: Function
    , onBindingHeaderCtrl?: Function
    , onMoveSvgObjs?: Function
    , GetObjCtrl?: (svgObj:SvgObj,mouseEnter:Function,mouseLeave:Function,doubleClick:Function)=>ReactNode
    , onChanged?: Function
    , onLoopZoneClick?:Function
    , joinDrawType?: "ALL" | "LR" | "BT"
    , showBackgroundLine?: boolean
    , children?: React.ReactNode
    , defaultScale?:number


}, ref) => {
    const {onDrawSvgObj
        , onDeleteSvgObj
        , onDrawJoinObj
        , onBeforeDeleteSvgObj
        , onDeleteJoinObj
        , onSelectSvgObj
        , onUnselectSvgObj
        , onDbClickSvgObj
        , isMoveChildItem = false
        , isEditMode  = true
        , isMultiSelectMode = true
        , onSelectJoinObj
        , onGetShowPopupCtrl
        , defaultLineSize = 50
        , defaultScale = 1
        , onMoveSvgObjs
        , GetObjCtrl
        , onChanged
        , onLoopZoneClick
        , showBackgroundLine = false
        , children
        , joinDrawType = "LR" } = props;

    const [picker] = useState<Drawing>(new Drawing());
    const [mover] = useState<SvgMover>(new SvgMover());
    const [currentObjList, setCurrentObjList] = useState<SvgObj[]>();
    const [currentJoinList, setCurrentJoinList] = useState<JoinObj[]>();
    const [groupRects, setGroupRects] = useState<SvgRect[]>();
    const [drawPath, setDrawPath] = useState<string>();
    const [popCtrl, setPopCtrl] = useState<ReactNode>();
    // const [mainTransform,setMainTransform] = useState<string>("translate(0,0) scale(1)");
    const [scale, setScale] = useState<number>(defaultScale);
    const [translate, setTranslate] = useState<SvgPoint>({ X: 0, Y: 0 });
    const [svgID, setSvgID] = useState<string>();
    const [ctrlClick, setCtrlClick] = useState<boolean>(false)
    const [svgHeight, setSvgHeight] = useState<string>("2000px");
    const [svgWidth, setSvgWidth] = useState<string>("2000px");
    useEffect(() => {
        if (picker) {
            var svgID = Guid();
            setSvgID(svgID)

            mover.OnMove = (p: SvgPoint) => {
                setTranslate({ X: p.X, Y: p.Y })
            }
            picker.JoinDrawType = joinDrawType;
            picker.IsMoveChildItem = isMoveChildItem;
            picker.DefaultLineSize = defaultLineSize
            
            picker.OnDrawSvgObj = (obj: SvgObj) => {

                var newArry: SvgObj[] = [];
                newArry = newArry.concat(picker.ObjList);
                setCurrentObjList(newArry)

                if (onDrawSvgObj)
                    onDrawSvgObj(obj);

                if (onChanged) onChanged();

            }
            picker.OnDeleteSvgObj = (obj: SvgObj) => {

                var newArry: SvgObj[] = [];
                newArry = newArry.concat(picker.ObjList);
                setCurrentObjList(newArry)

                if (onDeleteSvgObj)
                    onDeleteSvgObj(obj);

                if (onChanged) onChanged();
            }


            picker.OnBeforeDeleteSvgObj = (obj: SvgObj) => {

                if (onBeforeDeleteSvgObj && onBeforeDeleteSvgObj(obj) === false) {
                    return false;
                }
                else
                    return true;

            }


            picker.OnDrawJoinObj = (joinObj: JoinObj) => {

                var newArry: JoinObj[] = [];
                newArry = newArry.concat(picker.JoinList);
                setCurrentJoinList(newArry)

                if (onDrawJoinObj)
                    onDrawJoinObj(joinObj);

                return joinObj
            }
            picker.OnDrawGroupZone= () => {

                var newArry: SvgRect[] = [];
                newArry = newArry.concat(picker.GroupZoneList);
                setGroupRects(newArry)
            }
            picker.OnDeleteJoinObj = (joinObj: JoinObj) => {

                var newArry: JoinObj[] = [];
                newArry = newArry.concat(picker.JoinList);
                setCurrentJoinList(newArry)

                if (onDeleteJoinObj)
                    onDeleteJoinObj(joinObj);

                if (onChanged) onChanged();
            }
            picker.OnDrawPath = (path: string) => {
                setDrawPath(path)
            }

            picker.OnClear = () => {

                setCurrentObjList([]);
                setCurrentJoinList([]);

                if (onChanged) onChanged();
            }


            picker.OnMoveSvgObjs = (objs: SvgObj[]) => {
                if (onMoveSvgObjs)
                    onMoveSvgObjs(objs);
            }

        }
    }, [picker]);

    useEffect(()=>{
        if(picker){
            picker.Scale = defaultScale;
        }
    },[defaultScale])
    const OnMouseDown = (e: any) => {
        
        
        if (e.ctrlKey || !isEditMode) {

            if (!isEditMode) {
                var ep = GetOffsetPoint(e, picker.Scale);
                var sp = { X: ep.X, Y: ep.Y };

                var svg = picker.PointToSvg(sp)
                
                if (svg) { 
                    setIsShow(false);
                    if (picker && picker.MouseDown) {
                        picker.MouseDown(e);
                    }
                    return;
                }
            }
            
            setCtrlClick(true)
            mover.MouseDown(e);
        }
        else {
            setIsShow(false);
            if (picker && picker.MouseDown) {
                picker.MouseDown(e);

                var isRightC = false
                if (e) {
                    if ("which" in e)
                        isRightC = e.which === 3;
                    else if ("button" in e)
                        isRightC = e.button === 2;
                }
                if(!isRightC && !isMultiSelectMode && picker.SelectedItems.length ===0){
                    setCtrlClick(true)
                    mover.MouseDown(e);
                }
            }
        }
    };
   
    const OnMouseMove = (e: any) => {
        
        if (ctrlClick || (!isMultiSelectMode && picker.SelectedItems.length ===0)) {

            mover.MouseMove(e);
            
        }
        else if (picker && picker.MouseMove&& isEditMode){ 
            picker.MouseMove(e);
        }
    };
    const OnMouseUp = (e: any) => {
        if (ctrlClick) {
            setCtrlClick(false)
            mover.MouseUp(e);
        }
        else {

            if (picker && picker.MouseUp ) {
                picker.MouseUp(e);

                MouseUpPoint = e;
                if ((picker.IsShowIcon || picker.IsRightClick) && onGetShowPopupCtrl) {
                    var ctrl = onGetShowPopupCtrl(picker.SelectedItems, picker.IsShowIcon, picker.IsRightClick);
                    ShowPopCtrl(ctrl);
                }
                else if (onSelectSvgObj && picker.SelectedItem) {
                    onSelectSvgObj(picker.SelectedItem);
                }
                else if (onSelectSvgObj && picker.SelectedItems && picker.SelectedItems.length === 1) {
                    onSelectSvgObj(picker.SelectedItems[0])
                }
                else if(onUnselectSvgObj){
                    onUnselectSvgObj()
                }
                if (onChanged) onChanged();
            }
        }
    };

    const OnMouseOut = (e: any) => {

        if (ctrlClick) {
            //setCtrlClick(false)
            //mover.MouseOut(e);
        }
        else if (picker && picker.MouseOut) {
            picker.MouseOut(e);
        }
    };
    
    const OnDoubleClick = (e: any,isShow:boolean=true) => {
        if (onDbClickSvgObj)
            onDbClickSvgObj(e,isShow);
    }

    const OnContextMenu = (e: any) => {
        e.preventDefault();
    };
    const OnMouseEnter = (item: any) => {
        if (picker) {
            picker.JoinObj(item);
        }
    };
    const OnMouseLeave = (item: any) => {
        
        if (picker) {
            picker.UnJoinObj(item);
        }
    };

    const OnkeyUp = (e: any) => {
        if (e.key === "Delete") {
            var newArry: SvgObj[] = [];
            newArry = newArry.concat(picker.SelectedItems);


            for (var i in newArry)
                picker.DeleteSvgObj(newArry[i])
        }
    }
    const OnWheel = (e: any) => {
        //e.preventDefault()
        //if (e.ctrlKey ) {


            if (e.deltaY > 0) {
                Zoom(80)
            }
            else {
                Zoom(-80)
            }
            
        //}
    }

    const Zoom =(v:number)=>{
       
        picker.Scale = (scale * 1000 - v) / 1000;
       
        if (picker.Scale > 2) {
            picker.Scale = 2;
        }
        else if (picker.Scale < 0.3) {
            picker.Scale = 0.3;
        }

        mover.SetScale(picker.Scale);



        setScale(picker.Scale);
    }
    const [isShow, setIsShow] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    //const [y, setY] = useState(0);
    const [bgRectXCnt] = useState(200);
    const [bgRectYCnt] = useState(200);


    const ShowPopCtrl = (ctrl: ReactNode) => {
        if (ctrl) {

            setPopCtrl(ctrl);
            setX(MouseUpPoint.clientX);
            setY(MouseUpPoint.clientY);
            setIsShow(true);
        }

    };
    const ClosePop = () => {
        setIsShow(false);
        picker.AllUnSelected(true);
    }

    const DrawObj = (sObj: SvgObj, width: number, height: number, point: SvgPoint,isWrap:boolean) => {


        
        if (isWrap && sObj.DisplayName && FlowLineStyle.CanvasContext2D) {

            var strs = sObj.DisplayName?.split("\r\n");

            if (strs.length === 1) {
                height += ((strs.length - 1) * 18)
            }
            else {
                height += ((strs.length - 1) * 18) + 11
            }
            var isTitle = true;
            for (var i in strs) {
                if (!isTitle) {
                    var str = strs[i]
                    var targetWidth = width - 75;
                    if (!isTitle) {
                        targetWidth = width - (120 - 50);
                    }
                    var fontWidth = FlowLineStyle.CanvasContext2D?.measureText(str).width;
                    if (fontWidth > targetWidth) {
                        var rowCnt = Math.floor(fontWidth / targetWidth);

                        if (rowCnt > SvgMaxLine) {
                            rowCnt = SvgMaxLine;
                        }
                        height += rowCnt * 18;
                    }
                }

                isTitle = false;
            }

            
        }
        var rtn = picker.DrawSvgObj(sObj, width, height, point);


        var rect = SvgObjListToRect(picker.ObjList);
        if(rect && rect.Width > 0 && rect.Height > 0){
            var w = rect.X+rect.Width;
            var h = rect.Y+rect.Height;
            if (w > 2000) {
                setSvgWidth((w + 200) + "px")
            }

            if (h > 2000) {
                setSvgHeight((h + 200) + "px")
            }
        }
        ClosePop();
        return rtn;
    }

    const ResizeObj = (sObj: SvgObj, width: number, height: number) => {
        picker.ResizeSvgObj(sObj, width, height);
    }

    const Clear = () => {
        picker.Clear();
    }
    const GetSvgList = () => {
        return picker.ObjList;
    }
    const FindSvg = (id: any) => {
        return picker.ObjList.find(x => x.ID === id);
    }
    const GetJoinList = () => {
        return picker.JoinList;
    }
    const DrawJoin = (start: SvgObj, end: SvgObj,join?:JoinObj) => {
        return picker.DrawJoin(start, end, join);
    }
    const DrawGroupZone = (id:string,svgObjs:SvgObj[])=>{
        
        var rect = SvgObjListToRect(svgObjs);

        if(rect){
            rect.Tag = id;
            return picker.DrawGroupZone(rect);
        }
    }
    const ClearGroupZone= ()=>{
        picker.ClearGroupZone();
    }
    const DeleteJoinObj = (obj: JoinObj) => {
        picker.DeleteJoinObj(obj);
    }
    const DeleteSvgObj = (obj: SvgObj) => {
        picker.DeleteSvgObj(obj);
    }
    const ClearSvgObjForJoinObjs = (obj: SvgObj) => {
        picker.ClearSvgObjForJoinObjs(obj);
    }
    const  GetPicker =()=>{
return picker;
    }

    useImperativeHandle(ref, () => ({ GetPicker, ResizeObj, DrawObj, ClosePop, GetSvgList, FindSvg, GetJoinList, DrawJoin,DrawGroupZone,ClearGroupZone ,Clear, DeleteSvgObj, DeleteJoinObj, ClearSvgObjForJoinObjs, ShowPopCtrl }))

    
    return (

        <div onContextMenu={OnContextMenu} id={svgID}


            style={{
                height: '100%',
                msUserSelect: 'none', MozUserSelect: '-moz-none', KhtmlUserSelect: 'none', WebkitUserSelect: 'none', userSelect: 'none'
            }}  >  
            <div className='ms-4 mt-4 d-flex position-absolute align-items-center' style={{ zIndex: 200 }}>
                <IconButton size='small' onClick={() => {
                    Zoom(100)
                }}>
                    <Remove></Remove>
                </IconButton>
                <span style={{fontSize:FlowLineStyle.FontSize,fontFamily:FlowLineStyle.FontFamily,color:FlowLineStyle.FontColor}}>
                {picker.Scale ? Math.round(picker.Scale * 100) : 100} %
                </span>
                <IconButton size='small' className='me-4' onClick={() => {
                    Zoom(-100)
                }}>
                    <Add></Add>
                </IconButton>
                <FormControlLabel control={<Switch value={isMoveChildItem} onChange={()=>{
                    picker.IsMoveChildItem = !picker.IsMoveChildItem
                }} />} label="하위 객체 함께 이동" />

               
            </div>
            <svg
                transform={`translate(${translate.X},${translate.Y}) `}
                style={{ outline: 'none', height: svgHeight, width: svgWidth, zoom: scale, cursor: ctrlClick ? 'move' : '' }}
                onKeyUp={OnkeyUp} tabIndex={0}
                //height='100%'
                onWheel={OnWheel}
                onMouseUp={OnMouseUp}
                onMouseOut={OnMouseOut}
                onMouseMove={OnMouseMove}
                onContextMenu={OnContextMenu}
                onMouseDown={OnMouseDown}

            >
                {currentObjList &&
                    currentObjList.map((svgObj, index) => {
                        return (
                            <Fragment key={`drawitem${index}`} >
                                {GetObjCtrl && GetObjCtrl(svgObj, OnMouseEnter, OnMouseLeave, OnDoubleClick)}
                            </Fragment>
                        )

                    })}

                {currentJoinList &&
                    currentJoinList.map((joinObj, index) => {
                        return <JoinFactory key={`index${index}`} joinObj={joinObj} onClick={() => {

                            if (onSelectJoinObj)
                                onSelectJoinObj(joinObj)
                        }}></JoinFactory>;
                    })}



                {
                    groupRects && groupRects.length > 0 &&
                    groupRects.map((rect, index) => {
                        return <GroupRectCtrl key={`index${index}`} rect={rect} onClick={(tag?:string)=>{                            
                            if(onLoopZoneClick)
                                onLoopZoneClick(tag)
                        }}/>
                    })
                }
             

                <path d={drawPath} fill='none' stroke='#96C6DE' opacity='0.5' />

                


                {showBackgroundLine && <Fragment>
                    {Array(bgRectXCnt).fill(0).map((_, i) => (

                        <line key={`xline${i}`} x1={(i + 1) * defaultLineSize} y1={0} x2={(i + 1) * defaultLineSize} y2={4000} stroke='gray' strokeDasharray={3} strokeWidth={0.3}></line>
                    ))}

                    {Array(bgRectYCnt).fill(0).map((_, i) => (

                        <line key={`yline${i}`} x1={0} y1={(i + 1) * defaultLineSize} x2={4000} y2={(i + 1) * defaultLineSize} stroke='gray' strokeDasharray={3} strokeWidth={0.3}></line>
                    ))}
                </Fragment>
                }

                {children && children}


            </svg>

           
            <Popover onClose={ClosePop}
                anchorReference="anchorPosition"
                
                anchorPosition={{ top: y, left: x }}
                open={isShow}
            >
                {popCtrl}
            </Popover>
        </div>


    );
});




export default SvgPanel;
