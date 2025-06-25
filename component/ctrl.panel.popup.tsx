/* eslint-disable jsx-a11y/anchor-is-valid */

import Modal from '@mui/material/Modal/index.js';
import  {useState,forwardRef,useImperativeHandle, ReactNode, } from 'react'

import { Box,IconButton , ThemeProvider, useTheme } from '@mui/material/index.js';
import { customTheme } from './flowline.style.js';

import {Close} from '@mui/icons-material';
import { PopupConfig } from './ui.models.js';
import clsx from 'clsx';


const PopupPanel= forwardRef((props,ref) => {

    const [title, setTitle] = useState<string>();
    const [desc, setDesc] = useState<string>();
    const [wStyle, setWStyle] = useState<string>();
    const [children, setChildren] = useState<ReactNode>();
    const [showContent,setShowContent] = useState<boolean>(false);
    
    const [config,setConfig] = useState<PopupConfig>();
  
    const ShowCtrl = (ctrl: ReactNode,config:PopupConfig) => {
        setTitle(config.title);
        setDesc(config.desc);
        setChildren(ctrl);
        setConfig(config)
        if(config.width)
        setWStyle(`${config.width}px`)
        setShowContent(true)
    }
 
    const CloseCtrl =()=>{
        setShowContent(false)
    }
  const IsShow = ()=>{
    return showContent;
  }
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: wStyle?wStyle:"700px",
        bgcolor: 'background.paper',
        border: '0px solid gray'
      };
      useImperativeHandle(ref, () => ({ ShowCtrl, CloseCtrl,IsShow }))
    const outerTheme = useTheme();
    return (
        <Modal  open={showContent} 
        onClose={config?.useCloseBtn?undefined:CloseCtrl}
        sx={{ zIndex: 1300 }} 
        >
            <Box sx={{ ...style}}>
            <div className='card w-100 h-100  rounded-0 '  >

                {(title || config?.useCloseBtn)  && <div className='card-header pe-5'>

                        <div className='card-title '>
                            <div className='d-flex justify-content-center flex-column me-3'>
                                <span className='col fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1' >
                                    {title}
                                </span>
                                {desc &&
                                    <div className='mb-0 lh-1'>
                                        <span className='fs-7 fw-bold text-gray-400 '>{desc}</span>
                                    </div>}
                            </div>
                        </div>
                        {config?.useCloseBtn &&
                        <div className='card-toolbar'>
                            <IconButton size="small" className='col col-auto' onClick={CloseCtrl}>
                                <Close viewBox="-3 -5 32 32"  ></Close>
                            </IconButton>

                        </div>}
                </div>}
                {children && showContent &&
                    <div className={clsx('card-content scroll-y',config?.contentClassName?config.contentClassName:"ps-8 pe-5 py-4 ")}  style={{maxHeight:"calc(100vh - 100px)"}}>
                        <ThemeProvider theme={customTheme(outerTheme)}>    
                        {children}
                        </ThemeProvider>  
                    </div>
                }


            </div>
            </Box>
      </Modal>

    )
})

export default PopupPanel;
