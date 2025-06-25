import React, { useEffect, useState } from 'react';
import { Badge, Toolbar, IconButton, Typography, InputBase, Paper, MenuItem, Select, Button, Menu } from '@mui/material/index.js';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { FlowLineStyle } from './flowline.style.js';
import { KeyValueBooleanCtrl, KeyValueCtrl, KeyValueSelectCtrl } from './ctrl.editors.js';
import { KeyValue } from 'flowline_common_model/src/models.js';
import { FilterModel } from './ui.models.js';


const FilterToolbar = ({ filter, onChaged }: { filter: FilterModel, onChaged: Function }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (filter) {
      if (!filter.Operator) {
        filter.Operator = "contains"
      }
    }
  }, [filter])

  return (

    <div >

      <IconButton aria-label="filter" size='small' onClick={handleClick} >
        <Badge color="secondary" variant="dot" invisible={filter ? !(filter.Operator && (filter.Value || filter.GroupBy)) : true} >
          <FilterIcon sx={{ color: FlowLineStyle.GridSubColor,width:14,height:14 }} />
        </Badge>

      </IconButton>
      {filter &&
        <Menu

          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >

          <div className='row ms-2 me-4'>
            
            <KeyValueCtrl className='col'
            displayName='Column'
              value={filter.ColumnSetting.COL_DISPLAY_NAME?filter.ColumnSetting.COL_DISPLAY_NAME:filter.ColumnSetting.COL_COLUMN_NAME}
              readonly={true}
            />
            <KeyValueSelectCtrl className='col'
              value={filter.Operator}
              displayName='Operator'
              options={[{ key: "=", value: "=" }
                , { key: "!=", value: "!=" }
                , { key: ">", value: ">" }
                , { key: ">=", value: ">=" }
                , { key: "<", value: "<" }
                , { key: "<=", value: "<=" }
                , { key: "contains", value: "contains" }
                , { key: "!contains", value: "does not contains" }
              ]}
              onChanged={(k: string, v: KeyValue) => {
                filter.Operator = v.key;
                onChaged(filter)
              }}
            ></KeyValueSelectCtrl>
            <KeyValueCtrl value={filter.Value} className='col' displayName='Value' changeMode='Input'
              onChanged={(k: string, v: string) => {
                filter.Value = v;
                onChaged(filter)
              }}
            ></KeyValueCtrl>

            <KeyValueBooleanCtrl value={filter.GroupBy}  className='col col-12' displayName='Group by' onChanged={(k: string, v: boolean) => {
              filter.GroupBy = v;
              onChaged(filter)
              handleClose();
            }}></KeyValueBooleanCtrl>
          </div>


        </Menu>
      }
    </div>

  );
};

export default FilterToolbar;
