/* eslint-disable jsx-a11y/anchor-is-valid */

import { FormControl,  MenuItem, Pagination, Select } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FilterModel, GroupByRow, SortModel } from "./ui.models.js";
import { JsonQuery } from "flowline_common_model/src/util.common";



export const GetFilterColumnName = (f:FilterModel)=>{
    var colName = f.ColumnSetting.COL_COLUMN_NAME;

    if (f.ColumnSetting?.COL_VALUE_TYPE === "MulitLineStyle") {
      if (f.ColumnSetting?.COL_MULTI_VALUE && f.ColumnSetting?.COL_MULTI_VALUE.length > 0) {
        var rows = f.ColumnSetting?.COL_MULTI_VALUE[0];
        if (rows && rows.length > 0) {
          colName = rows[0].COL_COLUMN_NAME
        }
      }
    }
    return colName;
}
const MuiPagination = (props: { data?: any[],sort?:SortModel,
    
    filterList?:FilterModel[]|undefined,defaultPageSize?:10|20|50|100|number,onPagingData: Function ,onPageSizeValue?:Function}) => {
    const {defaultPageSize =10, data, onPagingData,sort,filterList,onPageSizeValue } = props;
    
    const [totalPageCount, setTotalPageCount] = useState<number>(0);
    const [startPage,setStartPage]= useState<number>(0);
    const [filterData,setFilterData] = useState<any[]>()
    const [pageSize,setPageSize] = useState<number>(defaultPageSize)
    const location = useLocation();
    useEffect(() => {
        
        if (data && pageSize && onPagingData) {

            var tempData = data;
            
            if(filterList){
                
                for(var i in filterList){
                    var filter = filterList[i]
                    var colName =GetFilterColumnName(filter)
                    if(colName &&filter.Operator && filter.Value){
                        tempData =  JsonQuery.Where(tempData,colName,filter.Operator,filter.Value)
                    }
                }
            }

            if(sort && sort.ColumnName && tempData?.length > 0){
                var isStringSortType = tempData[0][sort.ColumnName]?.constructor === String;
                
                tempData = tempData?.sort((a: any, b: any) => {
                    var aValue = a[sort.ColumnName];
                    var bValue = b[sort.ColumnName];
                    if (isStringSortType) {
                        if (sort.IsAsc)
                            return aValue?.localeCompare(bValue)
                        else
                            return bValue?.localeCompare(aValue)
                    } else {
                        if (sort.IsAsc)
                            return aValue - bValue
                        else
                            return bValue - aValue
                    }
                })
            }
    
            
            var grpList = filterList?.filter(x => x.GroupBy)
            var grpList = grpList?.sort((a: FilterModel, b: FilterModel) => {
                    return a.GroupByIndex - b.GroupByIndex
                
            })
            if (grpList && grpList.length > 0) {
                var newItems: any[] = BindingGroup(grpList, 0, tempData)


                if (newItems && newItems.length > 0) {

                    tempData = newItems

                }
            }

            setFilterData(tempData);

            // onPagingData(tempData);
         

            var totalCnt = tempData.length;
            var pageCnt = Math.ceil(totalCnt / pageSize);

            setTotalPageCount(pageCnt);

            if(startPage > 0 && pageCnt < startPage+1){
                onSetPage(startPage-1,tempData);
            }else{
                onSetPage(startPage,tempData);
            }

        }

    }, [data, pageSize,sort,filterList])

    const BindingGroup = (grpList: FilterModel[], index: number, items: any[]) => {

        var newItems: any[] = []

        if (grpList.length > index) {

            var grp = grpList[index];
            var colName = grp.ColumnSetting.COL_COLUMN_NAME;
            var grps = JsonQuery.GroupBy(items, colName);
            if (grps) {
                var ps = Object.getOwnPropertyNames(grps)
                for (var j in ps) {
                    var pName = ps[j];
                    var newData = grps[pName];
                    if (newData && newData.length > 0) {
                        var item:GroupByRow = { IsGrp: true, GroupBy: grp, Item: newData[0] ,Show:false,Items:[]}
                        newItems.push(item)
                        var rs = BindingGroup(grpList, index + 1, newData);
                        if (rs && rs.length > 0) {
                            item.Items = rs;
                            
                        }
                        else {
                            item.Items = newData
                            
                        }
                    }
                }
            }
        }

        return newItems


    }
    useEffect(()=>{
        setStartPage(0);
    },[location])
    const onSetPage = (pageIndex:number,filterData:any[]|undefined)=>{
        
        setStartPage(pageIndex);
        
        var newData = filterData?.slice(pageIndex*pageSize,((pageIndex+1)*pageSize))
        
        onPagingData(newData);
    }
    
    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        
        onSetPage(value-1,filterData);
      };
      
     
    return (

        <Fragment>
            {(totalPageCount > 1 || defaultPageSize != pageSize) && 
            

                <div className='d-flex align-items-stretch justify-content-center  my-4 '>
                    <div className="d-flex align-items-center justify-content-start  w-80px me-2">
                        <FormControl variant="outlined" size="small">

                            <Select
                                value={pageSize}
                                onChange={(e: any) => {
                                   
                                    setPageSize(e.target.value);
                                   
                                    onSetPage(0, filterData)

                                    if(onPageSizeValue)
                                        onPageSizeValue(e.target.value)
                                }}


                            >


                                <MenuItem value={10}>{10}</MenuItem>
                                <MenuItem value={20}>{20}</MenuItem>
                                <MenuItem value={50}>{50}</MenuItem>
                                <MenuItem value={100}>{100}</MenuItem>



                            </Select>

                        </FormControl>


                    </div>
                    <div className="d-flex  align-items-center justify-content-center ">
                        <Pagination count={totalPageCount} page={startPage + 1} variant="outlined" shape="rounded" onChange={handleChange} />
                    </div>
                </div>
            }
        </Fragment>
    )
}

export default MuiPagination;
