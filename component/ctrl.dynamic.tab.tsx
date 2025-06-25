/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect, ReactNode, Fragment } from 'react';

import { DynamicViewProps } from "./ui.models.js"

import { Tab, Tabs } from '@mui/material/index.js';
import { FlowLineStyle } from './flowline.style.js';
import { Guid, StringKeyToValue } from 'flowline_common_model/src/util.common';
import { CommonContainerCtrl } from './ctrl.dynamic.common.js';


type tabType = {
    tabID:any,orgItem:any,ctrls:ReactNode[]|undefined
}
const DynamicTabControl = (props: DynamicViewProps) => {

    const { functionMap, value, onEventAction } = props;



    const [activeValue, setActiveValue] = useState<any>();
    
    const [items, setItems] = useState<tabType[]>();
   
    
    useEffect(() => {
        setItems([])
        setActiveValue('')
        Load();
    }, [value])


    useEffect(()=>{
        if(items && items.length > 0){
            tabClick(items[0])
        }
    },[items])
    const Load = () =>{
        var tabs = [];
        if (value) {
            if (value.constructor == Array && value.length > 0) {
                for(var i in value){
                    tabs.push(ConvertToTab(value[i],parseInt(i)))    
                }
            }
            else {
                tabs.push(ConvertToTab(value,0))
            }
        }
        
        setItems(tabs)
        // if(tabs && tabs.length > 0)
        //     setActiveValue(tabs[0].tabID)
    }
    const ConvertToTab = (item:any,index:number)=>{

        return {tabID:`tabIndex${index}`,orgItem:item,ctrls:undefined}
    }
   


    const tabClick =async (tabEntity:tabType)=>{
        
        
        if(!tabEntity.ctrls){
            await BindingExpandCtrl(tabEntity)
        }

            
        setActiveValue(tabEntity.tabID)
    }

    

    const BindingExpandCtrl = async (tabEntity: tabType) => {
        if (onEventAction) {
            var ctrls = await onEventAction("TabEvent", tabEntity.orgItem)
            if (ctrls?.constructor === Array) {
                tabEntity.ctrls = ctrls;
            }

        }
    }
    return (
        <>
            {items&& activeValue && 
                <>
{/* , backgroundColor: FlowLineStyle.TabHeaderBackgroundColor */}
                    <Tabs value={activeValue?activeValue:''}
                    variant={'scrollable'}
                    style={{  height: FlowLineStyle.HeaderHeight
                        , minHeight: FlowLineStyle.HeaderMinHeight
                        
                        , borderBottom:"1px solid "+FlowLineStyle.BorderColor
                     }}
                     scrollButtons allowScrollButtonsMobile >

                        {items && items.map((tab: any, tbIndex: number) => {

                            return (<Tab key={`tabindexHeaderID${tbIndex}`}
                                className='rounded-0 rounded-top-1'
                                style={{  height: FlowLineStyle.HeaderHeight, minHeight: FlowLineStyle.HeaderMinHeight, backgroundColor: tab.id === activeValue ? FlowLineStyle.HeaderActiveBackgroundColor : '' }} 
                                value={tab.tabID}
                                onClick={() => { tabClick(tab) }}
                                label={

                                    
                                        
                                        <CommonContainerCtrl 
                                
                                            value={tab.orgItem}
                                            onEventAction={onEventAction}
                                            
                                            outputCtrls={functionMap.UIViewSetting?functionMap.UIViewSetting.OutputCtrls:[]}
                                  />
                                        
                                    

                                }  />)
                        })}

                    </Tabs>
                    
                    {items && items.map((tab: tabType, tbIndex: number) => {


                        return (

                            <div key={`tbContentIndex${tbIndex}`} className='' hidden={tab.tabID !== activeValue}>

                                {tab.ctrls && tab.ctrls.length > 0 && tab.ctrls?.map((ctrl, pindex) => {

                                    return (
                                        <div key={`tbContentIndex${tbIndex}${pindex}`}  className='p-5 rounded border-0 ' >
                                        { ctrl }
                                        </div>
                                    )
                                })}
                            </div>
                        )

                    })}

            </>
            }
        </>

    );
};

export default DynamicTabControl;
