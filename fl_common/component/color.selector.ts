import { red,pink,purple,deepPurple,indigo,blue,lightBlue,cyan,teal,green,lightGreen,lime,yellow,amber,orange ,deepOrange,brown,grey,blueGrey} from '@mui/material/colors/index.js';
import { KeyValue } from 'flowline_common_model/src/models';


export type ColorType = "red"|"pink"|"purple"|"deepPurple"|"indigo"|"blue"|"lightBlue"|"cyan"|"teal"|"green"|"lightGreen"|"lime"|"yellow"|"amber"|"orange"|"deepOrange"|"brown"|"grey"|"blueGrey"|undefined

export type ColorShape = 50|100|200|300|400|500|600|700|800|900
//test2
export const ColorTypes:KeyValue[] = [
    {key:"red",value:"red"},
    {key:"pink",value:"pink"},
    {key:"purple",value:"purple"},
    {key:"deepPurple",value:"deepPurple"},
    {key:"indigo",value:"indigo"},
    {key:"lightBlue",value:"lightBlue"},
    {key:"cyan",value:"cyan"},
    {key:"teal",value:"teal"},
    {key:"green",value:"green"},
    {key:"lightGreen",value:"lightGreen"},
    {key:"lime",value:"lime"},
    {key:"yellow",value:"yellow"},
    {key:"amber",value:"amber"},
    {key:"orange",value:"orange"},
    {key:"deepOrange",value:"deepOrange"},
    {key:"brown",value:"brown"},
    {key:"grey",value:"grey"},
    {key:"blueGrey",value:"blueGrey"},

]


export const ColorShapes:KeyValue[] = [
    {key:50,value:"50"},
    {key:100,value:"100"},
    {key:200,value:"200"},
    {key:300,value:"300"},
    {key:400,value:"400"},
    {key:500,value:"500"},
    {key:600,value:"600"},
    {key:700,value:"700"},
    {key:800,value:"800"},
    {key:900,value:"900"}

]
const GetInstance = (type:ColorType|string)=>{
    var instance ;
    if (type ===      "red") { instance = red} 
    else if (type === "pink") { instance = pink;} 
    else if (type === "purple") { instance = purple;} 
    else if (type === "deepPurple") { instance = deepPurple;} 
    else if (type === "indigo") { instance = indigo;} 
    else if (type === "blue") { instance = blue;} 
    else if (type === "lightBlue") { instance = lightBlue;} 
    else if (type === "cyan") { instance = cyan;} 
    else if (type === "teal") { instance = teal;} 
    else if (type === "green") { instance = green;} 
    else if (type === "lightGreen") { instance = lightGreen;} 
    else if (type === "lime") { instance = lime;} 
    else if (type === "yellow") { instance = yellow;} 
    else if (type === "amber") { instance = amber;} 
    else if (type === "orange") { instance = orange;} 
    else if (type === "deepOrange") { instance = deepOrange;} 
    else if (type === "brown") { instance = brown;} 
    else if (type === "grey") { instance = grey;} 
    else if (type === "blueGrey") { instance = blueGrey;} 
    
    return instance;
}
export const  GetColor = (type:ColorType|string,value:ColorShape|number)=>{

    
    var obj = GetInstance(type);
    if (obj && value) {
        return obj[value as ColorShape];
    }

    else {
        return ""
    }
}

export const GetColors = (type: ColorType|string) => {


    var obj = GetInstance(type);
    if (obj) {
        return [obj[50], obj[100], obj[200], obj[300], obj[400], obj[500], obj[600], obj[700], obj[800], obj[900]];
    }

    else {
        return []
    }
}
export const GetColors2 = (value: ColorShape) => {
    if (value)
        return [red[value], pink[value], purple[value], deepPurple[value], indigo[value], blue[value], lightBlue[value], cyan[value], teal[value], green[value], lightGreen[value], lime[value], yellow[value], amber[value], orange[value], deepOrange[value], brown[value], grey[value], blueGrey[value]]
    else return []
}