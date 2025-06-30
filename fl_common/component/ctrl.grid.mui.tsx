import clsx from "clsx";
import { useState, Fragment, useEffect, ReactNode } from "react";

import CellCtrl from "./ctrl.cell.js";
import { FlowLineStyle } from "./flowline.style.js";

import { OutputCtrlModel } from 'flowline_common_model/result/models'
import MuiPagination, { GetFilterColumnName } from "./ctrl.pagination.mui.js";
import { FilterModel, SortModel } from "./ui.models.js";
import { ObjClone } from "flowline_common_model/result/util.common";
import FilterToolbar from "./ctrl.grid.mui.toolbar.js";
import { IconButton } from "@mui/material/index.js";
import { ArrowDropDown, ArrowRight } from '@mui/icons-material';



type DataTableProps = {
  onSelectItem?: Function;
  onDoubleClick?: Function;
  columns: OutputCtrlModel[];
  data: [];
  onAppendCtrl?: Function
  isButtonCtrl?: boolean
  isIncludeCtrl?: boolean
  isExpandCtrl?: boolean
  showHeader?: boolean
  showPaging?: boolean
  storageID?: string
  selectFirstItemWhenDataLoad?: boolean
  rerendering?: string
  onCheckEventAction?: (item: object, eventType: string) => boolean
  onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
  pageSize?: 10 | 20 | 30 | 40 | 50 | 100
}
const activeCssTr = "bg-light"

const tdPadding = "4.75px 8px" 
const emptyTdWidth = "49px";//"41.4844px"  

const MuiHeaderCtrl = ({ filter, sort, onHeaderClick, onFilterChange }: {
  filter: FilterModel
  , sort?: SortModel

  , onHeaderClick: Function
  , onFilterChange: Function
}) => {




  return (
    <th style={{...FlowLineStyle.ThCss,  width: filter.GroupBy ? emptyTdWidth : "" }} 
    className={clsx(filter.ColumnSetting.COL_LABEL_CSS, "text-nowrap")}  >
      <div className="d-flex w-100 justify-content-between align-items-center">
        {filter.ColumnSetting.COL_DISPLAY_NAME && !filter.GroupBy &&
          <div className={clsx(
            'cursor-pointer',
            (sort?.Index === filter.Index) ? (sort?.IsAsc ? " table-sort-asc" : " table-sort-desc") : "")}
            onClick={() => {

              onHeaderClick(filter);
            }}

            style={{ fontSize: FlowLineStyle.FontSize }}
          >
            {filter.ColumnSetting.COL_DISPLAY_NAME}
          </div>
        }
        {filter.ColumnSetting.COL_DISPLAY_NAME &&
        <FilterToolbar filter={filter}

          onChaged={(f: FilterModel) => {
            onFilterChange(f)
          }}></FilterToolbar>
        }



      </div>

    </th>
  )
}


const MuiRowCtrl = (props: {
  selectedItem?: any, dept: number, totalColCnt: number
  , isIncludeCtrl?: boolean
  , isExpandCtrl?: boolean
  , expandItem?:any
  , onCheckEventAction?: (item: any, type: string) => boolean
  , isButtonCtrl?: boolean, onAppendCtrl?: Function, row: any, filterList?: FilterModel[], onDoubleClick?: Function
  , onSelectItem?: Function
  , onExpandEvent?:Function
  , onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
}) => {
  const { row } = props;
  
  return (
    <Fragment>
      {
        (row.IsGrp && row.GroupBy && row.GroupBy.GroupBy && row.GroupBy.GroupByIndex > -1) ?
          <MuiRowGroupByCtrl {...props} /> : <MuiRowInfoCtrl {...props} />
      }
    </Fragment>
  )
}


const MuiRowGroupByCtrl = (props: {
   expandItem?:any,
   onExpandEvent?:Function,
  selectItem?: any, dept: number, totalColCnt: number, isButtonCtrl?: boolean, onAppendCtrl?: Function, row: any, filterList?: FilterModel[], onDoubleClick?: Function, onSelectItem?: Function,
  onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
}) => {

  const { dept, row, onEventAction, totalColCnt } = props;

  const [isShow, setIsShow] = useState<boolean>(row.Show);

  const [colSpan] = useState<number>(totalColCnt - dept)
  const [pageSize, setPageSize] = useState<number>(10);
  const [data, setData] = useState<any>();

  return (
    <Fragment>
      <tr style={{borderBottom:FlowLineStyle.BorderStyle}}>
        {dept !== undefined && dept > 0 && Array.from({ length: dept }).map((_, index) => (
          <td key={`emptyCol${index}`} style={{ padding: tdPadding, width: emptyTdWidth }}></td>
        ))}
        <td colSpan={colSpan} style={{ padding: tdPadding }}>
          <div className="row me-0">
            <div className="col col-auto d-flex align-items-center" onClick={() => { setIsShow(!isShow) }}>
              <IconButton size="small" >
                {isShow ? <ArrowDropDown /> : <ArrowRight />}
              </IconButton>
            </div>
            <div className="col col_auto">
              <div className={clsx('text-nowrap  d-block fs-7 mb-2')} style={{ color: FlowLineStyle.GridSubColor }}>
                {row.GroupBy.ColumnSetting.COL_DISPLAY_NAME}
              </div>
              <CellCtrl outputSetting={row.GroupBy.ColumnSetting} item={row.Item} onEventAction={onEventAction} />
            </div>
          </div>
        </td>
      </tr>

      {isShow && data && data.map((item: any, index: number) => {
        return (
          <MuiRowCtrl key={`grpInner${index}`} {...props} row={item} dept={dept + 1} />
        )
      })}

      {isShow &&
        <tr className="border-bottom-0">
          <td colSpan={colSpan}>
            <MuiPagination data={row.Items} defaultPageSize={pageSize} onPagingData={(dt: []) => {
              setData(dt);
            }}
              onPageSizeValue={(v: number) => {
                setPageSize(v);
              }}
            />

          </td>
        </tr>
      }
    </Fragment>
  )
}

const MuiRowInfoCtrl = (props: {
  selectedItem?: any, dept: number, totalColCnt: number
  , isExpandCtrl?: boolean
  , isIncludeCtrl?: boolean
  , expandItem?:any
  , onExpandEvent?:Function
  , onCheckEventAction?: (item: object, eventType: string) => boolean
  , isButtonCtrl?: boolean, onAppendCtrl?: Function, row: any, filterList?: FilterModel[], onDoubleClick?: Function, onSelectItem?: Function, onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
}) => {
  const
    { onCheckEventAction, 
      onExpandEvent,
      isButtonCtrl, isIncludeCtrl, isExpandCtrl, onAppendCtrl, row, filterList, onDoubleClick, onSelectItem, onEventAction, selectedItem,expandItem, dept, totalColCnt } = props;


  const [colSpan] = useState<number>(totalColCnt - dept)
  
  
  const [showExpandButton, setShowExpandButton] = useState<boolean>(false)
  const [loadItemCtrls,setLoadItemCtrls] = useState<ReactNode[]>()
  const [expandCtrls,setExpandCtrls] = useState<ReactNode[]>()
  useEffect(() => {
    if (isExpandCtrl && row&& row.Data) {
      
      
      if (onCheckEventAction)
        setShowExpandButton(onCheckEventAction(row, "ExpandEvent"))
    }
  }, [isExpandCtrl, row])

  useEffect(() => {
    if (row &&row.Data && onEventAction) {
      
      BindingAppendCtrl(row)
    }
  }, [onEventAction, row])

  const BindingAppendCtrl = async (row:any)=>{
    if(onEventAction){
      var ctrls = await onEventAction("ItemLoadEvent", row)
       if(ctrls?.constructor === Array){
        setLoadItemCtrls(ctrls)
       }
      
    }
  }

  const BindingExpandCtrl = async (row:any)=>{
    if(onEventAction){
      var ctrls = await onEventAction("ExpandEvent", row)
       if(ctrls?.constructor === Array){
        setExpandCtrls(ctrls)
       }
      
    }
  }
  return (
    <Fragment>
      <tr style={{borderBottom:FlowLineStyle.BorderStyle}} className={clsx(onSelectItem ? "cursor-pointer " : '', row === selectedItem ? activeCssTr : '')}   >
        {dept !== undefined && dept > 0 && Array.from({ length: dept }).map((_, index) => (
          <td key={`emptyCol3${index}`} style={{ padding: tdPadding, width: emptyTdWidth }}></td>
        ))}
        {isExpandCtrl &&
          <td style={{ padding: tdPadding, width: emptyTdWidth }}>
            {showExpandButton &&
              <div className="row me-0">
                <div className="col col-auto d-flex align-items-center" onClick={() => {


                  if (expandItem !== row) {
                    
                    if(onExpandEvent)
                      onExpandEvent(row)
                    BindingExpandCtrl(row);
                  }
                  else{
                    if(onExpandEvent)
                      onExpandEvent(undefined)
                  }
                  
                }}>
                  <IconButton size="small" >
                    {expandItem === row ? <ArrowDropDown /> : <ArrowRight />}
                  </IconButton>
                </div>
              </div>}
          </td>
        }
        {
          filterList?.map((filter, cindex) => {
            if (!filter.GroupBy) {
              return (
                <Fragment key={`row${filter.ColumnSetting.COL_COLUMN_NAME}${cindex}`}>

                  <td style={{ padding: tdPadding }} onDoubleClick={() => { if (onDoubleClick) onDoubleClick(row) }} onClick={() => {
                    if (onSelectItem)
                      onSelectItem(row)
                  }} >

                    <CellCtrl outputSetting={filter.ColumnSetting} item={row} onEventAction={onEventAction} />

                  </td>
                </Fragment>

              )
            }
          }
          )
        }

        {isButtonCtrl && onAppendCtrl &&
          <td className='text-end' style={{ padding: tdPadding }}>
            {onAppendCtrl(row, ['ButtonClickEvent'])}
          </td>}
      </tr>

      {isIncludeCtrl && onAppendCtrl &&
        <tr  >

          {dept !== undefined && dept > 0 && Array.from({ length: dept }).map((_, index) => (
            <td key={`emptyCol3${index}`} style={{ padding: tdPadding, width: emptyTdWidth }}></td>
          ))}
          <td colSpan={colSpan} style={{ padding: tdPadding }}>

            {onAppendCtrl(row, ['LoadEvent'])}

          </td>
        </tr>}
      
      
      {isExpandCtrl && expandCtrls && expandCtrls.length > 0 && expandCtrls?.map((ctrl, pindex) => {
        return (
          <tr key={`rowindex${pindex}`} hidden={expandItem !== row}>
            {dept !== undefined && dept > 0 && Array.from({ length: dept }).map((_, index) => (
              <td key={`emptyCol2${pindex}${index}`} style={{ padding: tdPadding, width: emptyTdWidth }}></td>
            ))}
            <td className="p-10 " colSpan={colSpan} style={{ padding: tdPadding }}>

              {ctrl}

            </td>
          </tr>
        )

      })}

      {loadItemCtrls && loadItemCtrls.length > 0 && loadItemCtrls?.map((ctrl, pindex) => {
        return (
          <tr key={`rowindex${pindex}`} >
            {dept !== undefined && dept > 0 && Array.from({ length: dept }).map((_, index) => (
              <td key={`emptyCol2${pindex}${index}`} style={{ padding: tdPadding, width: emptyTdWidth }}></td>
            ))}
            <td className="p-10"  colSpan={colSpan} style={{ padding: tdPadding }}>

              {ctrl}

            </td>
          </tr>
        )

      })}
    </Fragment>
  )
}

const MuiGrid = (props: DataTableProps) => {

  const { onSelectItem, selectFirstItemWhenDataLoad = false, rerendering, onDoubleClick, data, onAppendCtrl, isButtonCtrl = false
    , isIncludeCtrl = false
    , isExpandCtrl = false
    , onCheckEventAction
    , onEventAction
    , columns
    , pageSize = 20, showHeader = true, showPaging = true, storageID } = props;

  const [pagingData, setPagingData] = useState<[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>();
  const [expandItem,setExpandItem]= useState<any>();


  const getSortOption = () => {
    if (storageID) {
      var sort = localStorage.getItem(`grdOptSort${storageID}`);
      if (sort) {
        return JSON.parse(sort);
      }

    }
    return undefined;
  }
  const getFilterOption = () => {
    if (storageID) {

      var filter = localStorage.getItem(`grdOptFilter${storageID}`);

      if (filter) {
        return JSON.parse(filter);
      }

    }
    return [];
  }
  const getPageSizeOption = () => {
    if (storageID) {

      var sPageSize = localStorage.getItem(`grdOptPageSize${storageID}`);
      if (sPageSize) {
        return parseInt(sPageSize);
      }

    }
    return pageSize;
  }
  const [sort, setSort] = useState<SortModel>(getSortOption());
  const [filterList, setFilterList] = useState<FilterModel[]>([])
  const [defaultPageSize] = useState<number>(getPageSizeOption())
  const [totalColCnt, setTotalColCnt] = useState<number>();

  useEffect(() => {

    if (!showPaging) {
      setPagingData(data)
    }

    if (selectFirstItemWhenDataLoad && data && data.length > 0 && data.constructor === Array) {
      OnSelectItem(data.length > 0 ? (data as Array<any>)[0] : undefined)
    }

  }, [data])

  useEffect(() => {
    
    initHeader(columns?.filter(x=>x.COL_VALUE_TYPE !== "HiddenStyle"));

  }, [columns,isExpandCtrl, rerendering])


  const initHeader = (cols:OutputCtrlModel[]) => {

    if (cols) {
      if (cols.length > 0) {
        setTotalColCnt(cols.length + (isButtonCtrl ? 1 : 0) + (isExpandCtrl ? 1 : 0))
      }

      if (!filterList || filterList?.length === 0 || cols.length !== filterList.length) {

        var beforeSetting = getFilterOption() as FilterModel[]

        if (beforeSetting && beforeSetting.length > 0 && beforeSetting.length === cols.length) {
          var isOK = true;
          for (var j in beforeSetting) {
            if (beforeSetting[j].ColumnSetting?.COL_COLUMN_NAME !== cols[j].COL_COLUMN_NAME
              || beforeSetting[j].ColumnSetting?.COL_DISPLAY_NAME !== cols[j].COL_DISPLAY_NAME
              || beforeSetting[j].ColumnSetting?.COL_VALUE_TYPE !== cols[j].COL_VALUE_TYPE) {
              isOK = false;
              break;

            }
            else{
              beforeSetting[j].ColumnSetting = cols[j];
            }
          }

          

          if (isOK) {

            setFilterList(beforeSetting)
            return;
          }
        }



        var lst = []
        var num = 0;
        for (var i in cols) {
          var col: OutputCtrlModel = cols[i];



          var filter: FilterModel = {
            Index: num, ColumnSetting: col, Operator: "", Value: "", GroupBy: false, GroupByIndex: -1
          }

          num += 1;
          lst.push(filter)
        }

        setFilterList(lst)

      }
    }
  }


  const OnSelectItem = (item: object) => {
    setSelectedItem(item)
    if (onSelectItem) {
      onSelectItem(item);
    }
  };

  const OnExpandEvent = (item:any)=>{
    setExpandItem(item)
  }

  const OnDoubleClick = (item: object) => {
    if (onDoubleClick && item === selectedItem) {
      onDoubleClick(item);
    }
  };

  const onHeaderClick = (f: FilterModel) => {

    var colName = GetFilterColumnName(f)


    if (colName) {
      var isAsc = true;
      if (sort?.ColumnName === colName && sort.Index === f.Index) {
        isAsc = !sort?.IsAsc;
      }

      var s = { ColumnName: colName, IsAsc: isAsc, Index: f.Index }
      setSort(s);
      saveSortOption(s)
    }
  }
  const onFilterChange = (f: FilterModel) => {

    if (f.GroupBy) {

      const maxValue = Math.max(...filterList.map(obj => obj.GroupByIndex));
      f.GroupByIndex = maxValue + 1;
    }
    else {

      var items = filterList.filter(x => x.GroupByIndex > f.GroupByIndex);

      for (var i in items) {
        items[i].GroupByIndex -= 1
      }
      f.GroupByIndex = -1
    }

    var lst: FilterModel[] = ObjClone(filterList)

    lst.sort((a, b) => {
      if (a.GroupBy && b.GroupBy) {
        return a.GroupByIndex - b.GroupByIndex
      }
      else if (a.GroupBy && !b.GroupBy) {
        return -1
      }
      else if (!a.GroupBy && b.GroupBy) {
        return 1
      }
      else
        return a.Index - b.Index
    });

    setFilterList(lst)
    saveFilterOption(lst)

  }

  const saveSortOption = (pSort: SortModel | undefined) => {
    if (storageID) {

      localStorage.setItem(`grdOptSort${storageID}`, JSON.stringify(pSort))
    }
  }
  const saveFilterOption = (pFilterList: FilterModel[] | undefined) => {
    if (storageID) {

      localStorage.setItem(`grdOptFilter${storageID}`, JSON.stringify(pFilterList))
    }
  }
  const savePageSizeOption = (size: number) => {
    if (storageID) {

      localStorage.setItem(`grdOptPageSize${storageID}`, size?.toString())
    }
  }
  return (

    <>
      {totalColCnt !== undefined &&
        <div className='table-responsive'>
          <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
            {showHeader &&
              <thead>

                <tr style={{ color: FlowLineStyle.GridSubColor, height: "10px" }}>

                  {isExpandCtrl &&
                    <th style={{ ...FlowLineStyle.ThCss, width: emptyTdWidth }}></th>
                  }
                  {
                    filterList && filterList?.map((filter, index) => {
                      return (
                        <Fragment key={`header${filter.Index}`}  >
                          <MuiHeaderCtrl sort={sort} filter={filter} onHeaderClick={onHeaderClick} onFilterChange={onFilterChange} />
                        </Fragment>
                      )

                    })}
                  {isButtonCtrl && onAppendCtrl &&
                    <th style={{...FlowLineStyle.ThCss }} className='text-end' key="headerEx">

                    </th>}
                </tr>
              </thead>}
            <tbody>
              {
                pagingData?.map((row: any, rindex) => {

                  if (row) {
                    return (
                      <Fragment key={`datatablerow${rindex}`}>
                        <MuiRowCtrl selectedItem={selectedItem}
                        expandItem={expandItem}
                          dept={0}
                          onCheckEventAction={onCheckEventAction}
                          totalColCnt={totalColCnt}
                          isIncludeCtrl={isIncludeCtrl}
                          isExpandCtrl={isExpandCtrl}
                          isButtonCtrl={isButtonCtrl}
                          onAppendCtrl={onAppendCtrl} filterList={filterList} 
                          
                          onExpandEvent={OnExpandEvent}
                          onSelectItem={OnSelectItem} onDoubleClick={OnDoubleClick} onEventAction={onEventAction} row={row} />
                      </Fragment >
                    )
                  }
                }
                )
              }
            </tbody>
          </table>
        </div>
      }

      {showPaging &&
        <MuiPagination sort={sort} filterList={filterList} data={data} defaultPageSize={defaultPageSize} onPagingData={(dt: []) => {
          setPagingData(dt);
        }}
          onPageSizeValue={(v: number) => {
            savePageSizeOption(v);
          }}
        />
      }

    </>


  )
}




export default MuiGrid;