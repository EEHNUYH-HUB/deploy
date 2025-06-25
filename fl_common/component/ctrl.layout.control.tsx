import clsx from "clsx";
import { useEffect, useState, forwardRef, useImperativeHandle, Fragment, ReactNode, useRef, CSSProperties } from "react"

import {  MapValue,  FunctionMap, ActionModel, Dictionary, BindingLoadOption, ColumnMappingModel, CtrlSetting, PageModel } from 'flowline_common_model/src/models'
import { BindingMappingValue, ConvertJsonModelToKeyValue, ConvertKeyValueObjectToObject,  Guid,  StringKeyToValue } from 'flowline_common_model/src/util.common'


import { MapParamPros, DynamicCtrlProps, DynamicEditProps, UIFlowRunEntity, BorderEntity, UIFlowMapColumn } from "./ui.models.js"
import { useAppContext } from "./ctx.app.js"
import DynamicDataTableControl from "./ctrl.dynamic.grid.js";
import DynamicListControl from "./ctrl.dynamic.list.js";
import DynamicChartControl from "./ctrl.dynamic.chart.js";
import DynamicTreeControl from "./ctrl.dynamic.tree.js";
import DynamicMindMapControl from "./ctrl.dynamic.mindmap.js";


import DynamicInputControl from "./ctrl.dynamic.editor.js";
import DynamicCardControl from "./ctrl.dynamic.card.js";
import DynamicChatControl from "./ctrl.dynamic.chat.js";
import {  useControlContext } from "./ctx.control.js";
import FlowLineUtils from "./flowline.utils.js";
import { Box, CircularProgress, ThemeProvider, useTheme } from "@mui/material";
import { customTheme, FlowLineStyle } from "./flowline.style.js";

import DynamicTabControl from "./ctrl.dynamic.tab.js";
import { FuncMapProvider, useFuncMapContext } from "./ctx.function.map.js";
import {  UIFlowMapTable } from "./ui.models.js"

import TableContainer from "./ctrl.layout.table.js";




export const FlowViewCtrl = ({functionMap,isExpandCtrl=false,value,onEventAction,controlHeight,pageBorder,rerendering,onCheckEventAction,bindingLoadOption,onBindingAction}:{
    functionMap:FunctionMap,value?:any,rerendering:string
    ,isExpandCtrl?:boolean
    ,controlHeight?: string
    ,pageBorder?: BorderEntity
    ,bindingLoadOption?:BindingLoadOption
    ,onBindingAction?:Function
    ,onEventAction?:(eventKey: string|undefined, item: any) =>Promise<void|ReactNode[]>
    ,onCheckEventAction?:(item: object, eventType: string) => boolean})=>{



    
    
    const [result, setResult] = useState<any>();
    
    
    useEffect(() => {
        Init();
    }, [functionMap, value])
    const Init = async () => {
        setResult(value)
    }

    

    const OnSelectItem = (item: object) => {
        if(onEventAction)
        onEventAction( 'SelectEvent',item)
    };

    const OnDoubleClick = (item: object) => {
        if(onEventAction)
        onEventAction( 'DoubleEvent',item)
    };

    


    return(
        <Fragment>
            {
                functionMap.UIViewSetting&&functionMap.UIViewSetting.ControlType && rerendering &&
                <Fragment>
                    {functionMap.UIViewSetting.ControlType === "DataTableCtrl" &&
                        <DynamicDataTableControl 
                        rerendering={rerendering}
                        functionMap={functionMap} 
                            onCheckEventAction={onCheckEventAction} 
                            isExpandCtrl={isExpandCtrl} 
                            
                            value={result} 
                            
                            onSelected={OnSelectItem} 
                            onEventAction={onEventAction}
                            onDoubleClick={OnDoubleClick} 
                             ></DynamicDataTableControl>}
                    {(functionMap.UIViewSetting.ControlType === "ListCtrl" || functionMap.UIViewSetting.ControlType === "ViewCtrl") &&
                        <DynamicListControl 
                        functionMap={functionMap}  
                        onEventAction={onEventAction}
                            onCheckEventAction={onCheckEventAction} isExpandCtrl={isExpandCtrl} value={result} 
                            onSelected={OnSelectItem} onDoubleClick={OnDoubleClick} ></DynamicListControl>}
                    {functionMap.UIViewSetting.ControlType === "CardCtrl" &&
                        <DynamicCardControl 
                        functionMap={functionMap}  rerendering={rerendering}
                        onEventAction={onEventAction}
                            onCheckEventAction={onCheckEventAction} isExpandCtrl={isExpandCtrl}  value={result} 
                            onSelected={OnSelectItem} onDoubleClick={OnDoubleClick} ></DynamicCardControl>}
                    {functionMap.UIViewSetting.ControlType === "ChartCtrl" &&
                        <DynamicChartControl 
                        functionMap={functionMap}  
                        onEventAction={onEventAction}
                        isExpandCtrl={isExpandCtrl}         
                        pageBorder={pageBorder}               
                        controlHeight={controlHeight}
                        value={result} 
                        onSelected={OnSelectItem} onDoubleClick={OnDoubleClick} ></DynamicChartControl>}
                    {functionMap.UIViewSetting.ControlType === "TreeCtrl" &&
                        <DynamicTreeControl 
                        functionMap={functionMap}   
                        onEventAction={onEventAction}
                        
                        bindingLoadOption={bindingLoadOption}
                        value={result} onBindingAction={onBindingAction} 
                        onSelected={OnSelectItem} onDoubleClick={OnDoubleClick} ></DynamicTreeControl>}
                    {functionMap.UIViewSetting.ControlType === "MindMapCtrl" &&
                        <DynamicMindMapControl 
                        functionMap={functionMap}  
                        onEventAction={onEventAction}
                        
                        value={result} 
                        onSelected={OnSelectItem} onDoubleClick={OnDoubleClick}  />}

                    {functionMap.UIViewSetting.ControlType === "TabCtrl" &&
                        <DynamicTabControl 
                        functionMap={functionMap}  
                        onEventAction={onEventAction}
                        
                        value={result} 
                        onSelected={OnSelectItem} onDoubleClick={OnDoubleClick} ></DynamicTabControl>}



                    {functionMap.UIViewSetting.ControlType === "ChatCtrl" &&
                            <DynamicChatControl
                                value={value}
                                pageBorder={pageBorder}               
                                controlHeight={controlHeight}
                                functionMap={functionMap}
                                rerendering={rerendering}
                                connectionID={functionMap.PK_ID}
                                onEventAction={onEventAction}
                                
                            />}

                </Fragment>
            }

        </Fragment>
    )
}
export const FlowEditCtrl = ({controlHeight,functionMap,rerendering,value,onEventAction}
    :DynamicEditProps)=>{

    return (
        <Fragment>
            {functionMap.UIEditSetting &&<DynamicInputControl  value={value} functionMap={functionMap} rerendering={rerendering} onEventAction={onEventAction}  />}
        </Fragment>
    )
}


const FlowUICtrl =({column,pageModelID,pageBorder,controlHeight,onHide,onShow}:{pageModelID:string,onHide:Function,onShow:Function,column:UIFlowMapColumn,pageBorder?:BorderEntity,controlHeight?:string})=>{

    const funcMapContext = useFuncMapContext();
    const  [data,setData] = useState<any>()
    const [isHidden,setIsHidden] = useState<boolean>();
    const appContext = useAppContext();
    const [isExpandCtrl,setIsExpandCtrl] = useState<boolean>();
    useEffect(()=>{
        
        initBindingEvent (column.Entity ) 
        initBindingEvent (column.SubEntity ) 
        
    },[pageModelID])

    const initBindingEvent = (entity?: UIFlowRunEntity) => {
        if (entity) {
            setIsExpandCtrl(FlowLineUtils.IsIncludeExpandEvent(entity))
            entity.onActionHandler = async (_self: UIFlowRunEntity, result: Dictionary<any>) => {
                if (entity)
                    setData(entity.BindingResultToUIResult(result))
            }
            entity.onUIHidden = (v: boolean) => {
                if (entity) {
                    if (v !== isHidden) {
                        onChangeVisible(entity, v)
                    }
                }
            }
            var isVisible = entity.CheckValid(undefined);

            onChangeVisible(entity, !isVisible)
        }
    }
    const onChangeVisible = (entity:UIFlowRunEntity,hide:boolean)=>{
        setIsHidden(hide)
        if(hide){
            if(onHide)
            onHide(entity)
        }
        else{
            if(onShow)
            onShow(entity);
        }
    }
    const eventAction =async (entity:UIFlowRunEntity,eventType: string|undefined, item: any) => {
        
        return await entity.RunEvent(eventType+entity.Map.PK_ID,item)
    }
    const checkEventAction = (entity:UIFlowRunEntity,item: object, eventType: string) => {
        
        return entity.ValidNextEventAction(eventType+entity.Map.PK_ID,item)
        
    }


    const OnBindingAction =async (entity:UIFlowRunEntity,item:any,bindingLoadOption:BindingLoadOption,beforeLoad:boolean) =>{
        var targetEntity = entity.Parent;

        if (targetEntity && targetEntity.Map && (targetEntity.Map.ActionType === "Code" || targetEntity.Map.ActionType === "Component")) {


            var actionModel;
            if (targetEntity.Map.ActionType === "Code")
                actionModel = targetEntity.Map.JavaScript
            else if (targetEntity.Map.ActionID)
                actionModel = funcMapContext.actionModels[targetEntity.Map.ActionID];



            if (actionModel) {

                var newResult = FlowLineUtils.CloneBindingValueUsedByClient(entity.Result, entity.Map, undefined, item);

                var inputValue: any;
                if (actionModel.Inputs) {
                    inputValue = ConvertJsonModelToKeyValue(actionModel.Inputs)

                    if (bindingLoadOption?.MAPPINGVALUE)
                        BindingMappingValue(newResult, inputValue, bindingLoadOption?.MAPPINGVALUE)
                }


                if (!beforeLoad) {
                    funcMapContext.setLoading(true)
                    var resp = await appContext.flowLineClient?.RunActionModel(actionModel, inputValue);
                    
                    targetEntity.Result = FlowLineUtils.CloneBindingValueUsedByClient(newResult, targetEntity.Map, inputValue, resp);
                    funcMapContext.setLoading(false)

                    var nextResult = entity.BindingResultToUIResult(targetEntity.Result)
                    return nextResult
                }
                else {
                    
                    targetEntity.Result[`in${targetEntity.Map?.PK_ID}`] = ConvertKeyValueObjectToObject(inputValue);
                }

            }
        }
        return undefined;
   }


    return (
        <div hidden={isHidden} >
            {column.Entity && <>
                {column.Entity.Map.ActionType === "UI" && <FlowViewCtrl
                    pageBorder={pageBorder}
                    controlHeight={controlHeight}
                    bindingLoadOption={column.Entity.JoinMap?.BindingLoadOption}
                    onCheckEventAction={(item: object, eventType: string) => {
                        if (column.Entity)
                            return checkEventAction(column.Entity, item, eventType)

                        return false;
                    }}
                    onEventAction={async (eventType: string | undefined, item: any) => {
                        if (column.Entity)
                            return await eventAction(column.Entity, eventType, item)

                        return undefined;
                    }}
                    isExpandCtrl={isExpandCtrl}
                    onBindingAction={(item:any,bindingLoadOption:BindingLoadOption,beforeLoad:boolean)=>{
                        if(column.Entity)
                            return OnBindingAction(column.Entity,item,bindingLoadOption,beforeLoad)
                    }}
                    functionMap={column.Entity.Map} value={data} rerendering={"rerendering"} />}
                
                {column.Entity.Map.ActionType !== "UI" && <FlowEditCtrl pageBorder={pageBorder} controlHeight={controlHeight} functionMap={column.Entity.Map} value={data}
                    onEventAction={async (eventType: string | undefined, item: any) => {
                        
                        if (column.Entity)
                            return await eventAction(column.Entity, eventType, item)

                        return undefined;
                    }} />}
            </>
            }
        </div>
)
}

const FunctionMapLayer =forwardRef(({controlMapID,ctrlParam,onEventAction,onLoaded,pageModelID,includeForPopup,pageBorder}:{
    pageModelID:string,includeForPopup:boolean,
    controlMapID?:string,pageBorder?:BorderEntity,onLoaded?:Function,ctrlParam: MapParamPros,onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>},ref)=>{
    const funcMapContext = useFuncMapContext();
    const appContext= useAppContext();
    const ctrlContext= useControlContext();
    const [runList,setRunList] = useState<{table?:UIFlowMapTable,uiList:UIFlowRunEntity[],startList:UIFlowRunEntity[],withOutList:UIFlowRunEntity[]}>()
    const [pollingIds,setPollingIds] = useState<any[]>()
    const [isBindingEventWithOutList,setIsBindingEventWithOutList]= useState<boolean>(false);
    useEffect(()=>{
        setIsBindingEventWithOutList(false)
        var startList = FlowLineUtils.GetStartUIFlowRunEntityList(ctrlParam.mapID,funcMapContext.mapValue)
        
       startList =  UIFlowRunEntity.FindWithValidConditional(startList, ctrlParam?.result)
        
         var ctrls:UIFlowRunEntity[] =[]
        FlowLineUtils.BindingFunctionLayerList(ctrls,startList)
   
        if (ctrls) {

            var uiList: UIFlowRunEntity[] = [];
            var withOutUI:UIFlowRunEntity[] = [];
            for (var i in ctrls) {
                let ent = ctrls[i];
               
                if ((ent.Map.ActionType === "UI" ||ent.Map.ActionType === "UIEDIT" ||ent.Map.ActionType === "Control" )&&  ent.Map ) {
                    uiList.push(ent);
                }
                else{
                    withOutUI.push(ent)
                }
                

            }
            var table:UIFlowMapTable|undefined;
            
            if(uiList.length > 0){
                table = new UIFlowMapTable();
                
                table.Binding(uiList);
                
            }
            
            setRunList({table:table,uiList:uiList,startList:startList,withOutList:withOutUI})
        
        }

       
    },[pageModelID])
    
    useEffect(()=>{
        
        if(runList){
         
            BindingEventWithOutList(runList.withOutList)
            
           
        }
        
        return()=>{
            if(runList)
                UnBindingEventWithOutList(runList.withOutList)
            
        }
    },[runList])

    useEffect(()=>{
        if(runList && isBindingEventWithOutList){
            StartRun(runList.startList)
        }
    },[isBindingEventWithOutList])


    useEffect(()=>{
        var pollingIds:any[] = [];
        setPollingIds(pollingIds)
        return ()=>{
            
            for(var i in pollingIds){
                clearInterval(pollingIds[i])
            }
        }
    },[])
    const BindingEventWithOutList = (withOutUIs:UIFlowRunEntity[]) => {
        for (let i in withOutUIs) {
            let entity = withOutUIs[i]
            BindingEventEntity(entity)
            
        }
        setIsBindingEventWithOutList(true)
    }

    const BindingEventEntity = (entity: UIFlowRunEntity) => {
        entity.onActionHandler = Action;
        ctrlContext.addEventHandler(entity.Map.PK_ID, (eventID: string) => {


            if (entity && (entity.Map.ActionType === "Component" || entity.Map.ActionType === "Code")) {
                let actModel: ActionModel | undefined;
                if (entity.Map.ActionType === "Component" && entity.Map.ActionID) {
                    actModel = funcMapContext.actionModels[entity.Map.ActionID];
                }
                else if (entity.Map.ActionType === "Code") {
                    actModel = entity.Map.JavaScript;
                }
                if (actModel) {
                    entity.ReloadActionModel(appContext, actModel)
                    BindingEventEntity(entity)
                }
            }
            else {
                if (entity?.Map.ActionType === "UIPOPUP" && entity?.Map.UIPopupSetting?.ControlType)
                    ctrlContext.closeCtrl(entity?.Map.UIPopupSetting?.ControlType)

            }
        })
    }
    const UnBindingEventWithOutList =(withOutUIs:UIFlowRunEntity[]) => {
        for (var i in withOutUIs) {
            let entity = withOutUIs[i]

            ctrlContext.removeEventHandler(entity.Map.PK_ID)
        }
        setIsBindingEventWithOutList(false)
    }
    const StartRun = async (startList:UIFlowRunEntity[])=>{
        
        if (startList && startList.length > 0) {
            
            for (var i in startList) {
                let entity = startList[i]
                
                if (entity && (entity.Map.ActionType === "Code" || entity.Map.ActionType === "Component")) {

                    await Action(entity, ctrlParam.result)
                }
                else if (ctrlParam.result && entity.onActionHandler) {
                    
                    await entity.onActionHandler(entity, ctrlParam.result)
                }
            }

            if (onLoaded)
                onLoaded();
        }
    }
    const RunRealod = (entity:UIFlowRunEntity)=>{
        if( entity.Map.UIActionSetting && entity.Map.UIActionSetting.ReLoadList){
                    
            for(var i in entity.Map.UIActionSetting.ReLoadList){
                let event = ctrlContext.getEvent(entity.Map.UIActionSetting.ReLoadList[i])
                if(event){
                    
                    event(entity.Map.UIActionSetting.ReLoadList[i]);
                }
            }

            if (controlMapID) {
                
                var parentEvent = ctrlContext.getEvent(controlMapID)
                if (parentEvent) {
                
                    parentEvent(entity.Map.PK_ID)
                }
            }
         }
    }

    const Action = async (entity:UIFlowRunEntity,result?:Dictionary<any>,mappingValue?:ColumnMappingModel[])=>{
        
        
        try {

            if (entity.Map.ActionType === "Component" || entity.Map.ActionType === "Code") {

                var actModel: ActionModel | undefined;
                if (entity.Map.ActionType === "Component" && entity.Map.ActionID) {
                    actModel = funcMapContext.actionModels[entity.Map.ActionID];
                }
                else if (entity.Map.ActionType === "Code") {
                    actModel = entity.Map.JavaScript;
                }

                if (actModel) {

                    funcMapContext.setLoading(true);
                    var resp = await entity.RunActionModel(appContext, actModel, result, mappingValue);
                    BindingEventEntity(entity)
                    if (resp && resp?.error) {
                        ctrlContext.messageCtrl(resp.error, "error")
                    }
                    else {

                        RunRealod(entity);
                    }
                    funcMapContext.setLoading(false);

                    var intervarId = FlowLineUtils.PollingRun(entity.Map, async () => {
                        if (actModel) {
                            await entity.RunActionModel(appContext, actModel, result, mappingValue);
                            BindingEventEntity(entity)
                            RunRealod(entity);
                        }

                    })

                    
                    if (intervarId && pollingIds) {
                        pollingIds.push(intervarId)
                    }

                }
            } else if (entity.Map.ActionType === "UIPOPUP" && entity.Map.UIPopupSetting?.ControlType) {

                var desc = entity.Map.UIPopupSetting.DefaultDesc;
                var title = entity.Map.UIPopupSetting.DefaultName;
                var newR = entity.BindingResultToUIResult(result)

                if (entity.Map.UIPopupSetting.DescID) {
                    var newDesc = StringKeyToValue(entity.Map.UIPopupSetting.DescID, newR)
                    if (newDesc) {
                        desc = newDesc;
                    }
                }
                if (entity.Map.UIPopupSetting.TitleID) {
                    var newTitle = StringKeyToValue(entity.Map.UIPopupSetting.TitleID, newR)

                    if (newTitle) {
                        title = newTitle
                    }
                }

                ctrlContext.showCtrl(entity.Map.UIPopupSetting.ControlType,
                    <FuncMapProvider actionModels={funcMapContext.actionModels} mapValue={funcMapContext.mapValue} >
                        <FuncLoading height="calc(100% - 20px)"  />
                        <FunctionMapLayer  includeForPopup={true} controlMapID={controlMapID} ctrlParam={{ mapID: entity.Map.PK_ID, result: result }} onEventAction={onEventAction}  pageModelID={pageModelID}  />
                    </FuncMapProvider>,
                    { title: title, desc: desc ,useCloseBtn:true})
            }
            else if (entity.Map.ActionType === "Event") {

                
                /*Control 외부로 전달*/
                if (onEventAction)
                    onEventAction(entity.Map.UIEventSetting?.EventType, result)
                /*Control 외부로 전달*/

                var isIcludeEvent = FlowLineUtils.IsIncludeEvent(entity.Map.UIEventSetting?.EventType)

                if (isIcludeEvent) {
                    var key = entity.Map.UIEventSetting?.EventType?.includes("ExpandEvent")?Guid():""
                    return <FunctionMapLayer key={key} includeForPopup={false} controlMapID={controlMapID} ctrlParam={{ mapID: entity.Map.PK_ID, result: result }} onEventAction={onEventAction}  pageModelID={pageModelID} />
                }
                else {

                    await UIFlowRunEntity.NextAction(UIFlowRunEntity.FindWithValidConditional(entity.Items, result), result)
                }


            }
            else   if(entity?.Map.ActionType === "Message" && entity?.Map.UIMessageSetting?.ControlType ){
                
                var messageID = entity.Map.UIMessageSetting.MessageID
                var showMessage = entity.Map.UIMessageSetting.Message?entity.Map.UIMessageSetting.Message:"";
                if (messageID) {
                    var findObj = entity.JoinMap?.MAPPINGVALUE?.find(x => x.InputColName === messageID);
                    if (findObj && findObj.InputColName) {
                        var newMessage = StringKeyToValue(findObj.ValueColName, result)
                        if (newMessage) {
                            showMessage = newMessage;
                        }
                    }
                }
                ctrlContext.messageCtrl(showMessage, entity?.Map.UIMessageSetting?.ControlType)

                
             }
        } catch (ex) {
            const name = entity?.Map?.COL_NAME;
            const errorMessage = (ex as Error).toString(); // Assert that ex is an Error
            ctrlContext.messageCtrl(`${name ? name + ' ' : ''}${errorMessage}`, "error");
        }

    }

    ///외부 컨트롤에서 접근
    const RunOutputAction = async (mapID:string,result:any|undefined,mappingValue:ColumnMappingModel[]|undefined)=>{
        var fObj:UIFlowRunEntity|undefined = runList?.withOutList.find(x=>x.Map.PK_ID === mapID);
        
        if(fObj){
           await Action(fObj,result,mappingValue)
        }

    }

    useImperativeHandle(ref, () => ({RunOutputAction}));
    
    return (
        <Fragment>
          
            {isBindingEventWithOutList && runList?.table &&
                <TableContainer includeForPopup={includeForPopup} children={(column: UIFlowMapColumn, ctrlBorder?: BorderEntity) => (<>
                    {column?.Entity && 
                    <FlowUICtrl
                    column={column}
                        pageBorder={pageBorder}
                        controlHeight={ctrlBorder?.strHeight}
                        onShow={(item:UIFlowRunEntity) => {
                            runList?.table?.ShowItem(item)
                        }}
                        onHide={(item:UIFlowRunEntity) => {
                            runList?.table?.HideItem(item)
                        }} 
                        pageModelID={pageModelID} 
                    />}</>
                )} table={runList?.table} pageModelID={pageModelID} />

                
            }


        </Fragment>
        
    )
})

export type ControlRefPros ={
    RunOutputAction:(mapID:string,result:any|undefined,mappingValue:ColumnMappingModel[]|undefined) =>Promise<void>
}
const ControlLayout = forwardRef(({ ctrlParam,onLoaded,includeForPopup,
    onEventAction, isBorder = true,pageModelID, controlModel, controlMapID, functionMapValue,  pageBorder }:
    DynamicCtrlProps & {
        includeForPopup:boolean,
        pageModelID:string,
        isBorder?: boolean, functionMapValue?: MapValue, 
        onLoaded?:Function
    }, ref) => {
    const appContext = useAppContext();
    
    const outerTheme = useTheme();
    const [mapValue,setMapValue] = useState<MapValue>()
    const [actionModels,setActionModels] = useState<Dictionary<ActionModel>>()
    const mapLayerRef = useRef<ControlRefPros>()
    const [cardCss,setCardCss] = useState<string>()
    //const [cardStyle,setCardStyle]  = useState<CSSProperties>();
    const [colorStyle,setColorStyle]  = useState<CSSProperties>();


    useEffect(() => {
        Init();

    }, [controlModel])
   
    useEffect(() => {
        
        if (functionMapValue) {
            Load(functionMapValue)
        }
    }, [functionMapValue])

    
    const Init = async () => {
        if (controlModel) {
            await Load(controlModel.MapValue)
        }
    }
    const Load = async (mapValue?: MapValue) => {

        if (mapValue) {
            
            var actionModels = await FlowLineUtils.GetActionModelsIncludeFlowUsedByClient(appContext.flowLineClient, mapValue);
            setMapValue(mapValue)
            setActionModels(actionModels)

            setCardCss(clsx("card" , isBorder === false ? 'border-0' : '' , pageBorder?.strHeight ? "" : "h-100"))
            
            setColorStyle(
                {
                    borderColor: pageBorder?.borderColor ? pageBorder.borderColor : FlowLineStyle.BorderColor
                    , backgroundColor: pageBorder?.backgroundColor ? pageBorder.backgroundColor : FlowLineStyle.BackgroundColor
                })
        
            // setCardStyle({...FlowLineStyle.CardCss
            //     , height: pageBorder?.strHeight
            //     , borderColor: pageBorder?.borderColor ? pageBorder.borderColor : FlowLineStyle.BorderColor
            //     , backgroundColor: pageBorder?.backgroundColor ? pageBorder.backgroundColor : "red" })
        }
    }

    

    const RunOutputAction = async (mapID:string,result:any,mappingValue:ColumnMappingModel[])=>{
        
        await mapLayerRef.current?.RunOutputAction(mapID,result,mappingValue)
    }
    
    useImperativeHandle(ref, () => ({ Load ,RunOutputAction}));
    return (
        <ThemeProvider theme={customTheme(outerTheme)}>
            {cardCss &&colorStyle && mapValue&&actionModels&& pageModelID &&
                <FuncMapProvider actionModels={actionModels} mapValue={mapValue} >
                    
                    <div 
                        id={controlMapID}
                        className={cardCss} 
                        style={{...FlowLineStyle.CardCss,...colorStyle}}>
                        {(controlModel?.ShowTitle || controlModel?.ShowDesc  )&&
                            <div className='scroll-y' style={{ ...FlowLineStyle.CardHeaderCss,...colorStyle }}> 
                                <div className="align-items-center row">

                                    
                                        <div className="col">
                                        {controlModel?.ShowTitle && (controlModel?.COL_NAME || controlModel?.COL_VIEW_NAME) &&
                                            <h4 style={{ ...FlowLineStyle.CardTitle }} >{controlModel?.COL_VIEW_NAME ? controlModel?.COL_VIEW_NAME : controlModel?.COL_NAME}</h4>
                                        }
                                        </div>
                                    
                                    {controlModel?.ShowDesc && controlModel?.COL_DESC && <div className="col-auto">
                                        <p className={clsx('badge font-11 p-1 mb-0 ')}>{controlModel?.COL_DESC}</p></div>}
                                </div>

                            </div>
                        }
                        <FuncLoading />
                        <div style={{...FlowLineStyle.CardBodyCss,...colorStyle}} className='scroll-y' >
                            <FunctionMapLayer includeForPopup={includeForPopup}  controlMapID ={controlMapID} pageBorder={pageBorder}  ref={mapLayerRef} onLoaded={onLoaded} ctrlParam={ctrlParam} onEventAction={onEventAction} pageModelID={pageModelID} />
                        </div>
                    </div>
                </FuncMapProvider>
            }
        </ThemeProvider>
    )
})

export const FuncLoading =({height="100%",width="100%"}:{height?:string,width?:string})=>{
    const funcMapContext = useFuncMapContext();
    return(
        <Fragment>
        {(funcMapContext.loading  )&&
            <Box
                sx={{
                    color: '#fff', backdropFilter: 'blur(5px)',
                    display: "flex", justifyContent: "center",
                    alignContent: "center", alignItems: "center", position: "absolute",
                    height: height ,width:width, zIndex: 1301
                }}
            >
                <CircularProgress ></CircularProgress>
            </Box>
        }
        </Fragment>
    )
}

export default ControlLayout;

