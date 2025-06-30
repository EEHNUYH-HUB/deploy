

import { useEffect, useState, memo, useRef, Fragment, ReactNode } from 'react';
import { StringKeyToValue } from 'flowline_common_model/result/util.common'
import { DynamicViewProps, TreeModel } from "./ui.models.js"

import { FlowLineStyle } from './flowline.style.js';


import SvgPanel, { SvgPanelRefType } from './svg.panel.js';
import { SvgObj, SvgObjListToRect } from './svg.common.js';
import { SelectPicker } from './svg.ctrls.js';
import CellCtrl, { GetCellSize } from './ctrl.cell.js';
import { OutputCtrlModel, UIViewModel } from 'flowline_common_model/result/models.js';
import { CommonContainerCtrl } from './ctrl.dynamic.common.js';
import clsx from 'clsx';



const DynamicMindMapControl = (props: DynamicViewProps) => {

    const { functionMap, value, onSelected, onDoubleClick } = props;
    const [items, setItems] = useState<Array<TreeModel>>();


    useEffect(() => {
        if (value) {
            Load()
        }

    }, [value]);

    const Load = async () => {
        LoadOpt1();
    }
    const LoadOpt1 = async () => {
    
        if(functionMap && functionMap.UIViewSetting&& functionMap.UIViewSetting?.OutputCtrls &&functionMap.UIViewSetting?.OutputCtrls.length > 0 && value){
        var roots = ConvertToRootTreeModels(value, functionMap.UIViewSetting);

        setItems(roots);
        }   
}

    const ConvertToRootTreeModels = (items: [], settingInfo: UIViewModel) => {
        var rtn = new Array<TreeModel>();
        for (var i in items) {
            var item = items[i];

            var parentID = StringKeyToValue(settingInfo.TreeParentID, item);
            var id = StringKeyToValue(settingInfo.TreeID, item);

            var isFind = false;
            for (var j in items) {
                if (parentID === StringKeyToValue(settingInfo.TreeID, items[j])) {
                    isFind = true;
                    break;
                }
            }

            if (!isFind) {


                var tm = new TreeModel();
                tm.OrgItem = item;

                tm.Items = ConvertToTreeModels(id, items, settingInfo);
                rtn.push(tm);
            }
        }
        return rtn;
    }

    const ConvertToTreeModels = (findID: any, items: [], settingInfo: UIViewModel) => {
        var rtn = new Array<TreeModel>();
        for (var i in items) {

            var item = items[i];

            var parentID = StringKeyToValue(settingInfo.TreeParentID, item);
            var id = StringKeyToValue(settingInfo.TreeID, item);

            if (findID === parentID) {
                var tm = new TreeModel();
                tm.OrgItem = item;


                tm.Items = ConvertToTreeModels(id, items, settingInfo);
                rtn.push(tm);
            }
        }

        return rtn;


    };


    const OnSelectItem = async (items: TreeModel[]) => {


        if (onSelected) {

            if (functionMap.UIViewSetting?.MultiSelect) {
                var rtns = []
                for (var j in items) {
                    rtns.push(items[j].OrgItem)
                }
                onSelected(rtns);
            }
            else {
                onSelected(items && items.length > 0 ? items[0].OrgItem : undefined);
            }

        }

    };

    const OnDoubleClick = (item: any) => {
        if (onDoubleClick) {
            onDoubleClick(item.OrgItem);
        }

    };

    return (
    
            <MindMap
                onSelectedItem={OnSelectItem}
                onDoubleClick={OnDoubleClick}
                outputCtrls={functionMap.UIViewSetting?functionMap.UIViewSetting.OutputCtrls:[]}
                treeModels={items}
            />
        
    );
};

export const MindMap = memo(({ treeModels, onSelectedItem, onDoubleClick,
    outputCtrls, defaultScale=1,isEditMode=false
   ,orientation="Horizontal" }: {
    treeModels?: TreeModel[]
   , isEditMode?:boolean
   , expandedItems?: string[]
   , onSelectedItem?: Function
   , onDoubleClick?: Function
   
   , outputCtrls: OutputCtrlModel[]
   , defaultScale?:number
   , orientation?:"Horizontal" | "Vertical"
}) => {

   var xMargin = 120;
   var yMargin = 40;
   var rectW = 200;
   var rectH = 30;
   const [selectedItem, setSelectedItem] = useState<TreeModel | undefined>(undefined)

   const svgPanelRef = useRef<SvgPanelRefType>();

   const OnSelect = (items: TreeModel[]) => {

       if (items && items.length > 0 && onSelectedItem !== null && onSelectedItem !== undefined) {
           onSelectedItem(items);
           setSelectedItem(items[0]);
       }
       else {
           setSelectedItem(undefined);
       }


   }

   useEffect(() => {
       if (treeModels) {
           svgPanelRef.current?.Clear();
           
           if(orientation === "Horizontal"){
               BindingHorizonChildItems(undefined, treeModels, 200, 100);
           }
           else{
               BindingVerticalChildItems(undefined, treeModels, 100);
           }
       }

   }, [treeModels,orientation])


   const DrawSvgObj = (treeModel: TreeModel, x: number, y: number) => {

       var sObj = new SvgObj();
       sObj.ICon = "UI";

       sObj.IsPointFixed = false;
       sObj.StrokeColor = FlowLineStyle.SvgTitleColor;
       sObj.FillColor = FlowLineStyle.GridSubColor;

       sObj.IsSupportDrag = false
       sObj.IsUsePopupBtn = false
       sObj.IsUseSettingBtn = false
       sObj.IsSupportDrop = () => { return false };
       sObj.IsResize = sObj.IsResize = true;
       sObj.Border = 0.2;
       sObj.OrgItem = treeModel;

       var size = {w:0,h:0};
       for(var i in outputCtrls){
        var newSize = GetCellSize(outputCtrls[i], treeModel.OrgItem)
        if(newSize){
            size.w += newSize.w;
        if(size.h < newSize.h)
            size.h = newSize.h;
        }
       }
       
       
       var newW = rectW;
       var newH = rectH;
       if (size) {
           newW = size.w > rectW ? size.w : rectW
           newH = size.h > rectH ? size.h : rectH


       }

       svgPanelRef.current?.DrawObj(sObj, newW, newH, { X: x + (newW - rectW) / 2, Y: y }, false);


       treeModel.ReloadItems = () => {
           if (sObj && sObj.Rect) {

               if(orientation === "Horizontal"){
                   BindingHorizonChildItems(sObj, treeModel.Items, x + sObj.Rect.Width + xMargin, y);
               }
               else{
                  // BindingVerticalChildItems(sObj, treeModel.Items, x, y + sObj.Rect.Height + yMargin);
                   
               }
           }
       }
       return sObj;
   }


   const BindingHorizonChildItems = (parentSvg: SvgObj | undefined, treeModels: TreeModel[] | undefined, x: number, y: number) => {


       if (treeModels && treeModels.length > 0) {


           for (var si in treeModels) {
               var i = parseInt(si)

               var targetTreeModel = treeModels[i];
               var tObj = DrawSvgObj(targetTreeModel, x, y);
               if (tObj && tObj.Rect) {
                   BindingHorizonChildItems(tObj, targetTreeModel.Items, x + tObj.Rect.Width + xMargin, y);
               }
               if (parentSvg && tObj) {
                   svgPanelRef.current?.DrawJoin(parentSvg, tObj)
               }

               var sojbs = tObj.NextAllStepSvgObjs()
               sojbs = [tObj].concat(sojbs);
               var rect = SvgObjListToRect(sojbs);
               if (rect) {
                   y += rect?.Height + yMargin

                   if (tObj.Rect) {
                       tObj.Rect.Y = rect.Y + rect.Height / 2

                       if (tObj && tObj.JoinObjs && tObj.JoinObjs.length > 0) {

                           for (var k in tObj.JoinObjs) {
                               var jObj = tObj.JoinObjs[k];
                               if (jObj && jObj.StartObj && jObj.EndObj)
                                   svgPanelRef.current?.DrawJoin(jObj.StartObj, jObj.EndObj, jObj)
                           }
                       }
                       tObj.Chaged();

                   }


               }

           }
       }
   }
   const BindingVerticalChildItems = (parentSvg: SvgObj | undefined, treeModels: TreeModel[] | undefined,  y: number) => {


       if (treeModels && treeModels.length > 0) {


               var x= 200;            
           for (var si in treeModels) {
               var i = parseInt(si)

               var targetTreeModel = treeModels[i];
               var tObj = DrawSvgObj(targetTreeModel, x, y);
               if (tObj && tObj.Rect) {
                   
                   
                   BindingVerticalChildItems(tObj, targetTreeModel.Items, y + tObj.Rect.Height + yMargin);
                 
                   var sojbs = tObj.NextAllStepSvgObjs()
                   sojbs = [tObj].concat(sojbs);
                   var rect = SvgObjListToRect(sojbs);
                   if (rect) {
                       x += rect?.Width + xMargin
                   }
               }
               
               if (parentSvg && tObj) {
                   svgPanelRef.current?.DrawJoin(parentSvg, tObj)
               }
           }


           
       // var sojbs = parentSvg.NextAllStepSvgObjs()
       // sojbs = [parentSvg].concat(sojbs);
       // var rect = SvgObjListToRect(sojbs);
       // if (rect) {
       //     x += rect?.Width + xMargin
       // }
       }


   }
   const DoubleClick = (item: SvgObj) => {

       if (onDoubleClick !== null && onDoubleClick !== undefined && item === selectedItem) {

           onDoubleClick(item.OrgItem);
       }
   }


   return (
       <div className='w-100 scroll-x' >

           <SvgPanel ref={svgPanelRef}
               isMoveChildItem={true}
               isEditMode={isEditMode}
               
               joinDrawType={orientation==="Horizontal"?"LR":"BT"}

               defaultScale={defaultScale}
               onSelectSvgObj={(sobj: SvgObj) => {

                   OnSelect([sobj.OrgItem])

               }}
               onDbClickSvgObj={DoubleClick}
               GetObjCtrl={(svgObj: SvgObj, mouseEnter: Function, mouseLeave: Function, doubleClick: Function) => {

                   return (
                       <MindMapItem svgObj={svgObj} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}
                           onDoubleClick={doubleClick}
                           outputCtrls={outputCtrls}
                       />
                   )
               }}>

           </SvgPanel>

       </div>
   )

});


const MindMapItem = (props: {
    svgObj: SvgObj, 
    
     outputCtrls: OutputCtrlModel[],
     onMouseEnter: Function
     ,onEventAction?:(eventKey: string|undefined, item: any) =>Promise<void|ReactNode[]>
        , onMouseLeave: Function, onDoubleClick: Function, onGetIncldueControl?: Function
}) => {
    const { svgObj, onMouseEnter, onMouseLeave, onDoubleClick, outputCtrls, onGetIncldueControl,onEventAction } = props;
    const [transform, setTransform] = useState<string>();
    const [treeModel, setTreeModel] = useState<TreeModel>();
    useEffect(() => {

        if (svgObj ) {
            svgObj.OnChaged = () => {
                Binding();
            };

            Binding();
            setTreeModel(svgObj.OrgItem)


        }
    }, [svgObj]);



    const Binding = () => {


        if (svgObj && svgObj.Rect && svgObj.Rect.Width && svgObj.Rect.Height) {
            setTransform(
                `translate(${svgObj.Rect.X},${svgObj.Rect.Y}) scale(${svgObj.Rect.ScaleX},${svgObj.Rect.ScaleY}) rotate(${svgObj.Rect.Rotate},${svgObj.Rect.Width / 2},${svgObj.Rect.Height / 2})`
            );

        }
    }


    return (
        <Fragment>

            <g onMouseEnter={() => onMouseEnter(svgObj)}
                onMouseLeave={() => onMouseLeave(svgObj)}
                onDoubleClick={() => onDoubleClick(svgObj)}
                transform={transform} >
                {
                    svgObj && svgObj.Rect && svgObj.Rect.Width && svgObj.Rect.Height && <>




                        <foreignObject rx={2} ry={2} x={0} y={0} width={svgObj.Rect.Width} height={svgObj.Rect.Height}>
                            <div className='d-flex justify-content-between align-items-center ' style={{ backgroundColor: FlowLineStyle.SvgBackgroundColor }} >
                            <CommonContainerCtrl 
                                
                                            value={treeModel?.OrgItem}
                                            onEventAction={onEventAction}
                                            onDoubleClick={onDoubleClick}
                                            outputCtrls={outputCtrls}
                                  />
                                
                            </div>
                        </foreignObject>


                        <rect rx={2} ry={2} x={0} y={0} width={svgObj.Rect.Width} height={svgObj.Rect.Height} fill={"rgba(255, 255, 255, .05)"} strokeWidth={0.25} stroke={FlowLineStyle.SvgBackgroundColor} ></rect>

                    </>
                }

                <SelectPicker svgObj={svgObj} />
            </g>
        </Fragment>
    )
}


export default DynamicMindMapControl;
