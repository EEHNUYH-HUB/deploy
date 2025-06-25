/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useEffect, useState } from 'react';
import clsx from 'clsx';
import { FlowLineStyle } from './flowline.style.js';
import { JSONTree } from 'react-json-tree';

const lightTheme = {
    base00: '#eeeeee', // Background color
    base01: '#f0f0f0', // Lighter background
    base02: '#d6d6d6', // Border color
    base03: '#8e8e8e', // Comment color
    base04: '#4d4d4d', // Default text color
    // base05: '#000000', // Main text color
    // nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
    //     style: {
    //         textTransform: expanded ? 'uppercase' : style.textTransform,
    //         fontSize:'12px'
    //     },
    //   }),
    nestedKeyLabel: {
        fontSize:FlowLineStyle.FontSize
    },
    value: {
        fontSize:FlowLineStyle.FontSize
    },

  };
  
  const darkTheme = {
    base00: '#002b36', // Background color
    base01: '#252525', // Lighter background
    base02: '#333333', // Border color
    base03: '#666666', // Comment color
    base04: '#aaaaaa', // Default text color
    // base05: '#ffffff', // Main text color
    // nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
    //     style: {
    //         textTransform: expanded ? 'uppercase' : style.textTransform,
    //         fontSize:'12px'
    //     },
    //   }),
    nestedKeyLabel: {
        fontSize:FlowLineStyle.FontSize
    },
    value: {
        fontSize:FlowLineStyle.FontSize
    },

  };

const JsonViewer = ({value}:{value:any})=>{

    const [jsonValue,setJsonValue] = useState<any>();
    const [isBinding,setIsBinding] = useState<boolean>(false);
    const [jsonStyle] = useState<any>(FlowLineStyle.Theme === "light"? lightTheme:darkTheme)
    useEffect(()=>{
        Binding();
    },[value])

    const Binding = ()=>{
        if(value){
            var valueType = value.constructor;
            if (valueType === Object || valueType === Array) {
                setJsonValue(value)
            }   
            else{
                try{
                    setJsonValue(JSON.parse(value));
                }
                catch{

                }
            }
            
            setIsBinding(true);
        }

    }

    return (
        <div className={clsx( 'px-4 py-2 pb-3 rounded', " w-100")} style={{backgroundColor:jsonStyle.base00}}  >
            {isBinding &&
                <Fragment>
                    {jsonValue &&  <JSONTree data={jsonValue} 
                    invertTheme={false}  theme={jsonStyle} />}
                    {!jsonValue && value && <span className='fs-7'>{value}</span>}
                </Fragment>
            }
        </div>
    )

}

export { JsonViewer };
