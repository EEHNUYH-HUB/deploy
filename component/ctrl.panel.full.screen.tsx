/* eslint-disable jsx-a11y/anchor-is-valid */

import { Fragment, ReactNode, forwardRef, useImperativeHandle, useState } from "react";

import { AppBar,  Dialog, IconButton, Slide, ThemeProvider, Toolbar, useTheme } from  '@mui/material/index.js';
import { customTheme, FlowLineStyle } from './flowline.style.js';
import {Close} from '@mui/icons-material';
import { PopupConfig } from "./ui.models.js";
import { TransitionProps } from "@mui/material/transitions/index.js";
import clsx from "clsx";

const toAbsoluteUrl = (pathname: string) => process.env.PUBLIC_URL + pathname


const FullScreenPanel = forwardRef((props, ref) => {
  const [config, setConfig] = useState<PopupConfig>();
    const [title, setTitle] = useState<string>();
    const [desc, setDesc] = useState<string>();
    const [children, setChildren] = useState<ReactNode>();
    const [showContent, setShowContent] = useState<boolean>(false);
    const outerTheme = useTheme();
    
const Transition = forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="left" ref={ref} {...props} />;
  });

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

    useImperativeHandle(ref, () => ({ ShowCtrl, CloseCtrl,IsShow }))
    return (
<Fragment>
  {showContent &&
   
        <Dialog
        fullScreen
        open={showContent}
        sx={{zIndex:1190}}
        TransitionComponent={Transition}
      >
         
            
              <AppBar sx={{
                position: 'relative'
                , backgroundColor: FlowLineStyle.ContentBackgroundColor
                , color: FlowLineStyle.FontColor
                , borderBottom: '1px solid '
                , borderBottomColor: FlowLineStyle.HeaderBorderColor
                , boxShadow: "none"
                , paddingLeft:0
                , paddingRight:0
                , height:"58px"
              }}>
                <Toolbar className={clsx(config?.headerContainer?config.headerContainer:"",'px-0')} variant="dense"  >
                {/* style={{ backgroundColor: FlowLineStyle.TabHeaderBackgroundColor }}> */}
                
                {config?.useCloseBtn !== false &&
                  <IconButton
                    
                    onClick={CloseCtrl}
                    
                    className="ms-3 mt-3 "
                  >
                    <Close viewBox="-5 -5 32 32"  ></Close>
                  </IconButton>
}

                  <img

                    alt='Logo'
                    src={toAbsoluteUrl(`/media/logos/logo.${FlowLineStyle.Theme}.png`)}
                    className='h-45px logo ms-4'
                  />
                
                  <div className='d-flex align-items-stretch justify-content-between flex-lg-grow-1'>
                    <div className='d-flex ms-4  mt-2'>
                      <div className='d-none d-md-flex flex-column align-items-start justify-content-center mt-2'>
                        <span style={{ color: FlowLineStyle.GridTitleColor }} className='fs-7  lh-1 mb-2'>{title}</span>
                        <span style={{ color: FlowLineStyle.GridSubColor }} className='fs-8  lh-1 '> {desc}</span>
                      </div>
                    </div>
                    {config?.headerCtrl &&
                      <div className='d-flex flex-stack justify-content-end' >
                        {config?.headerCtrl && config.headerCtrl}
                      </div>
                    }
                  </div>
                </Toolbar>
              </AppBar>
            
            {children && showContent &&

              <ThemeProvider theme={customTheme(outerTheme)}>

                <div id='fullscreenmain' className="hover-scroll-overlay-y" style={{ backgroundColor: FlowLineStyle.ContentBackgroundColor, height: "calc(100vh - 50px)" }}>
                  <div className={clsx(config?.contentClassName?config.contentClassName:"pt-8 px-4",config?.contentContainer ? config.contentContainer : "", "h-100")} >
                    {children}
                  </div>
                </div>
              </ThemeProvider>

            }

          </Dialog>

        }
      </Fragment>
    )
})

export default FullScreenPanel;
