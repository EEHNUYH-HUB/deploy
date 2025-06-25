import { forwardRef, SetStateAction, useImperativeHandle, useState } from 'react'
import Backdrop from '@mui/material/Backdrop/index.js';
import CircularProgress from '@mui/material/CircularProgress/index.js';

const LoadingPanel = forwardRef(({},ref) => {
    
    const [loadPanelVisible,setLoadPanelVisible] = useState<boolean>(false)
    const Show = ()=>{
        setLoadPanelVisible(true)
    }
    const Close =()=>{
        setLoadPanelVisible(false)
    }
    useImperativeHandle(ref, () => ({ Show, Close }))
    return (
        //sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        <Backdrop
            sx={{ color: '#fff'
                //, backdropFilter: 'blur(5px)'
                , zIndex: 1301 }}
            open={loadPanelVisible} >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
})

export default  LoadingPanel 