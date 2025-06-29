
import { Fragment, useEffect, useState } from 'react';
import { FlowLineStyle } from './flowline.style.js';
import { JoinObj, SvgRect, GetJoinDrawObj, Get2PathCurveType, SvgObj, SvgRectSubObj } from './svg.common.js';


export const GroupRectCtrl = (props: {onClick:Function, rect: SvgRect }) => {
    const { rect ,onClick} = props;


    const [transform, setTransform] = useState<string>();
    const [transform2, setTransform2] = useState<string>();

    useEffect(() => { Binding() }, [rect])

    const [margin] = useState<number>(30)
    const Binding = () => {

        if (rect && rect.Width && rect.Height) {
            setTransform(
                `translate(${rect.X - margin},${rect.Y - margin}) scale(${rect.ScaleX},${rect.ScaleY}) rotate(${rect.Rotate},${rect.Width / 2},${rect.Height / 2})`
            );

            setTransform2(
                `translate(${rect.X - margin},${rect.Y - margin-22}) scale(${rect.ScaleX},${rect.ScaleY}) rotate(${rect.Rotate},30,30)`
            );
        }

    }
    return (
        <>
            {rect && <>
                <g transform={transform2} onClick={()=>{
onClick(rect.Tag)
                }
                    } cursor="pointer">
                    <SettingSvg />
                </g>
                <g transform={transform}>
                    <text fill={FlowLineStyle.SvgTitleColor} stroke="transparent"
                        x={25} y={-10} textAnchor="left" fontSize={10.5}>Loop Zone</text>
                          
                    <rect width={rect.Width + margin * 2} opacity='0.5' rx="10" height={rect.Height + margin * 2} stroke={FlowLineStyle.IConColor} fill='none' strokeDasharray={3}></rect>
                </g>
            </>}
        </>
    );
};



const JoinVirtualLine  = (props: { joinObj: JoinObj, displayName?: string }) => {
    const { joinObj, displayName } = props;
    const [transform, setTransform] = useState<string>();
    useEffect(() => {
        if (joinObj.StartJoinPoint && joinObj.EndJoinPoint) {
            var obj: any = GetJoinDrawObj(joinObj.StartJoinPoint, joinObj.EndJoinPoint);
            setTransform(`translate(${obj.cX},${obj.cY}) `)
        }
    }, [joinObj.Path])
    return (
        <g>
            <path d={joinObj.Path} stroke={joinObj.StrokeColor}  fill={joinObj.FillColor} markerEnd={"url(#Triangle)"}  strokeWidth={0.3} strokeDasharray={4} strokeDashoffset={10} />
            <g transform={transform}    >
                {displayName &&
                    <text fill={joinObj.StrokeColor} stroke={joinObj.FillColor}
                        x={0} y={0} textAnchor="middle" fontSize={10.5}>{displayName}</text>
                }
            </g>
        </g>
    )
}
const JoinDotLine = (props: { joinObj: JoinObj, displayName?: string }) => {
    const { joinObj, displayName } = props;
    const [transform, setTransform] = useState<string>();
    useEffect(() => {
        if (joinObj.StartJoinPoint && joinObj.EndJoinPoint) {
            var obj: any = GetJoinDrawObj(joinObj.StartJoinPoint, joinObj.EndJoinPoint);
            setTransform(`translate(${obj.cX},${obj.cY}) `)
        }
    }, [joinObj.Path])
    return (
        <g>
            <path d={joinObj.Path} stroke={joinObj.StrokeColor} fill={joinObj.FillColor} strokeWidth="0.5" strokeDasharray={3} />
            <g transform={transform}    >
                {displayName &&
                    <text fill={joinObj.StrokeColor} stroke={joinObj.FillColor}
                        x={0} y={0} textAnchor="middle" fontSize={10.5}>{displayName}</text>
                }
            </g>
        </g>
    )
}


const JoinLine = (props: { joinObj: JoinObj, displayName?: string }) => {
    const { joinObj, displayName } = props;
    const [transform, setTransform] = useState<string>();
    useEffect(() => {
        if (joinObj.StartJoinPoint && joinObj.EndJoinPoint) {
            var obj: any = GetJoinDrawObj(joinObj.StartJoinPoint, joinObj.EndJoinPoint);
            setTransform(`translate(${obj.cX},${obj.cY}) `)
        }
    }, [joinObj.Path])
    return (
        <g>
            <path d={joinObj.Path} stroke={joinObj.StrokeColor} fill={joinObj.FillColor} strokeWidth="0.5"
                markerEnd={joinObj.EndType}  />


            <g transform={transform}    >
                {displayName &&
                    <text fill={joinObj.StrokeColor} stroke={joinObj.FillColor}
                        x={0} y={0} textAnchor="middle" fontSize={10.5}>{displayName}</text>
                }
            </g>
        </g>
    )
}

const SettingSvg = () => {
    return (<svg width={16} height={16} viewBox="0 0 24 24" fill="none"  >
        <path d="M14.1361 3.36144C14.0928 2.92777 14.0711 2.71093 13.9838 2.54161C13.8728 2.32656 13.6877 2.15902 13.4627 2.07005C13.2855 2 13.0676 2 12.6318 2H11.3681C10.9324 2 10.7145 2 10.5374 2.07001C10.3123 2.15898 10.1271 2.32658 10.0162 2.5417C9.9289 2.71098 9.90722 2.92776 9.86387 3.36131C9.78181 4.18195 9.74077 4.59227 9.56907 4.81742C9.35113 5.10319 8.99661 5.25003 8.64044 5.20207C8.35982 5.16427 8.04061 4.9031 7.4022 4.38076C7.06481 4.10472 6.89612 3.9667 6.71463 3.90872C6.48414 3.8351 6.23478 3.84753 6.01277 3.94373C5.83795 4.01947 5.68385 4.17357 5.37565 4.48177L4.48233 5.37509C4.17403 5.68339 4.01988 5.83754 3.94413 6.01243C3.848 6.23438 3.83557 6.48364 3.90914 6.71405C3.96711 6.89561 4.10516 7.06435 4.38128 7.40182C4.90385 8.04052 5.16514 8.35987 5.20287 8.64066C5.2507 8.99664 5.10395 9.35092 4.81842 9.56881C4.59319 9.74068 4.18264 9.78173 3.36155 9.86384C2.92777 9.90722 2.71088 9.92891 2.54152 10.0163C2.32654 10.1272 2.15905 10.3123 2.07008 10.5372C2 10.7144 2 10.9324 2 11.3683V12.6318C2 13.0676 2 13.2855 2.07005 13.4627C2.15902 13.6877 2.32656 13.8728 2.54161 13.9838C2.71093 14.0711 2.92776 14.0928 3.36143 14.1361C4.1823 14.2182 4.59273 14.2593 4.81792 14.4311C5.10357 14.649 5.25037 15.0034 5.20247 15.3594C5.16471 15.6402 4.90351 15.9594 4.3811 16.5979C4.10511 16.9352 3.96711 17.1039 3.90913 17.2854C3.8355 17.5159 3.84794 17.7652 3.94414 17.9873C4.01988 18.1621 4.17398 18.3162 4.48217 18.6243L5.37561 19.5178C5.6838 19.826 5.8379 19.9801 6.01272 20.0558C6.23474 20.152 6.4841 20.1645 6.71458 20.0908C6.89607 20.0329 7.06474 19.8949 7.40208 19.6189C8.04059 19.0964 8.35985 18.8352 8.64057 18.7975C8.99663 18.7496 9.35101 18.8964 9.56892 19.182C9.74072 19.4072 9.78176 19.8176 9.86385 20.6385C9.90722 21.0722 9.92891 21.2891 10.0162 21.4584C10.1272 21.6734 10.3123 21.841 10.5373 21.9299C10.7145 22 10.9324 22 11.3682 22H12.6316C13.0676 22 13.2856 22 13.4628 21.9299C13.6877 21.8409 13.8728 21.6735 13.9837 21.4585C14.0711 21.2891 14.0928 21.0722 14.1362 20.6383C14.2183 19.8173 14.2593 19.4068 14.4311 19.1816C14.649 18.896 15.0034 18.7492 15.3595 18.7971C15.6402 18.8348 15.9594 19.096 16.5979 19.6184C16.9352 19.8944 17.1039 20.0324 17.2854 20.0904C17.5159 20.164 17.7652 20.1516 17.9873 20.0554C18.1621 19.9796 18.3162 19.8255 18.6243 19.5174L19.5179 18.6238C19.826 18.3157 19.98 18.1617 20.0558 17.9869C20.152 17.7648 20.1645 17.5154 20.0908 17.2848C20.0328 17.1034 19.8949 16.9348 19.619 16.5976C19.0968 15.9593 18.8357 15.6402 18.7979 15.3596C18.7499 15.0034 18.8967 14.6489 19.1825 14.4309C19.4077 14.2592 19.818 14.2182 20.6386 14.1361C21.0722 14.0928 21.289 14.0711 21.4583 13.9838C21.6734 13.8729 21.841 13.6877 21.93 13.4626C22 13.2855 22 13.0676 22 12.6319V11.3682C22 10.9324 22 10.7145 21.9299 10.5373C21.841 10.3123 21.6734 10.1272 21.4584 10.0162C21.2891 9.92891 21.0722 9.90722 20.6385 9.86385C19.8176 9.78176 19.4072 9.74072 19.182 9.56893C18.8964 9.35102 18.7496 8.99662 18.7975 8.64056C18.8352 8.35984 19.0964 8.0406 19.6188 7.4021C19.8948 7.06478 20.0328 6.89612 20.0908 6.71464C20.1644 6.48415 20.152 6.23478 20.0558 6.01275C19.98 5.83794 19.8259 5.68385 19.5178 5.37567L18.6243 4.4822C18.3161 4.17402 18.162 4.01994 17.9872 3.94419C17.7652 3.84798 17.5158 3.83555 17.2853 3.90918C17.1038 3.96716 16.9352 4.10515 16.5979 4.38113C15.9594 4.90352 15.6402 5.16472 15.3595 5.20248C15.0034 5.25038 14.649 5.10358 14.4311 4.81793C14.2593 4.59274 14.2182 4.1823 14.1361 3.36144Z"
            fill={FlowLineStyle.IConColor} fillOpacity="0.7" />
        <circle cx="12" cy="12" r="3" fill="#2A4157" fillOpacity="0.7" />
    </svg>)
}
const JoinLineIncludeICon = (props: { joinObj: JoinObj, onClick: Function, displayName?: string,subDesc?:string }) => {
    const { displayName, joinObj, onClick,subDesc } = props;
    const [startLinePath, setStartLinePath] = useState<string>();
    const [endLinePath, setEndLinePath] = useState<string>();
    const [transform, setTransform] = useState<string>();

    useEffect(() => {
        if (joinObj.StartJoinPoint && joinObj.EndJoinPoint) {


            var size = 32;
            var paths = Get2PathCurveType(joinObj.StartJoinPoint, joinObj.EndJoinPoint, size)
            setStartLinePath(paths[0])
            setEndLinePath(paths[1])
            setTransform(paths[2])

        }
    }, [joinObj.Path,joinObj.IsSelected])

    return (
        <g onClick={() => { joinObj.IsSelected = true;if (onClick) onClick(joinObj) }} cursor="pointer">
            
            
            <path
            
            d={joinObj.Path} stroke={joinObj.StrokeColor} fill={joinObj.FillColor} strokeWidth="0.5" markerEnd={joinObj.EndType}  />
            

            <g transform={transform}    >
                <rect x={-4} y={-4} width={24} height={24} fill={'none'} stroke={joinObj.IsSelected?"#96C6DE":"none"} opacity={1} ></rect>
                <SettingSvg />
                {displayName &&
                    <text    fill={joinObj.StrokeColor} stroke={joinObj.FillColor}
                        x={8} y={30} textAnchor="middle" fontSize={10.5}>{displayName}</text>
                }
                {subDesc &&
                    <text    fill={joinObj.StrokeColor} stroke={joinObj.FillColor}
                        x={8} y={displayName?45:30} textAnchor="middle" fontSize={10.5}>{subDesc}</text>}
            </g>
            


        </g>
    )
}

export const JoinFactory = (props: { joinObj: JoinObj, onClick: Function }) => {
    const { joinObj, onClick } = props;
    const [path, setPath] = useState<string>();
    const [type, setType] = useState<string>()
    const [displayName, setDisplayName] = useState<string>();
    const [subDesc, setSubDesc] = useState<string>();
    useEffect(() => {
        if (joinObj) {
            joinObj.OnChaged = () => {
                Binding();
            };

            Binding();
        }
    }, [joinObj]);
    const Binding = () => {
        setPath(joinObj.Path);
        setType(joinObj.JoinType);
        setDisplayName(joinObj.DisplayName);
        setSubDesc(joinObj.SubDesc);
    }
    return (
        <>
            {joinObj && type === 'line' && <JoinLine joinObj={joinObj} displayName={displayName} />}
            {joinObj && type === 'line2' && <JoinLineIncludeICon joinObj={joinObj} displayName={displayName} subDesc={subDesc} onClick={() => 
                {
                     if (onClick) onClick(joinObj); }} />}
            {joinObj && type === 'dotline' && <JoinDotLine joinObj={joinObj} displayName={displayName} />}
            {joinObj && type === 'virtualline' && <JoinVirtualLine joinObj={joinObj} displayName={displayName} />}
            

        </>
    );

};



export const MarkerCtrl = () => {
  
    return (
        <svg><defs>
            <marker id='Triangle' viewBox='0 0 16 16' refX='5' refY='5' markerUnits='strokeWidth' markerWidth='16' markerHeight='16' orient='auto'>
                <path d='M 0 0 L 10 5 L 0 10 z' fill={FlowLineStyle.IConColor} />
            </marker>
            <marker id='TriangleRed' viewBox='0 0 16 16' refX='5' refY='5' markerUnits='strokeWidth' markerWidth='16' markerHeight='16' orient='auto'>
                <path d='M 0 0 L 10 5 L 0 10 z' fill={'red'} />
            </marker>
            <marker id='TriangleBlue' viewBox='0 0 16 16' refX='5' refY='5' markerUnits='strokeWidth' markerWidth='16' markerHeight='16' orient='auto'>
                <path d='M 0 0 L 10 5 L 0 10 z' fill={'blue'} />
            </marker>
            <marker id='Circle' viewBox='0 0 16 16' refX='6' refY='6' markerUnits='strokeWidth' markerWidth='12' markerHeight='12' orient='auto'>
                <circle cx='6' cy='6' r='4' fill={FlowLineStyle.IConColor} />
            </marker>
        </defs></svg>
    );

};


export const SvgPickerCtrlCircle = (props: { subItem: SvgRectSubObj }) => {
    const { subItem } = props;
    const [color, setColor] = useState<string>('#186083');
    useEffect(() => {
        if (subItem && subItem.F) {
            setColor(subItem.IsDown ? '#186083' : subItem.F)
        }
    }, [subItem, subItem.IsDown])


    return (<g onMouseEnter={() => {
        setColor('#186083')
    }}
        onMouseLeave={() => {
            setColor('#186083')
            if (subItem && subItem.F) {
                setColor(subItem.IsDown ? '#186083' : subItem.F)
            }
        }}
        onMouseDown={() => {
            subItem.IsDown = true;
            if (subItem && subItem.F) {
                setColor(subItem.IsDown ? '#186083' : subItem.F)
            }
        }} >
        <circle
            cx={subItem.cX}
            cy={subItem.cY}
            r={subItem.R}
            strokeWidth={1}

            stroke={color}
            fill={color}
        ></circle>
    </g>)
}
export const DefaultPicker = (props: { svgObj: SvgObj }) => {
    const { svgObj } = props;

    const [selected, setSelected] = useState<boolean>(false);
    useEffect(() => {
        if (svgObj) {
            svgObj.OnSelected = (isSelected: boolean) => {
                setSelected(isSelected);
            };

            setSelected(svgObj.IsSelected === true);
        }
    }, [svgObj]);

    return (
        <g>
            {svgObj && selected && svgObj.Rect && (
                <g>
                    <rect width={svgObj.Rect.Width} opacity='1' height={svgObj.Rect.Height} stroke='#96C6DE' fill='none'></rect>

                    {svgObj.Rect &&
                        svgObj.Rect.SubObjs &&
                        svgObj.Rect.SubObjs.map((subItem, subIndex) => {
                            return (
                                <SvgPickerCtrlCircle key={`subRect${subIndex}`} subItem={subItem} />
                            );
                        })}



                </g>
            )}
        </g>
    );
};

export const SimplePicker = (props: { svgObj: SvgObj }) => {
    const { svgObj } = props;

    const [selected, setSelected] = useState<boolean>(false);
    useEffect(() => {
        if (svgObj) {
            svgObj.OnSelected = (isSelected: boolean) => {
                setSelected(isSelected);
            };

            setSelected(svgObj.IsSelected === true);
        }
    }, [svgObj]);

    return (
        <g>
            {svgObj && selected && svgObj.Rect && (
                <g>
                    <rect rx={40} ry={40} width={svgObj.Rect.Width} opacity='1' height={svgObj.Rect.Height} stroke='#96C6DE' fill='none'></rect>

                    {svgObj.Rect &&
                        svgObj.Rect.SubObjs &&
                        svgObj.Rect.SubObjs.map((subItem, subIndex) => {
                            return (
                                <SvgPickerCtrlCircle key={`subRect${subIndex}`} subItem={subItem} />
                            );
                        })}



                </g>
            )}
        </g>
    );
};

export const SelectPicker = (props: { svgObj: SvgObj }) => {
    const { svgObj } = props;

    const [selected, setSelected] = useState<boolean>(false);
    useEffect(() => {
        if (svgObj) {
            svgObj.OnSelected = (isSelected: boolean) => {
                setSelected(isSelected);
            };

            setSelected(svgObj.IsSelected === true);
        }
    }, [svgObj]);

    return (
        <g>
            {svgObj && selected && svgObj.Rect && (
                <g>
                    <rect width={svgObj.Rect.Width} opacity='1' height={svgObj.Rect.Height} stroke='#96C6DE' fill='none'></rect>

                   

                </g>
            )}
        </g>
    );
};

const SvgPickerCtrlPlus = (props: { subItem: SvgRectSubObj,svgObj: SvgObj }) => {
    const { subItem ,svgObj} = props;
    const [color, setColor] = useState<string>('#186083');
    useEffect(() => {
        if (subItem && subItem.F) {
            setColor(subItem.IsDown ? '#186083' : subItem.F)
        }
    }, [subItem, subItem.IsDown])


    return (
        <svg x={subItem.Type==="BC"?subItem.cX - 8:subItem.cX + 16  } y={subItem.Type==="RC"?subItem.cY - 8:subItem.cY + 16} width={16} height={16}
            fill={color} viewBox='0 0 16 16' stroke='none'
            onMouseEnter={() => {

                svgObj.IsSupportDrag = false;
                setColor('#186083')
            }}
            onMouseLeave={() => {
                svgObj.IsSupportDrag = true;
                setColor('#186083')
                if (subItem && subItem.F) {
                    setColor(subItem.IsDown ? '#186083' : subItem.F)
                }
            }}
            onMouseDown={() => {
                
                subItem.IsDown = true;
                if (subItem && subItem.F) {
                    setColor(subItem.IsDown ? '#186083' : subItem.F)
                }
            }} >


            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
        </svg>)
}

const SvgPickerCtrlMinus = (props: { subItem: SvgRectSubObj,svgObj: SvgObj }) => {
    const { subItem ,svgObj} = props;
    const [color, setColor] = useState<string>('#186083');
    useEffect(() => {
        if (subItem && subItem.F) {
            setColor(subItem.IsDown ? '#186083' : subItem.F)
        }
    }, [subItem, subItem.IsDown])


    return (
        <svg x={subItem.Type==="TC"?subItem.cX - 8:subItem.cX - 32  } y={subItem.Type==="LC"?subItem.cY - 8:subItem.cY - 32} width={16} height={16}
            fill={color} viewBox='0 0 16 16' stroke='none'
            onMouseEnter={() => {
                svgObj.IsSupportDrag = false;
                setColor('#186083')
            }}
            onMouseLeave={() => {
                svgObj.IsSupportDrag = true;
                setColor('#186083')
                if (subItem && subItem.F) {
                    setColor(subItem.IsDown ? '#186083' : subItem.F)
                }
            }}
            onMouseDown={() => {
                
                subItem.IsDown = true;
                if (subItem && subItem.F) {
                    setColor(subItem.IsDown ? '#186083' : subItem.F)
                }
            }} >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z" />




        </svg>)
}
export const ResizePicker = (props: { svgObj: SvgObj }) => {
    const { svgObj } = props;

    const [selected, setSelected] = useState<boolean>(false);
    useEffect(() => {
        if (svgObj) {
            svgObj.OnSelected = (isSelected: boolean) => {
                setSelected(isSelected);
            };
            
            setSelected(svgObj.IsSelected === true);
        }
    }, [svgObj,svgObj.IsSupportDrag]);

    return (
        <g>
            {svgObj && selected && svgObj.Rect && svgObj.Rect.Width && svgObj.Rect.Height && (
                <g>
                    <rect width={svgObj.Rect.Width} opacity='1' height={svgObj.Rect.Height} stroke='#96C6DE' fill='none'></rect>

                

                    {svgObj.Rect &&
                        svgObj.Rect.SubObjs &&
                        svgObj.Rect.SubObjs.map((subItem, subIndex) => {
                            return (
                                <Fragment  key={`subRect${subIndex}`}>
                                    {(subItem.Type === "RC") || (subItem.Type === "BC")?  
                                    <SvgPickerCtrlPlus svgObj={svgObj} subItem={subItem} />:<SvgPickerCtrlMinus svgObj={svgObj} subItem={subItem} />}
                                     <SvgPickerCtrlCircle  subItem={subItem} />
                                </Fragment>
                            );
                        })}

                </g>
            )}
        </g>
    );
};

