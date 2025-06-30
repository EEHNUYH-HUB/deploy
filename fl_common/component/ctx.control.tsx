import { FC, useState, PropsWithChildren, ReactNode, Dispatch, SetStateAction, createContext, useContext, useRef } from 'react';

import { PageModel, FlowRunEntity, OuputEventParams } from 'flowline_common_model/result/models';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs/AdapterDayjs.js';

import LoadingPanel from './ctrl.loading.js';
import DrawerPanel from './ctrl.panel.drawer.js';
import PopupPanel from './ctrl.panel.popup.js';
import { PopupConfig } from './ui.models.js';
import FullScreenPanel from './ctrl.panel.full.screen.js';

import { useSnackbar } from 'notistack';
import ConfirmPanel from './ctrl.panel.confirm.js';

type popupPanelCtrlType = {
    ShowCtrl: Function;
    IsShow: Function;
    CloseCtrl: Function;

};


export type ControlContextProps = {
    
    showLoading:Function;
    closeLoading:Function;
    showCtrl: (type: "POPUP" | "DRAWER" | "FULLSCRREN"|string, ctrl: ReactNode, config: PopupConfig|any|undefined) => void;
    isShowCtrl: (type: "POPUP" | "DRAWER" | "FULLSCRREN"|string) => boolean;
    closeCtrl: (type: "POPUP" | "DRAWER" | "FULLSCRREN" | "ALL" |string) => void;
    confirm:(title:string,msg:string,confirmHandler:Function)=>void;
    messageCtrl: (msg: string, variant: 'default' | 'error' | 'success' | 'warning' | 'info') => void;
    getEvent: (eventID: string) => Function;
    getEvents?: (eventID: string) => Function[];
    addEventHandler: (eventID: string, eventHandler: Function) => void;
    removeEventHandler: (eventID: string) => void
};
const initControlContextPropsState = {
    
    showLoading: () => { },
    closeLoading: () => { },
    showCtrl: () => { },
    closeCtrl: () => { },
    messageCtrl: () => { },
    isShowCtrl: () => { return false; },
    confirm:()=>{},
    getEvent: () => Function,

    addEventHandler: () => { },
    removeEventHandler: () => { }
};
const ControlContext = createContext<ControlContextProps>(initControlContextPropsState);

export const useControlContext = () => {
    return useContext(ControlContext);
};

type WithChildren = PropsWithChildren<{
    
}>;

export const ControlProvider: FC<WithChildren> = ({ children }) => {
    const popupPanelCtrl = useRef<popupPanelCtrlType>();
    const confirmPanelCtrl= useRef<popupPanelCtrlType>();
    const drawerPanelCtrl = useRef<popupPanelCtrlType>();
    const loadingPanelCtrl = useRef<{Show:Function,Close:Function}>();
    
    const fullScreenPanelCtrl = useRef<popupPanelCtrlType>();
    const [outputEventHandlers] = useState<any>({});
    const [outputEventNotFound] = useState<any>({});
    const [eventList] = useState<any>({});
    const { enqueueSnackbar } = useSnackbar();
    const removeEventHandler = (eventID: string) => {
        eventList[eventID] = undefined;
    }
    const addEventHandler = (eventID: string, eventHandler: Function) => {
        if (eventHandler) {
            eventList[eventID] = eventHandler;
        }
    }
    const getEvent = (eventID: string) => {
        return eventList[eventID];
    }

    const getEvents = (eventID: string) => {
        var ps = Object.getOwnPropertyNames(eventList)

        var rtn: Function[] = [];
        if (ps && ps.length > 0) {
            for (var i in ps) {
                var pname = ps[i];
                if (pname && pname.indexOf(eventID) === 0) {
                    rtn.push(eventList[pname])
                }

            }
        }

        return rtn;
    }
    
  
    const messageCtrl = (msg: string, variant: 'default' | 'error' | 'success' | 'warning' | 'info') => {
        if(variant === "error"){
            console.log(msg)
        }
        enqueueSnackbar(msg, { variant })

    }
    const confirm =(title:string,msg:string,confirmHandler:Function)=>{
        confirmPanelCtrl.current?.ShowCtrl(title,msg,()=>{
            confirmHandler()
        })
    }
    const showLoading = () => {
        loadingPanelCtrl.current?.Show();
    }
    const closeLoading = () => { 
        loadingPanelCtrl.current?.Close();
    }
    const showCtrl = (type: "POPUP" | "DRAWER" | "FULLSCRREN"|string, ctrl: ReactNode, config: PopupConfig|any|undefined) => {
        if (type === "DRAWER")
            drawerPanelCtrl.current?.ShowCtrl(ctrl, config);
        else if (type === "POPUP")
            popupPanelCtrl.current?.ShowCtrl(ctrl, config);
        else if (type === "FULLSCRREN")
            fullScreenPanelCtrl.current?.ShowCtrl(ctrl, config);

    };
    const isShowCtrl = (type: "POPUP" | "DRAWER" | "FULLSCRREN"|string) => {
        if (type === "DRAWER")
            return drawerPanelCtrl.current?.IsShow();
        else if (type === "POPUP")
            return popupPanelCtrl.current?.IsShow();
        else if (type === "FULLSCRREN")
            return fullScreenPanelCtrl.current?.IsShow();

        return false;

    }
    const closeCtrl = (type: "POPUP" | "DRAWER" | "FULLSCRREN" | "ALL"|string) => {
        if (type === "DRAWER")
            drawerPanelCtrl.current?.CloseCtrl();
        else if (type === "POPUP")
            popupPanelCtrl.current?.CloseCtrl();
        else if (type === "FULLSCRREN")
            fullScreenPanelCtrl.current?.CloseCtrl();
        else {

            drawerPanelCtrl.current?.CloseCtrl();
            popupPanelCtrl.current?.CloseCtrl();
            fullScreenPanelCtrl.current?.CloseCtrl();
        }
    }


    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>

            <ControlContext.Provider value={
                {
                      showCtrl
                    , isShowCtrl
                    , closeCtrl
                    , showLoading
                    , closeLoading
                    , getEvent
                    , getEvents
                    , addEventHandler
                    , removeEventHandler
                    , confirm
                    , messageCtrl
                    
                }}>

                {children}

                <PopupPanel ref={popupPanelCtrl}></PopupPanel>
                <DrawerPanel ref={drawerPanelCtrl}></DrawerPanel>
                <FullScreenPanel ref={fullScreenPanelCtrl}></FullScreenPanel>
                <LoadingPanel ref={loadingPanelCtrl} ></LoadingPanel>
            <ConfirmPanel ref={confirmPanelCtrl} ></ConfirmPanel>
            </ControlContext.Provider>


        </LocalizationProvider>
    );
};
