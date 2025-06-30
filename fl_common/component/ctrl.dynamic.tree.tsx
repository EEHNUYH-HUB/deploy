

import { useEffect, useState,  memo, ReactNode, } from 'react';
import { Guid,  StringKeyToValue } from 'flowline_common_model/result/util.common'
import { DynamicViewProps, TreeModel } from "./ui.models.js"
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView/index.js';
import { StyledTreeItem } from './ctrl.tree.mui.js';
import { OutputCtrlModel } from 'flowline_common_model/result/models.js';

import { CommonContainerCtrl } from './ctrl.dynamic.common.js';

const DynamicTreeControl = (props: DynamicViewProps ) => {

    const { functionMap, value, onSelected,onEventAction, onDoubleClick, onBindingAction,bindingLoadOption } = props;
    const [items, setItems] = useState<Array<TreeModel>>();
    const [expandedItems, setExpandedItems] = useState<string[]>()
    const [valueAppend,setValueAppend] = useState<boolean>(false)
    const [selectTreeModel,setSelectTreeModel] = useState<TreeModel>()
    useEffect(() => {
        
        if (value) {
            
            Load()
        }

    }, [value]);

    const Load = async () => {

        if (functionMap && functionMap.UIViewSetting?.OutputCtrls && functionMap.UIViewSetting?.OutputCtrls.length > 0 && value) {
            Binding();
        }
    }
    const Binding = async () => {

        var ids: string[] = []

        if (valueAppend && selectTreeModel) {
            selectTreeModel.Items = ConvertToRootTreeModels(value as [], ids);
            if (selectTreeModel.ReloadItems)
                selectTreeModel.ReloadItems();
        }
        else {
            
            if (functionMap.UIViewSetting) {

                var roots = ConvertToRootTreeModels(value, ids);

                setItems(roots);


                if (functionMap.UIViewSetting?.OutputSetting?.ExpandAll) {
                    setExpandedItems(ids)

                }
            }
        }
       

    }



    const ConvertToRootTreeModels = (items: [],  ids: string[]) => {
        var rtn = new Array<TreeModel>();

        
        for (var i in items) {
            var item = items[i];
            var isFind = false;
            
            var parentID ;
            var id;
            if(functionMap.UIViewSetting?.TreeParentID){
                parentID = StringKeyToValue(functionMap.UIViewSetting?.TreeParentID, item);
            }
             if(functionMap.UIViewSetting?.TreeID){
                id = StringKeyToValue(functionMap.UIViewSetting?.TreeID, item);
             }

            if (parentID !== undefined) {
                for (var j in items) {

                    if (functionMap.UIViewSetting?.TreeID && parentID === StringKeyToValue(functionMap.UIViewSetting?.TreeID, items[j])) {
                        isFind = true;
                        break;
                    }
                }
            }
            if (!isFind) {
                
                var tm = new TreeModel();
                tm.OrgItem = item;
                
                
                tm.Items = ConvertToTreeModels(id, items,  ids);

                
                tm.IsLoaded = tm.Items && tm.Items.length > 0;
                if(tm.Items && tm.Items.length > 0)
                    ids.push(tm.ID)
                rtn.push(tm);
                
            }
            
        }

        
        return rtn;
    }

    const ConvertToTreeModels = (findID: any, items: [],  ids: string[]) => {
        var rtn =new Array<TreeModel>();
        for (var i in items) {

            var item = items[i];

            var parentID ;
            var id;
            if(functionMap.UIViewSetting?.TreeParentID){
                parentID = StringKeyToValue(functionMap.UIViewSetting?.TreeParentID, item);
            }
             if(functionMap.UIViewSetting?.TreeID){
                id = StringKeyToValue(functionMap.UIViewSetting?.TreeID, item);
             }


             
            if (parentID !== undefined && findID !== undefined) {
                if (findID === parentID) {

                    var tm = new TreeModel();
                    tm.OrgItem = item;

                  
                    tm.Items = ConvertToTreeModels(id, items, ids);
                    tm.IsLoaded = tm.Items && tm.Items.length > 0;
                    if(tm.Items && tm.Items.length > 0)
                        ids.push(tm.ID)
                    rtn.push(tm);
                }
            }
        }

        return rtn;


    };
    

    const OnSelectItem = async (items: TreeModel[]) => {

        
        for (var k in items) {
            var item = items[k]


            if (bindingLoadOption?.LoadOption === "LOADOPT2" ) {

                if (onBindingAction) {

                    var beforeLoad = item.IsLoaded;
                    
                    //기존에는 한번 로드 되면 onBindingAction을 실행 하지 않았지만 다른 컨트롤에서 Tree로 리로드 이벤트가 발생시
                    //마지막 BindingAction input값으로 설정되어 onBindingAction을 실행
                    //실행하면서 이전 로드 값이 false일경우 서버로 요청하는 작업은 안하고 input값만 변경해주고 작업이 끝나게게
                    var result = await onBindingAction(item.OrgItem, bindingLoadOption,beforeLoad)

                    if (!beforeLoad) {
                        item.IsLoaded = true;
                        setValueAppend(true)
                        if (result && result.constructor === Array && result.length > 0) {

                            var ids: any[] = [];


                            if (functionMap.UIViewSetting) {


                                item.Items = ConvertToRootTreeModels(result as [], ids);
                                if (item.ReloadItems)
                                    item.ReloadItems();


                            }


                            setExpandedItems(expandedItems ? expandedItems.concat([item.ID]) : [item.ID])

                        }
                    }
                   
                }

            }

        }
        if (onSelected) {

            if (functionMap.UIViewSetting?.MultiSelect) {
                var rtns = []
                for (var j in items) {
                    rtns.push(items[j].OrgItem)
                }
                onSelected(rtns);
            }
            else {
                
                onSelected(items && items.length > 0 ? items[0].OrgItem : undefined);
            }
            setSelectTreeModel(items && items.length > 0 ? items[0]:undefined)

        }


    };

    const OnDoubleClick = (item: any) => {
        if (onDoubleClick) {
            onDoubleClick(item.OrgItem);
        }

    };

    return (
        <DyTree
            onSelected={OnSelectItem}
            onDoubleClick={OnDoubleClick}
            expandedItems={expandedItems ? expandedItems : []}
            functionMap={functionMap}
            onEventAction ={onEventAction}
            onExpandItems={(ids:string[])=>{
                setExpandedItems(ids)
            }}
            treeModels={items}


        />

    );
};



const DyTree = memo((props:
    { treeModels?: Array<TreeModel>, expandedItems: string[]
        onExpandItems?:Function
     } & DynamicViewProps) => {

    const { treeModels, expandedItems, onExpandItems, functionMap, value, onSelected, onDoubleClick, onReload, onEventAction } = props;
    const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
    const [selectedID, setSelectedID] = useState<any>('');

    const [expandIds, setExpandIds] = useState<string[]>()
    useEffect(() => {

        
        if (treeModels && treeModels.length > 0 && functionMap.UIViewSetting?.SelectFirstItemWhenDataLoad) {

            if (onSelected) OnSelect(functionMap.UIViewSetting?.MultiSelect ? [treeModels[0].ID] : treeModels[0].ID)
        }

    }, [treeModels])
    useEffect(() => {
        
        setExpandIds(expandedItems)
    }, [expandedItems])
    const OnSelect = (ids: any) => {

        var arg = [];
        if (functionMap.UIViewSetting?.MultiSelect) {
            setSelectedIDs(ids)
            for (var i in ids) {
                var fObj = FindItem(ids[i])
                if (fObj)
                    arg.push(fObj)
            }
        }
        else {
            setSelectedID(ids)
            var fObj = FindItem(ids)
            if (fObj)
                arg.push(fObj)

        }


        
        if (onSelected !== null && onSelected !== undefined) {
            onSelected(arg);
        }



        

    }

   
    const FindItem = (id: any) => {
        if (treeModels) {
            for (var i in treeModels) {
                var item = treeModels[i]

                var fObj = TreeModel.Find(item, id)
                if (fObj)
                    return fObj;
            }
        }
        return null;

    }
 


    return (
        <>
            {treeModels && treeModels.length > 0 &&
                <SimpleTreeView
                    sx={{ overflowX: 'hidden', minHeight: 10, flexGrow: 1 }}

                    // checkboxSelection={multiSelect}
                    multiSelect={functionMap.UIViewSetting?.MultiSelect}
                    selectedItems={functionMap.UIViewSetting?.MultiSelect ? selectedIDs : selectedID}
                    onSelectedItemsChange={(e: any, ids: any) => {
                        OnSelect(ids)
                    }}
                    onExpandedItemsChange={(e: any, itemIds: string[]) => {
                        setExpandIds(itemIds)
                        if(onExpandItems)
                            onExpandItems(itemIds)
                    }}

                    expandedItems={expandIds ? expandIds : undefined}


                >
                    {treeModels && treeModels.map((cItem, index) => {
                        return (
                            <DyTreeItem treeModel={cItem} key={`simpleTreeItem${index}${cItem.ID}`}
                            
                            onEventAction ={onEventAction}
                                outputCtrls={functionMap.UIViewSetting ? functionMap.UIViewSetting.OutputCtrls : []}
                            />
                        )
                    })}

                </SimpleTreeView>}
        </>
    )

});

const DyTreeItem = (props: {
    treeModel: TreeModel, outputCtrls: OutputCtrlModel[], expandedItems?: string[]
        , onSelectedItem?: Function
    , onEventAction?: (eventKey: string | undefined, item: any) => Promise<void | ReactNode[]>
    
}) => {
    const [rerendering, setRerendering] = useState<string>(Guid())
    const { treeModel, outputCtrls, onSelectedItem,  onEventAction } = props;
    useEffect(() => {
        if (treeModel) {
            
            treeModel.ReloadItems = () => {
                setRerendering(Guid());
            }
        }
    }, [treeModel])

    return (
        <StyledTreeItem itemId={treeModel.ID.toString()}

            label={

                <CommonContainerCtrl

                    value={treeModel.OrgItem}

                    onEventAction={onEventAction}
                    onSelected={onSelectedItem}
                    
                    outputCtrls={outputCtrls}
                />

            }

        >
            {rerendering && treeModel.Items && treeModel.Items.map((cItem, index) => {
                return (
                    <DyTreeItem
                        outputCtrls={outputCtrls} treeModel={cItem} key={`simpleTreeItem${treeModel.ID}${index}`}

                    />
                )
            })}


        </StyledTreeItem>
    )
}


export default DynamicTreeControl;
