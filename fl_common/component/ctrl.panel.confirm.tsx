/* eslint-disable jsx-a11y/anchor-is-valid */

import Modal from '@mui/material/Modal/index.js';
import { useState, forwardRef, useImperativeHandle, ReactNode, useRef, RefObject, } from 'react'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, PaperProps, ThemeProvider, useTheme } from '@mui/material/index.js';



import Draggable from 'react-draggable';

function PaperComponent(props: PaperProps) {
    const nodeRef = useRef<HTMLDivElement>(null);
    return (
        <Draggable
            nodeRef={nodeRef as RefObject<HTMLDivElement>}
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} ref={nodeRef} />
        </Draggable>
    );
}
const ConfirmPanel = forwardRef((props, ref) => {

    const [message, setMessage] = useState<string>();

    const [title, setTitle] = useState<string>();
    const [confirmHandler, setConfirmHandler] = useState<Function>();
    const [showContent, setShowContent] = useState<boolean>(false);



    const ShowCtrl = (title:string,msg: string, handler: Function) => {
        
        setMessage(msg)
        setTitle(title)
        setConfirmHandler(() => handler)
        setShowContent(true)
    }

    const CloseCtrl = () => {
        setShowContent(false)
    }
    const IsShow = () => {
        return showContent;
    }

    useImperativeHandle(ref, () => ({ ShowCtrl, CloseCtrl, IsShow }))

    return (
        <Dialog
            open={showContent}
            onClose={CloseCtrl}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
        >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                {title?title:"Confirm"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={CloseCtrl}>
                    Cancel
                </Button>
                <Button onClick={() => {
                     if (confirmHandler) {
                         confirmHandler()
                     }
                    CloseCtrl();
                }}>OK</Button>
            </DialogActions>
        </Dialog>

    )
})

export default ConfirmPanel;
