import { Box, Typography } from "@mui/material/index.js"
import { FlowLineStyle } from "./flowline.style.js"
import { KeyValue } from "flowline_common_model/result/models"
import { MoveScroll } from "./ui.utils.js"



const AffixCtrl =({parentID,list}:{parentID:string,list:KeyValue[]})=>{
    return(
        <Box sx={{
            borderLeft: `5px solid ${FlowLineStyle.SplitColor}`, paddingX: 1
            ,position:"fixed"
        }}>
            {list?.map((item, index) => {
                return (
                    <div key={`affix${item.key}${index}`} className="cursor-pointer" onClick={()=>{
                        
                        MoveScroll(parentID,item.key)
                        
                    }}>

                        <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 12, my: 2 }} > {item.value}</Typography>

                    </div>
                )
            })}
        </Box>
    )
}

export default AffixCtrl;