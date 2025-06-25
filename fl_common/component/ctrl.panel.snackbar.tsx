/* eslint-disable jsx-a11y/anchor-is-valid */

import { useState, forwardRef, useImperativeHandle, ReactNode, CSSProperties } from 'react'
import { customTheme, FlowLineStyle } from './flowline.style.js';

import { Alert,IconButton, Snackbar, ThemeProvider, useTheme } from '@mui/material/index.js';

import {Close} from '@mui/icons-material';
import { PopupConfig } from './ui.models.js';

const SnackbarPanel = forwardRef((props, ref) => {

    
    const [config, setConfig] = useState<PopupConfig>();
    const [children, setChildren] = useState<ReactNode>();
    const [showTime, setShowTime] = useState<Date>();
    const [style,setStyle]= useState<CSSProperties>();
    const ShowCtrl = (ctrl: ReactNode, config: PopupConfig) => {
        
        setChildren(ctrl);
        setConfig(config)

        setOpen(true);
        setShowTime(new Date)

        
        if(config.fullSize)
            setStyle({ width: "calc(100vw - 100px)", height: "calc(100vh - 180px)" });
        else
            setStyle({ minWidth:config?.width?`${config?.width}px` :"500px", minHeight:config?.height?`${config?.height}px` :"", maxHeight: "800px" })
    }

    const CloseCtrl = () => {
        setChildren(undefined);
        setOpen(false);
    }

    const [open, setOpen] = useState(false);


    const handleClose = () => {

        if (showTime) {
            var diffTime = ((new Date).getTime() - showTime.getTime()) / (1000);

            if (diffTime < 0.01)
                return;
        }

        setOpen(false);
    };
    const IsShow = ()=>{
        return open;
      }
    useImperativeHandle(ref, () => ({ ShowCtrl, CloseCtrl,IsShow }))
    const outerTheme = useTheme();
    
    return (


        <Snackbar open={open} onClose={!config?.useCloseBtn ? handleClose : undefined} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} 
        //sx={{ zIndex: 1190 }} 
         >
            <Alert icon={false} variant="outlined" severity="info"
                sx={{ padding: 0, backgroundColor: FlowLineStyle.HeaderActiveBackgroundColor }}>
                <div className='card w-100 h-100 rounded-0 scroll-y border-0 '  >


                    {(config?.title || config?.useCloseBtn || config?.headerCtrl) &&
                        <div className='card-header h-25px ps-4 p-2 m-0' style={{ minHeight: config.desc ? "70px" : "50px" }}>


                            <h6 className='card-title align-items-start flex-column'>
                                {config.title && <span className='card-label fw-bold fs-3 mb-1'>{config.title}</span>}
                                {config.desc && <span className='text-muted mt-1 fw-semibold fs-7'>{config.desc}</span>}
                            </h6>
                            {(config.useCloseBtn || config.headerCtrl) &&
                                <div className='card-toolbar align-items-center'>
                                    {config?.headerCtrl && config.headerCtrl}
                                    {config.useCloseBtn &&
                                        <IconButton size="small" className='col col-auto' onClick={handleClose}>
                                            <Close viewBox="-3 -5 32 32"  ></Close>
                                        </IconButton>
                                    }
                                </div>
                            }

                        </div>}
                    {children &&
                        <div className='card-content p-0 me-4 ps-7  mb-4 mt-4 scroll-y' 
                        style={style}>
                            <ThemeProvider theme={customTheme(outerTheme)}>
                                {children}
                            </ThemeProvider>
                        </div>
                    }


                </div>
            </Alert>
        </Snackbar>


    )
})

export default SnackbarPanel;
