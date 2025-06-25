/* eslint-disable jsx-a11y/anchor-is-valid */

import { ReactNode, forwardRef, useImperativeHandle, useState } from "react";

import { Drawer, IconButton, ThemeProvider, useTheme } from  '@mui/material/index.js';
import { customTheme } from './flowline.style.js';
import {Close} from '@mui/icons-material';
import { PopupConfig } from "./ui.models.js";
import clsx from "clsx";



const DrawerPanel = forwardRef((props, ref) => {

    const [title, setTitle] = useState<string>();
    const [desc, setDesc] = useState<string>();
    const [children, setChildren] = useState<ReactNode>();
    const [showContent, setShowContent] = useState<boolean>();
    const [config,setConfig] = useState<PopupConfig>();
    const outerTheme = useTheme();
    const ShowCtrl = (ctrl: ReactNode,config:PopupConfig) => {
        setTitle(config.title);
        setDesc(config.desc);
        setChildren(ctrl);
        setConfig(config)

        setShowContent(true)
    }
    const CloseCtrl = () => {
        setShowContent(false)
    }

    const IsShow = ()=>{
        return showContent;
      }
    const toggleDrawer = (newOpen: boolean) => () => {
        setShowContent(newOpen);
    };
    const GetMinWidth = ()=>{
        if(config){
            if(config.fullSize){
                return "calc(100vw - 100px)"
            }
            else{
                return config && config.width && config.width > 0?`${config.width}px`:'500px'    
            }
        }
        return '500px'
    }
    useImperativeHandle(ref, () => ({ ShowCtrl, CloseCtrl,IsShow }))
    return (

        <Drawer
            anchor="right"
            open={showContent}
            
            onClose={config?.useCloseBtn?undefined:toggleDrawer(false)}
        >
            <div className='card w-100 h-100 rounded-0 '  >

                {(title || config?.useCloseBtn) && 
                    <div className='card-header ps-5 pe-2'>

                        <div className='card-title justify-content-center'>
                            <div className='d-flex flex-column me-3 '>
                                <span className='col fs-4 fw-bolder text-gray-900 text-hover-primary me-1 lh-1' >
                                    {title}
                                </span>
                                {desc &&
                                    <div className='mb-0 lh-1 mt-2'>
                                        <span className='fs-7 fw-bold text-gray-400 '>{desc}</span>
                                    </div>}
                            </div>
                        </div>
                        {config?.useCloseBtn &&
                            <div className='card-toolbar'>
                                <IconButton size="small" className='col col-auto' onClick={toggleDrawer(false)}>
                                    <Close viewBox="-3 -5 32 32"  ></Close>
                                </IconButton>
                            </div>
                        }
                    </div>}
                    {/* //hover-scroll-overlay-y */}
                {children && showContent &&
                    <div className={clsx('card-content scroll-y ',config?.contentClassName?config.contentClassName:"mx-4 pt-4")} style={{ minWidth: GetMinWidth(), height: "100%" }}>
                        <ThemeProvider theme={customTheme(outerTheme)}>
                            {children}
                        </ThemeProvider>
                    </div>
                }
                


            </div>

        </Drawer>
    )
})

export default DrawerPanel;
