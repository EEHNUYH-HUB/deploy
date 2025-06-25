import { useEffect, useState,  Fragment, useRef } from "react"


import { PageModel, Dictionary, ControlModel} from 'flowline_common_model/src/models'
import {ObjClone, StringKeyToValue} from 'flowline_common_model/src/util.common'

import { MapParamPros, BorderEntity, UIFlowMapTable, UIFlowRunEntity, UIFlowMapColumn } from "./ui.models.js"
import { useAppContext } from "./ctx.app.js"
import { useControlContext } from "./ctx.control.js"

import FlowLineUtils from "./flowline.utils.js"
import ControlLayout, { ControlRefPros } from "./ctrl.layout.control.js"
import TableContainer from "./ctrl.layout.table.js"


export const PageLayout =({model,pageParam,onRows,includeForPopup}:{includeForPopup:boolean,pageParam:MapParamPros ,model?:PageModel,onRows?:(uiList:UIFlowRunEntity[],ctrlModels:Dictionary<ControlModel>)=>void}) => {
    const appContext = useAppContext();
    const ctrlContext = useControlContext();
    const [runList,setRunList] = useState<{table?:UIFlowMapTable
        ,uiList:UIFlowRunEntity[]
        ,startList:UIFlowRunEntity[]
        ,withOutList:UIFlowRunEntity[]
        ,controlModels:Dictionary<ControlModel>
    }>()

    const [pageModelID,setPageModelID] = useState<string>()

    useEffect(() => {
        Load()
    }, [ model])

    const Load = async () => {
        if (model && model.MapValue) {
            
            
            var ctrlModels = await FlowLineUtils.GetControlModelsIncludePageUsedByClient(appContext.flowLineClient, model.MapValue);

            var startList = FlowLineUtils.GetStartUIFlowRunEntityList(pageParam.mapID, model.MapValue)
            var ctrls:UIFlowRunEntity[] =[]
            FlowLineUtils.BindingFunctionLayerList(ctrls,startList)
            

            if (ctrls) {


                var uiList: UIFlowRunEntity[] = [];
                var withOutUI: UIFlowRunEntity[] = [];
                for (var i in ctrls) {
                    var ent = ctrls[i];

                    if ((ent.Map.ActionType === "UI" || ent.Map.ActionType === "UIEDIT" || ent.Map.ActionType === "Control") && ent.Map ) {

                        uiList.push(ent);
                    }
                    else {
                        withOutUI.push(ent)
                    }


                }
                var table: UIFlowMapTable | undefined;
                if (uiList.length > 0) {
                    table = new UIFlowMapTable();
                    table.Binding(uiList);

                }

                setRunList({ table: table, uiList: uiList, startList: startList, withOutList: withOutUI,controlModels:ctrlModels })

                if(onRows)
                    onRows(uiList,ctrlModels)

                
            }

            
            setPageModelID(model.ID)
            
        }
    }
    useEffect(()=>{

            BindingEventWithOutList(runList?.withOutList)
        return()=>{
            UnBindingEventWithOutList(runList?.withOutList)
        }
    },[pageModelID,runList])
    const BindingEventWithOutList = (withOutUIs?:UIFlowRunEntity[]) => {
        if (withOutUIs && withOutUIs.length > 0) {
            for (let i in withOutUIs) {
                let entity = withOutUIs[i]
                entity.onActionHandler = Action;

                ctrlContext.addEventHandler(entity.Map.PK_ID + "RELOAD", (eventID: string) => {

                    if (entity.Map.ActionType === "UIPOPUP" && entity?.Map.UIPopupSetting?.ControlType) {
                        ctrlContext.closeCtrl(entity?.Map.UIPopupSetting?.ControlType)
                    }


                })
            }
        }
    }
    const UnBindingEventWithOutList =(withOutUIs?:UIFlowRunEntity[]) => {
        if (withOutUIs && withOutUIs.length > 0) {
            for (let i in withOutUIs) {
                let entity = withOutUIs[i]

                ctrlContext.removeEventHandler(entity.Map.PK_ID + "RELOAD")
            }
        }
    }
     const Action = async (entity:UIFlowRunEntity,result?:Dictionary<any>)=>{
            
            if(entity.Map.ActionType === "UIPOPUP" && entity.Map.UIPopupSetting?.ControlType ){
    
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
                     <PageLayout model={model} pageParam={{mapID:entity.Map.PK_ID,result:result}} includeForPopup={true}  /> ,
                     { title: title, desc: desc,useCloseBtn:true })
            }
            else if(entity.Map.ActionType === "Event"){
                await UIFlowRunEntity.NextAction(UIFlowRunEntity.FindWithValidConditional(entity.Items,entity.Result), entity.Result)
            }
            
        }
    
        const StartRun = async (entity:UIFlowRunEntity)=>{
            
            
            if(pageParam.result){
                
                if (pageParam.result && entity.onActionHandler) {
                    await entity.onActionHandler(entity, pageParam.result)
                }
              
            }
        }
        
    return (

        
        <Fragment >
            {runList?.table && pageModelID &&
                <TableContainer  key={`pageKey${pageModelID}`} includeForPopup={includeForPopup}
                children={(column: UIFlowMapColumn, rootBorder?: BorderEntity) => (
                    <Fragment >
                        {column.Entity && pageModelID &&
                            <PageContainer
                            includeForPopup={includeForPopup}
                            pageBorder={rootBorder}
                                
                                onLoaded={() => {
                                    if(column.Entity)
                                        StartRun(column.Entity)
                                }}
                                ctrlModels={runList.controlModels}
                                ctrlParam={{ mapID: "root", result: pageParam.result ? ObjClone(pageParam.result) : undefined }}
                                entity={column.Entity}
                                
                                
                                
                                onShow={(item:UIFlowRunEntity) => {
                                    runList?.table?.ShowItem(item)
                                }}
                                onHide={(item:UIFlowRunEntity) => {
                                    runList?.table?.HideItem(item)
                                }} 
                                pageModelID={pageModelID}
                                />
                        }
                    </Fragment>
                )}
                table={runList?.table} pageModelID={pageModelID} />
            }
        </Fragment>)
}


const PageContainer =({includeForPopup,pageModelID,entity,ctrlParam,ctrlModels,onLoaded,pageBorder,onHide,onShow}:
    {includeForPopup:boolean,onHide:Function,onShow:Function,pageModelID:string,entity:UIFlowRunEntity,onLoaded?:Function,ctrlParam: MapParamPros,ctrlModels?:Dictionary<ControlModel>,pageBorder?: BorderEntity})=>{

    
    const ctrlContext = useControlContext()
    const [ctrlModel,setCtrlModel] = useState<ControlModel>();
    const [isHidden,setIsHidden] = useState<boolean>();
    
    const ctrlRef = useRef<ControlRefPros>();
    useEffect(()=>{
        if(entity&& ctrlModels){

            
            var ctrlModel = undefined;
            if (entity.Map.CtrlSetting && entity.Map.CtrlSetting.FK_CONTROL_ID) {
                ctrlModel = ctrlModels[entity.Map.CtrlSetting.FK_CONTROL_ID]
            }
            setCtrlModel(ctrlModel)

            entity.onActionHandler = async (_self: UIFlowRunEntity, result: Dictionary<any>) => {
                entity.Result = FlowLineUtils.CloneBindingValueUsedByClient(result, entity.Map, undefined, undefined);
               

                if(entity.JoinMap?.FunctionMapID){
                    await ctrlRef.current?.RunOutputAction(entity.JoinMap?.FunctionMapID,result,entity.JoinMap.MAPPINGVALUE)
                }
                    
            }
          
            entity.onUIHidden = (v:boolean)=>{
                if(v!==isHidden)
                    onChangeVisible(v)
                
            }

            onChangeVisible(!entity.CheckValid(ctrlParam.result))

            

            ctrlContext.addEventHandler(entity.Map.PK_ID,(sourceMapID:string)=>{
                 if(entity && entity.Map.CtrlSetting && entity.Map.CtrlSetting.ControlToControlReloadList){
                    
                    for(let i in entity.Map.CtrlSetting.ControlToControlReloadList){
                
                        let targetCtrl = entity.Map.CtrlSetting.ControlToControlReloadList[i]
                
                        if (targetCtrl.sourceFuncMapID === sourceMapID) {
                            
                            var event = ctrlContext.getEvent(targetCtrl.targetControlMapID + 'RELOAD')

                            if (event) {   
                                event(targetCtrl.targetMapID);
                            }
                        }
                    }
                 }
            })

            ctrlContext.addEventHandler(entity.Map.PK_ID+'RELOAD',(targetMapID:string)=>{
                if(targetMapID){
                    var event = ctrlContext.getEvent(targetMapID )
                    if(event){
                        event(targetMapID)
                    }
                }
                
           })
        }

        return ()=>{
            if(entity&& ctrlModels){
                ctrlContext.removeEventHandler(entity.Map.PK_ID)
                ctrlContext.removeEventHandler(entity.Map.PK_ID+'RELOAD')
            }
        }
    },[pageModelID])

    const onChangeVisible = (hide:boolean)=>{
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
    return (
        <div hidden={isHidden}>
            
            <ControlLayout key={`controlLayout_${entity.Map.PK_ID}_${pageModelID}`}
            
            ref={ctrlRef} 
            includeForPopup={includeForPopup}
                controlMapID={entity.Map.PK_ID}
                ctrlParam={ctrlParam}
                
                onLoaded={onLoaded}
                pageBorder={pageBorder}
                isBorder={entity.Map.CtrlSetting?.IsBorder}
                controlModel={ctrlModel}

                onEventAction={async (eventType: string | undefined, item: any) => {
                    entity.RunEvent(eventType, item)
                }}
                pageModelID={pageModelID}

            />
        </div>
    )
}
