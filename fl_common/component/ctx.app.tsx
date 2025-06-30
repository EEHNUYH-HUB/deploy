import { createContext, SetStateAction, Dispatch, FC, useState, useContext, useEffect, PropsWithChildren } from 'react';
import { LoginType, UserInfo } from 'flowline_common_model/result/models';


import { MsalProvider } from '@azure/msal-react';

import APIClient from './restapi.client.js';
import FlowLineClient from './flowline.client.js';
import FlowLineSocketClient from './flowline.client.socket.js';
import { SnackbarProvider } from 'notistack';
import { IPublicClientApplication } from '@azure/msal-browser';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ConvertInputCtrlModelToKeyValue, ConvertKeyValueObjectToObject } from 'flowline_common_model/result/util.common';
import FlowLineUtils from './flowline.utils.js';



export type AppContextProps = {
    apiClient?: APIClient;
    flowLineClient?: FlowLineClient
    flowLineSocketClient?: FlowLineSocketClient;

    currentUser?: UserInfo;
    errorCode?: number;
    errorMessage?: string;

    setCurrentUser: Dispatch<SetStateAction<UserInfo | undefined>>;
    azureLogout: () => void;
    azureLogin: () => void;
    controlLogin: (params: any) => Promise<any>;
    controlLogout: () => Promise<void>;

};
const initAppContextPropsState = {
    setCurrentUser: () => { },
    loadAIList: () => { },
    azureLogout: () => { },
    azureLogin: () => { },
    controlLogin: async (params: any) => { },
    controlLogout: async () => { }
};

const AppContext = createContext<AppContextProps>(initAppContextPropsState);

type WithChildren = PropsWithChildren<{
    apiClient: APIClient;
    flowLineClient: FlowLineClient;

    flowLineSocketClient: FlowLineSocketClient;
}>;
export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppProvider: FC<WithChildren> = ({ apiClient, flowLineClient, flowLineSocketClient, children }) => {


    const [currentUser, setCurrentUser] = useState<UserInfo | undefined>(undefined);
    const [errorCode, setErrorCode] = useState<number>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [maslInstance, setMaslInstance] = useState<IPublicClientApplication>();
    const [currentLoginType, setCurrentLoginType] = useState<LoginType>()
    flowLineClient.onLoginSuccess = () => {
        InitCurrentInfo();
    };

    const InitCurrentInfo = async () => {



        var info: UserInfo | undefined = currentUser;

        if (currentLoginType === LoginType.Azure) {
            if (currentUser === null || currentUser === undefined) {
                var resp = await flowLineClient.InitAzureAuthInfo();

                if (resp && resp.errorCode === 200) {
                    info = resp.result as UserInfo;
                    setCurrentUser(info);

                }
                else if (resp && resp.errorCode === 401) {
                    setErrorCode(resp.errorCode)
                    setErrorMessage(resp.error)
                }
            }
            
        }
        else if(currentLoginType === LoginType.Control) {
            var resp2 = flowLineClient.IninControlInfo();
             if (resp2 && resp2.errorCode === 200) {
                    info = resp2.result as UserInfo;
                    setCurrentUser(info);

                }
        }
        flowLineSocketClient.Connection(info?.id ? info.id : "", info?.accessToken ? info?.accessToken : ""
            , info?.prjID ? info?.prjID : ""
            , info?.userToken ? info?.userToken : "");


    };

    const azureLogout = async () => {
        await flowLineClient.AzureLogout();
        setCurrentUser(undefined);
    };

    const azureLogin = async () => {
        await flowLineClient.AzureLogin();
    };

    const controlLogin = async (params: any) => {
        var inputs = ConvertKeyValueObjectToObject(ConvertInputCtrlModelToKeyValue(params))
        var resp = await flowLineClient?.LoginBizLogic(inputs)

        if (resp && resp.errorCode === 200) {
            var info = resp.result as UserInfo;
            setErrorCode(resp.errorCode)
            setCurrentUser(info);

        }
        else if (resp && resp.errorCode === 401) {
            setErrorCode(resp.errorCode)
            setErrorMessage(resp.error)
        }

        return resp;
    }
    const controlLogout = async () => {
        await flowLineClient.LogoutBizLogic();
        setCurrentUser(undefined);
    }
    useEffect(() => {
        init();
        function hideError(e: any) {
            if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                const resizeObserverErrDiv = document.getElementById(
                    'webpack-dev-server-client-overlay-div'
                );
                const resizeObserverErr = document.getElementById(
                    'webpack-dev-server-client-overlay'
                );
                if (resizeObserverErr) {
                    resizeObserverErr.setAttribute('style', 'display: none');
                }
                if (resizeObserverErrDiv) {
                    resizeObserverErrDiv.setAttribute('style', 'display: none');
                }
            }
        }
        window.addEventListener('error', hideError)
        return () => {
            window.addEventListener('error', hideError)
        }
    }, [])
    const init = async () => {
        await flowLineClient.InitLoginSetting()
        if (flowLineClient.logininfo?.LoginType === LoginType.Azure) {
            var instance = await flowLineClient.GetMsalInstance()
            setMaslInstance(instance)
        }

        setCurrentLoginType(flowLineClient.logininfo?.LoginType)
    }
    useEffect(() => {

        if (flowLineSocketClient && currentLoginType) {
            InitCurrentInfo();
        }



        return () => {

            if (flowLineSocketClient && flowLineSocketClient.IsConnected()) flowLineSocketClient.Disconnection();
        };
    }, [flowLineSocketClient, currentLoginType]);



    return (

        <>{(currentLoginType === LoginType.Azure && maslInstance) ?
            <MsalProvider instance={maslInstance}>
                <SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                    <AppContext.Provider
                        value={{
                            currentUser,
                            setCurrentUser,
                            apiClient,
                            flowLineClient,
                            flowLineSocketClient,
                            azureLogin,
                            azureLogout,
                            errorCode,
                            errorMessage,
                            controlLogin,
                            controlLogout
                        }}
                    >
                        <DndProvider backend={HTML5Backend}>
                            {children}
                        </DndProvider>
                    </AppContext.Provider>
                </SnackbarProvider>
            </MsalProvider> : <SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <AppContext.Provider
                    value={{
                        currentUser,
                        setCurrentUser,
                        apiClient,
                        flowLineClient,
                        flowLineSocketClient,
                        azureLogin,
                        azureLogout,
                        errorCode,
                        errorMessage,
                        controlLogin,
                        controlLogout
                    }}
                >
                    <DndProvider backend={HTML5Backend}>
                        {children}
                    </DndProvider>
                </AppContext.Provider>
            </SnackbarProvider>

        }</>
    );
};
