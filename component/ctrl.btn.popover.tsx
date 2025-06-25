import { Button, IconButton, Popover } from "@mui/material/index.js";
import clsx from "clsx";
import { FlowLineStyle } from "./flowline.style.js";
import { forwardRef, Fragment, ReactNode, useImperativeHandle, useState } from "react";


export type popoverRefType = {    
    CloseCtrl: Function;

};

export const ButtonPopover = forwardRef(({ className, popoverClassName, label, children }: { className?: string, popoverClassName?:string,label?: ReactNode, children?: ReactNode }, ref) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);

    };

    const CloseCtrl = () => {
        handleClose()
    }


    useImperativeHandle(ref, () => ({ CloseCtrl }))


    return (
        <Fragment>

            <div className={clsx(className)} >
                <Button size="small" variant='text'  onClick={handleClick}>
                    {label}
                </Button>
            </div>


            <Popover className={clsx('ms-5')}

                open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <div className={clsx('p-4',popoverClassName)}
                    style={{ backgroundColor: FlowLineStyle.ContentBackgroundColor }}
                >
                    {children}
                </div>
            </Popover>
        </Fragment>
    )
})

export const IConButtonPopover = forwardRef(({ className,popoverClassName, label, children }: { className?: string, popoverClassName?:string,label?: ReactNode, children?: ReactNode }, ref) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);

    };


    const CloseCtrl = () => {
        handleClose()
    }


    useImperativeHandle(ref, () => ({ CloseCtrl }))
    return (
        <Fragment>

            <div className={clsx(className)} >
                <IconButton size="small" onClick={handleClick}>
                    {label}
                </IconButton>
            </div>


            <Popover className={clsx('ms-5')}

                open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <div className={clsx('p-4',popoverClassName)}
                    style={{ backgroundColor: FlowLineStyle.ContentBackgroundColor }}
                >
                    {children}
                </div>
            </Popover>
        </Fragment>
    )
})
