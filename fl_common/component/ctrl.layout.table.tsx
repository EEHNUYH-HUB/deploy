import clsx from "clsx";
import { useEffect, useState, Fragment, ReactNode, useMemo } from "react"
import { CtrlSetting } from 'flowline_common_model/src/models'
import { Guid } from 'flowline_common_model/src/util.common'
import { UIFlowRunEntity, BorderEntity } from "./ui.models.js"
import { UIFlowMapColumn,  UIFlowMapRow,  UIFlowMapTable } from "./ui.models.js"
import { GetColor } from "./color.selector.js";

export const TableContainer = ({ table,pageModelID,includeForPopup, children }: { 
    table: UIFlowMapTable, 
    pageModelID:string,
    includeForPopup:boolean,
    children: (column: UIFlowMapColumn, rootBorder?: BorderEntity) => ReactNode 
}) => {

    return (
        <Fragment>
            {table.Rows.map((row, rIndex) => {
                return (
                    <Fragment key={`row-${pageModelID}-${rIndex}`}>
                        {row && row.Columns && row.Columns.length > 0 && (
                            <div className={clsx('row')}>
                                <RowContainer  includeForPopup={includeForPopup} children={children} row={row} pageModelID={pageModelID} />
                            </div>
                        )}
                    </Fragment>
                );
            })}
        </Fragment>
    );
};

const RowContainer = ({ row, pageModelID,includeForPopup,children }
    : {includeForPopup:boolean,row: UIFlowMapRow, pageModelID:string, children: (column: UIFlowMapColumn, rootBorder?: BorderEntity) => ReactNode 
}) => {
    const [maxHValue, setHMaxValue] = useState<number | undefined>();
   
    const [rerendering,setRerendering] = useState<string>("RERENDERING")
   
    
    useEffect(()=>{
        if (row.Columns) {
            var maxValue = Math.max(...row.Columns.map(obj => obj?.Entity?.Map?.COL_HEIGHT || 0));
            
            if (maxValue) {
                setHMaxValue(maxValue * 2);
            } else {
                setHMaxValue(undefined);
            }

            row.Chaged = () => {
                setRerendering(Guid)
            }
        }
    },[pageModelID])

    
    return (
        <Fragment>
            {rerendering && row && row.Columns && row.Columns.length > 0 && row.Columns.map((column, cIndex) => {
                return (
                    <div key={`col-${pageModelID}-${cIndex}`} className={clsx('col col-12', `col-xl-${column.ResizeColSpan?column.ResizeColSpan:0}`)}  hidden={column.ResizeColSpan?column.ResizeColSpan===0:true}>
                        <ColumnContainer  includeForPopup={includeForPopup} children={children} maxHeight={maxHValue} column={column}  pageModelID={pageModelID}  />
                    </div>
                );
            })}
        </Fragment>
    );
};

const ColumnContainer = ({ column,pageModelID, maxHeight,includeForPopup, children }: { 
    column: UIFlowMapColumn, 
    maxHeight?: number, 
    includeForPopup:boolean,
    pageModelID:string,
    children: (column: UIFlowMapColumn, rootBorder?: BorderEntity) => ReactNode 
}) => {
   
    const GetBorderEntity = () => {
        const borderEntity: BorderEntity = {};
        if (column && column.IsCtrl && column.Entity && column.Entity.Map) {
            let height = column.Entity.Map.COL_HEIGHT;
            height = height ? height * 2 : undefined;
            const currentMaxHeight = maxHeight || height;
            let rootHeightValue: string | undefined = currentMaxHeight ? `${currentMaxHeight}px` : undefined;

            const ctrlSetting: CtrlSetting | undefined = column.Entity.Map.CtrlSetting;

            
            if (ctrlSetting?.HeightType === "fitscreen") {

                if(includeForPopup)
                    rootHeightValue = 'calc(100vh - 110px)';
                else
                    rootHeightValue = 'calc(100vh - 200px)';


                    if(ctrlSetting?.SubtractHeight && ctrlSetting?.SubtractHeight > 0){
                        rootHeightValue = `calc(${rootHeightValue} - 200px)`;
                    }

            } else if (ctrlSetting?.HeightType === "auto") {
                rootHeightValue = undefined;
            }

            let backgroundColor = undefined;
            let borderColor = undefined;

            if (ctrlSetting) {
                if (ctrlSetting.BackgroundColor && ctrlSetting.BackgroundColorShape) {
                    backgroundColor = GetColor(ctrlSetting.BackgroundColor, ctrlSetting?.BackgroundColorShape);
                }
                if (ctrlSetting.BorderColor && ctrlSetting.BorderColorShape) {
                    borderColor = GetColor(ctrlSetting.BorderColor, ctrlSetting?.BorderColorShape);
                }
            }

            borderEntity.height = currentMaxHeight;
            borderEntity.strHeight = rootHeightValue;
            borderEntity.type = ctrlSetting?.HeightType;
            borderEntity.borderColor = borderColor;
            borderEntity.backgroundColor = backgroundColor;
        }

        return borderEntity;
    }


    const columnCtrl = useMemo(()=>(
        <Fragment>
            {pageModelID && 
                <Fragment>
                    {(column && column.Entity && column.IsCtrl )?
                        <Fragment key={`container-${pageModelID}-${column.Entity.ID}`}>
                            {children(column, GetBorderEntity())}
                        </Fragment>
                        :
                        <Fragment key={`containerTB-${pageModelID}`}>
                            {column.Table &&
                                <TableContainer includeForPopup={includeForPopup} table={column.Table} pageModelID={pageModelID}  >
                                    {children}
                                </TableContainer>
                            }
                        </Fragment>
                    }</Fragment>
            }
        </Fragment>
    ),[column.Entity?.ID,pageModelID])

    

    return ( <>{columnCtrl}</>)
};

export default TableContainer;

