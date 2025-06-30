
import { useState, forwardRef, useImperativeHandle, memo, useRef, ReactNode } from 'react'
import { TreeModel } from "./ui.models.js"
import { FlowLineStyle } from './flowline.style.js';

import { styled } from '@mui/material/styles/index.js';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView/index.js';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem/index.js';
import { OutputCtrlModel } from 'flowline_common_model/result/models.js';
import { CommonContainerCtrl } from './ctrl.dynamic.common.js';


export type TreeRefType = {
    SelectItem: Function;
};
export const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
    color: FlowLineStyle.FontColor,

    [`& .${treeItemClasses.content}`]: {
        borderRadius: theme.spacing(0.5),
        padding: theme.spacing(0.5, 1),
        margin: theme.spacing(0.2, 0),
        [`& .${treeItemClasses.label}`]: {
            fontSize: FlowLineStyle.TreeFontSize,
            //fontWeight: 0,
        },
    },
    [`& .${treeItemClasses.iconContainer}`]: {
        borderRadius: '50%',
        color:
            theme.palette.mode === 'light'
                ? theme.palette.primary.main
                : "#90caf9",

        padding: theme.spacing(0, 1.2),
    }, fontFamily: FlowLineStyle.FontFamily
}));


const MuiTree = memo(forwardRef(({ onSelectedItem, onDoubleClick, treeModels, outputCtrls ,expandedItems}: {
    treeModels?: TreeModel[]
    ,   expandedItems?:string[]
    , onSelectedItem?: Function
    ,outputCtrls?: OutputCtrlModel[]
    , onDoubleClick?: Function
    , onGetIncldueControl?: Function
}, ref) => {

    const [selectedItem, setSelectedItem] = useState<TreeModel | undefined>(undefined)



    const Select = (item: TreeModel) => {

        if (onSelectedItem !== null && onSelectedItem !== undefined) {
            onSelectedItem(item);
        }

        setSelectedItem(item);
    }

    const DoubleClick = (item: TreeModel) => {

        if (onDoubleClick !== null && onDoubleClick !== undefined && item === selectedItem) {

            onDoubleClick(item);
        }
    }
    useImperativeHandle(ref, () => ({ Select }))

    return (
        <>
            {treeModels && treeModels.length > 0 &&
                <SimpleTreeView
                    sx={{ overflowX: 'hidden', minHeight: 10, flexGrow: 1 }}

                    expandedItems={expandedItems?expandedItems:undefined}


                >
                    {treeModels && treeModels.map((cItem, index) => {
                        return (
                            <SimpleTreeViewItem treeModel={cItem} 
                            outputCtrls={outputCtrls}
                            key={`simpleTreeItem${index}${cItem.ID}`} 
                            onSelected={Select}
                            
                                onDoubleClick={DoubleClick}  />
                        )
                    })}

                </SimpleTreeView>}
        </>
    )

}));

const SimpleTreeViewItem = ({ treeModel, onSelected, onDoubleClick,onEventAction,outputCtrls }: { treeModel: TreeModel, outputCtrls?: OutputCtrlModel[], onSelected: Function, onDoubleClick: Function, onGetIncldueControl?: Function 
    ,onEventAction?:(eventKey: string|undefined, item: any) =>Promise<void|ReactNode[]>}) => {


    return (
        <StyledTreeItem itemId={treeModel.ID.toString()}

            label={outputCtrls ? 
            <div className='d-flex justify-content-between'>
                <CommonContainerCtrl value={treeModel.OrgItem} 
                onEventAction={onEventAction}
                onSelected={()=>{
                    onSelected(treeModel)
                }}
                
                outputCtrls={outputCtrls} />
            </div> : treeModel.DisplayName} 
            
            onClick={() => { onSelected(treeModel) }} onDoubleClick={() => { onDoubleClick(treeModel) }}>
            {treeModel.Items && treeModel.Items.map((cItem, index) => {
                return (
                    <SimpleTreeViewItem treeModel={cItem} key={`simpleTreeItem${treeModel.ID}${index}`}
                    outputCtrls={outputCtrls} 
                    onSelected={onSelected} onDoubleClick={onDoubleClick} />
                )
            })}
        </StyledTreeItem>
    )
}

export default MuiTree;
