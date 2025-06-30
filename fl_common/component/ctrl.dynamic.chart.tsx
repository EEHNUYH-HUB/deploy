/* eslint-disable jsx-a11y/anchor-is-valid */

import { DynamicViewProps } from "./ui.models"
import { FunctionMap, OutputCtrlModel } from 'flowline_common_model/result/models'
import { Fragment, useEffect, useState } from 'react';
import { scaleOrdinal } from 'd3-scale';


import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,  Bar,  Brush, ComposedChart, Area, PieChart, Pie, Cell, Sector } from 'recharts';
import { FlowLineStyle } from "./flowline.style.js";
import { NumberToNumberStyle } from "flowline_common_model/result/util.common";
import clsx from "clsx";

const colorScale = scaleOrdinal(['#8884d8', '#82ca9d', '#ffc658', '#ff8042']);
//const colorScale = scaleOrdinal(['#6a0dad', '#2a9d8f', '#e76f51', '#f4a261', '#264653']);


const DynamicChartControl = (props: DynamicViewProps) => {


    const { functionMap, value, onSelected, pageBorder, controlHeight } = props;




    const [pieOutputs,setPieOuputs] = useState<OutputCtrlModel[][]>();
    const [barOutputs,setBarOutputs] = useState<OutputCtrlModel[]>();



    useEffect(() => {
        if (functionMap) {

            Init();
        }
    }, [functionMap, value]);

    const Init = async () => {

        if (value) {

            if (functionMap.UIViewSetting?.OutputCtrls) {

             
                var bars = [];
                var pies:OutputCtrlModel[][] = [];
                for (var i in functionMap.UIViewSetting?.OutputCtrls) {
                    var col: OutputCtrlModel = functionMap.UIViewSetting?.OutputCtrls[i];

                    if(col.COL_BAR_TYPE === "Pie"){

                        if(col.COL_GROUP_NAME && false){//그룹기능 나중에 작업
                            var isFind = false
                            for(var i in pies){
                                var arry = pies[i]
                                var fObj = arry.find(x=>x.COL_GROUP_NAME === col.COL_GROUP_NAME)
                                if(fObj){
                                    isFind = true;
                                    arry.push(col)
                                    break;
                                }
                            }
                            if(!isFind){
                                pies.push([col])    
                            }
                        }
                        else{
                            pies.push([col])
                        }
                        
                    }
                    else{
                        bars.push(col)
                    }


                  
                }

                setPieOuputs(pies)
                
                setBarOutputs(bars);


            }
        }

        if (value && functionMap.UIViewSetting?.OutputCtrls) {
            for (var i in value) {
                var vObj = value[i];
                
                if (vObj) {
                    for (var j in functionMap.UIViewSetting?.OutputCtrls) {

                        var newkey = functionMap.UIViewSetting?.OutputCtrls[j].COL_DISPLAY_NAME
                        if (newkey) {
                            var orgKey = functionMap.UIViewSetting?.OutputCtrls[j].COL_COLUMN_NAME
                            vObj[newkey] = vObj[orgKey];
                        }
                    }

                }
            }
        }


        if (value && value.length > 0 && functionMap && functionMap.UIViewSetting?.SelectFirstItemWhenDataLoad) {
            OnSelectItem(value[0])
        }
    }

   

    const OnSelectItem = (item: object) => {
        if (onSelected) {
            
            onSelected(item);
        }
    }


    return (
        <div className={clsx(functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical"?"":"d-flex" )} style={{ width: '100%', height: controlHeight ? controlHeight : 300 }}>
            {functionMap.UIViewSetting?.OutputCtrls && value &&
                <>

                    {barOutputs && barOutputs.length > 0 &&
                        <ReactsBar
                            onSelected={OnSelectItem}
                            value={value} functionMap={functionMap} outputs={barOutputs} />}
                    {pieOutputs && pieOutputs.length > 0 &&
                        <ReactPie onSelected={OnSelectItem} value={value} functionMap={functionMap} output2Arry={pieOutputs} />}
                        </>
                
            }

        </div>

    );
};

const renderActiveShape = (props:any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
  
    
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload["col_chart_display_id"]} 
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill={FlowLineStyle.FontColor}>
            {`${payload["display"]?payload["display"]:""} ${value}`} 
            </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill={FlowLineStyle.FontColor}>
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

const ReactPie =  ({ value,output2Arry, functionMap,onSelected }: { onSelected?:Function,value?: any,output2Arry:OutputCtrlModel[][], functionMap: FunctionMap }) => {

    
    

    const  [activeIndex,setActiveIndex] = useState<number>(0);
    const onPieEnter = (_:any, index:number) => {
        setActiveIndex( index);
      };

      const renderLegendText = (value: string, entry: any, index: number) => {
        
        return `${entry.payload["col_chart_display_id"]} ${entry.payload["display"]}`
        
      };

      const onClickEvent = (data: any) => {
        if (onSelected) {
            onSelected(data); // Pass chartType to differentiate between Line and Area
        }
    };
   
    return (
        <ResponsiveContainer width="100%" className={clsx(functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical"?"":"col" )}>
            <PieChart data={value}
                 dataKey={"col_chart_display_id"}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                onClick={(event) => {
                    if (value) {
                      
                      onClickEvent(value[activeIndex]);
                    }
                  }}
                >
            
                
                
                {functionMap.UIViewSetting?.OutputSetting?.Legend && 
                
                <Legend  formatter={renderLegendText} verticalAlign="bottom" wrapperStyle={{ lineHeight: '40px'  }} />}
                
                {output2Arry && output2Arry.map((outputs: OutputCtrlModel[], pindex: number) => {

                    var csize =  (100 / output2Arry.length);

                    var cx= `${csize/2+(csize*pindex)}%`
                    var cy = '50%'

                    
                    if(functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical" ){
                        cy= `${csize/2+(csize*pindex)}%`
                        cx = '50%'
                    }
                    
                    return (<Fragment key={`pie-${pindex}`}>



                        {outputs && outputs.map((col: any, rindex: number) => {
                            var size = 100 / outputs.length;
                            if (size > 20) {
                                size = 20;
                            }

                            var outerRadius = 100 - (rindex * size)
                            var innerRadius = outerRadius - size;
                            
                            if (value && value.length > 0) {
                                for (var i in value) {
                                    var v = value[i][col.COL_COLUMN_NAME] ;
                                    if(v && v.constructor === String){
                                        value[i][col.COL_COLUMN_NAME] = parseFloat(v.toString())
                                    }
                                }
                            }
                            return (

                                <Pie key={`pie-${pindex}-${rindex}`} data={value}  
                                    dataKey={col.COL_COLUMN_NAME} 
                                    cx={cx} cy={cy}
                                    display={col.COL_DISPLAY_NAME}
                                    innerRadius={innerRadius}
                                    strokeOpacity={0}
                                    stroke={FlowLineStyle.BorderColor}
                                    outerRadius={outerRadius}
                                    activeIndex={activeIndex?activeIndex:0}
                                    onMouseEnter={onPieEnter}
                                    
                                    activeShape={renderActiveShape}
                                >

                                    {value.map((entry: any, index: number) => {
                                        var color = colorScale(index.toString())
                                        
                                        return (
                                            <Cell key={`cell-${rindex}-${index}`} fill={color}  />
                                        )
                                    })}

                                </Pie>
                            )


                        })}
                    </Fragment>
                    )

                })}
                
            </PieChart>

        </ResponsiveContainer>
    )
}
const ReactsBar = ({ value,outputs, functionMap ,onSelected }: {onSelected?:Function, value?: any,outputs:OutputCtrlModel[], functionMap: FunctionMap }) => {
    
    const [domain,setDomain]= useState<number[]>();
    const onClickEvent = (data: any) => {
        if (onSelected) {
            onSelected(data); // Pass chartType to differentiate between Line and Area
        }
    };
   
    useEffect(() => {
        var minValue = undefined;
        var maxValue = undefined;
        var isBar = false;
        if (value && outputs && value.length > 0 && outputs.length > 0) {
            for (var i in outputs) {
                var col = outputs[i];
                var dataKey = col.COL_DISPLAY_NAME ? col.COL_DISPLAY_NAME : col.COL_COLUMN_NAME;
                if (col.COL_BAR_TYPE === "Bar") {
                    isBar = true;
                }
                for (var j in value) {
                    var v = value[j];
                    var num = v[dataKey];

                    if (num) {
                        if (num.constructor === String) {
                            num = parseFloat(num.toString())
                        }

                        if (!maxValue || maxValue < num) {
                            maxValue = num;
                        }
                        if (!minValue || minValue > num) {
                            minValue = num;
                        }
                    }
                }
            }
        }
        if (maxValue > 0)
        {
            if(isBar){
                    setDomain([0, maxValue])
            }
            else
                setDomain([minValue?minValue:0, maxValue])
        }
        else
            setDomain(undefined)

            
    }, [value, outputs])
    return (
        <ResponsiveContainer width="100%" className={clsx(functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical"?"":"col" )}>
            <ComposedChart data={value}
            
                layout={functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical" ? "vertical" : "horizontal"}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                onClick={(event) => {
                    if (event && event.activePayload) {
                      const clickedData = event.activePayload[0].payload;
                      onClickEvent(clickedData);
                    }
                  }}
                >
          
                
                        {functionMap.UIViewSetting?.OutputSetting?.LayoutType === "vertical" ? <>
                            <XAxis type="number" tickFormatter={NumberToNumberStyle} domain={domain?domain:undefined}
                                color={FlowLineStyle.FontColor}
                                fontFamily={FlowLineStyle.FontFamily} fontSize={FlowLineStyle.FontSize} />
                            <YAxis type="category" dataKey="col_chart_display_id"
                                color={FlowLineStyle.ActiveFontColor}
                                fontFamily={FlowLineStyle.FontFamily} fontSize={FlowLineStyle.FontSize}
                            />
                        </> :
                            <>
                                <YAxis type="number" tickFormatter={NumberToNumberStyle} domain={domain?domain:undefined}
                                    color={FlowLineStyle.FontColor} 
                                    fontFamily={FlowLineStyle.FontFamily} fontSize={FlowLineStyle.FontSize} />
                                <XAxis type="category" dataKey="col_chart_display_id" 
                                    color={FlowLineStyle.FontColor}
                                    fontFamily={FlowLineStyle.FontFamily} fontSize={FlowLineStyle.FontSize}
                                />
                            </>}
                    
                {functionMap.UIViewSetting?.OutputSetting?.Grid && <CartesianGrid strokeDasharray="3 3" stroke={FlowLineStyle.BorderColor} />}
                {functionMap.UIViewSetting?.OutputSetting?.Legend && <Legend verticalAlign="bottom" wrapperStyle={{ lineHeight: '40px' }} />}
                {functionMap.UIViewSetting?.OutputSetting?.Brush && <Brush dataKey="col_chart_display_id" height={20} stroke="#8884d8" />}
                {outputs && outputs.map((col: any, rindex: number) => {

                    var color = colorScale(rindex.toString())
                    return (
                        <Fragment key={`chartIndex${rindex}`} >
                            {col.COL_BAR_TYPE === "Bar" && <Bar   type="monotone" dataKey={col.COL_DISPLAY_NAME?col.COL_DISPLAY_NAME:col.COL_COLUMN_NAME} fill={color} stackId={col.COL_GROUP_NAME ? col.COL_GROUP_NAME : undefined} barSize={20} />}
                            {col.COL_BAR_TYPE === "Line" && <Line  type="monotone" dataKey={col.COL_DISPLAY_NAME?col.COL_DISPLAY_NAME:col.COL_COLUMN_NAME} stroke={color} fill={color} />}
                            {col.COL_BAR_TYPE === "Area" && <Area   type="monotone" dataKey={col.COL_DISPLAY_NAME?col.COL_DISPLAY_NAME:col.COL_COLUMN_NAME} stroke={color} fill={color} stackId={col.COL_GROUP_NAME ? col.COL_GROUP_NAME : undefined} />}
                        </Fragment>

                    )


                })}

                <Tooltip formatter={NumberToNumberStyle} contentStyle={{
                    color: FlowLineStyle.ActiveFontColor, backgroundColor: FlowLineStyle.BackgroundColor, borderColor: FlowLineStyle.BorderColor
                    , fontFamily: FlowLineStyle.FontFamily
                    , fontSize: FlowLineStyle.FontSize
                }} />
            </ComposedChart>

        </ResponsiveContainer>
    )
}
export default DynamicChartControl;
