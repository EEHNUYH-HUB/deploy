import { FC, useState, PropsWithChildren, createContext, useContext, useEffect, Dispatch, SetStateAction } from 'react';

import { ActionModel, Dictionary, MapValue } from 'flowline_common_model/src/models';



import FlowLineUtils from './flowline.utils.js';
import { useAppContext } from './ctx.app.js';
import { Box, CircularProgress } from '@mui/material';
//import { RootHeightEntity } from './ui.models.js';


export type FuncMapContextProps = {
    mapValue: MapValue
    actionModels: Dictionary<ActionModel>
    loading: boolean;
    chatLoading:boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setChatLoading: Dispatch<SetStateAction<boolean>>;
    //rootHeight?:RootHeightEntity
};
const initFuncMapContextPropsState = {
    mapValue: {},
    actionModels:{},
    loading:false,
    chatLoading:false,
    setLoading: () => {},
    setChatLoading: () => {}

};
const FuncMapContext = createContext<FuncMapContextProps>(initFuncMapContextPropsState);

export const useFuncMapContext = () => {
    return useContext(FuncMapContext);
};

type WithChildren = PropsWithChildren<{
    mapValue: MapValue
    //,rootHeight?:RootHeightEntity
    ,actionModels:Dictionary<ActionModel>

    
}>;

export const FuncMapProvider: FC<WithChildren> = ({ mapValue
    //,rootHeight
    ,actionModels, children }) => {

        const [loading, setLoading] = useState<boolean>(false)
        const [chatLoading, setChatLoading] = useState<boolean>(false)
    

    return (


        <FuncMapContext.Provider value={
            {
                mapValue, actionModels,loading,setLoading,chatLoading,setChatLoading
            }}>

            {children}
           
        </FuncMapContext.Provider>



    );
};
