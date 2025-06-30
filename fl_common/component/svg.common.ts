import { Guid } from "flowline_common_model/result/util.common";


export interface SvgRectSubObj{
    R?:number;
    cX:number;
    cY:number;
    S?:string;
    F?:string;
    Type?:string;
    IsDown?:boolean;
}
export class SvgRect{
    X:number=0;
    Y:number=0;
    X2:number=0;
    Y2:number=0;
    Width:number=0;
    Height:number=0;
    CX:number=0;
    CY:number=0;
    ScaleX:number=1;
    ScaleY:number=1;
    Rotate?:number;
    Tag?:string;
    SubObjs?:SvgRectSubObj[];   
}

export class SvgObj {
    ID?:string;
    ICon?: string;
    //Type?: "DEFAULT"|"INANDOUT"|"RESIZE";
    DisplayName?:string;
    TableName?:string;
    IsUIIcon?:boolean= false;
    StrokeColor?:string="#000000FF" ;
    FillColor?:string="#FFFFFF00";
    Rect?:SvgRect;
    IsSelected?:boolean;
    //Items?:SvgObj[];
    OnSelected?:Function;
    OnChaged?:Function;
    JoinObjs?:JoinObj[]
    OrgItem?:any;
    
    MinCol?:number;
    MinRow?:number;
    MaxCol?:number;
    MaxRow?:number;
    Border?:number=0;
    IsSupportDrag?:boolean = true;
    IsSupportDrop?:()=> Boolean;
    IsUseSettingBtn?:boolean = false;
    IsUsePopupBtn?:boolean = false;
    IsPointFixed:boolean = false;
    IsResize?:boolean= true;
    Deleting?:boolean=false;
    

    SetRect(width:number,height:number,point:SvgPoint){
        this.Rect = GetRect(point.X - width / 2, point.Y - height / 2, point.X + width / 2, point.Y + height / 2);
    }
    IsInclude(target:SvgObj){
        if(this.JoinObjs){
            for(var i in this.JoinObjs){
                var join = this.JoinObjs[i];
                if(join.StartObj === target || join.EndObj ===target){
                    return true;
                }
            }
        }

        return false;
    }
    
    IsLoop(target:SvgObj){

        var lst = target.NextAllStepSvgObjs()
        if (lst && lst.length > 0) {
            var index = lst.findIndex(x => x?.ID === this.ID)
            if (index > -1) {
                return true;
            }
        }
        return false;
    }
    
    Select(){
        this.IsSelected = true;
        if(this.OnSelected){
            this.OnSelected(true);
        }
    }
    UnSelect(){
        this.IsSelected = false;
        if(this.OnSelected){
            this.OnSelected(false);
        }
    }
    Chaged() {
        
        if (this.OnChaged) {
            this.OnChaged();
        }
    }
    NextSvgObjs(){
        var rtn = [];
        if (this.JoinObjs) {
            for (var i in this.JoinObjs) {
                var join = this.JoinObjs[i];
                if (join.JoinType !== "virtualline") {
                    if (join.StartObj?.ID === this.ID && join.EndObj) {
                        rtn.push(join.EndObj);
                    }
                }
            }
        }
        return rtn;
    }
    NextAllStepSvgObjs(includeIds:string[]=[]){
        var rtn:SvgObj[] =[];
        if (includeIds.findIndex(x => x === this.ID) < 0) {
            if(this.ID)
                includeIds.push(this.ID);

            rtn = this.NextSvgObjs();
            if (rtn && rtn.length > 0) {

                for (var i in rtn) {
                    var svg:SvgObj = rtn[i];
                    
                    var cRtn = svg?.NextAllStepSvgObjs(includeIds);
                    if(cRtn && cRtn.length > 0)
                        rtn = rtn.concat(cRtn);
                
                }
            }
        }
        
        return rtn;
    }
    PrevSvgObjs(){
        var rtn = [];
        if (this.JoinObjs) {
            for (var i in this.JoinObjs) {
                var join = this.JoinObjs[i];
                if (join.JoinType !== "virtualline") {
                    if (join.EndObj?.ID === this.ID && join.StartObj) {
                        rtn.push(join.StartObj);
                    }
                }
            }
        }
        return rtn;
    }
    PrevAllStepSvgObjs(includeIds:string[]=[]){
        var rtn:SvgObj[] =[];
        if (includeIds.findIndex(x => x === this.ID) < 0) {
            if(this.ID)
                includeIds.push(this.ID);

            rtn = this.PrevSvgObjs();
            if (rtn && rtn.length > 0) {

                for (var i in rtn) {
                    var svg:SvgObj = rtn[i];
                    
                    var cRtn = svg?.PrevAllStepSvgObjs(includeIds);
                    if(cRtn && cRtn.length > 0)
                        rtn = rtn.concat(cRtn);
                
                }
            }
        }
        
        return rtn;
    }

}

export class ColorObj{
    Stroke?:string;
    Fill?:string;
}

export class SvgPoint{
    X:number=1;
    Y:number=1;
    IsH?:boolean=false;
    
}

export class JoinObj{
    ID?: string;
    IsSelected?:boolean;
    StartObj?: SvgObj
    EndObj?: SvgObj
    StrokeColor?: string
    FillColor?: string = "none";
    Path?: string
    DisplayName?:string
    SubDesc?:string
    StartJoinPoint?:SvgPoint
    EndJoinPoint?:SvgPoint
    StartType?: string  = "url(#Circle)";
    EndType?: string  = "url(#Triangle)";
    JoinType?: string  = "line";
    OnChaged?:Function;
    OrgItem?:any
    
    Chaged() {
        if (this.OnChaged) {
            this.OnChaged();
        }
    }
   
    
}



export class JoinDrawObj{
    minX:number=-1;
    minY:number=-1;
    maxX:number=-1;
    maxY:number=-1;
    w:number=-1;
    h:number=-1;
    cX:number=-1;
    cY:number=-1;
    sX:number=-1;
    sY:number=-1;
    eX:number=-1;
    eY:number=-1;
    lineFlow:string="";
}


export function GetOffsetPoint(e:any,scale:number=1) {

    var rtn =new SvgPoint();
    rtn.X = e.nativeEvent.offsetX / scale;
    rtn.Y = e.nativeEvent.offsetY / scale;
    if (e.touches) {
        rtn.X = e.touches[0].clientX / scale;
        rtn.Y = e.touches[0].clientY / scale;
    }
    return rtn;
}


export function GetCenterforRect(rect:SvgRect) {
    var p = new SvgPoint();
    if (rect && rect?.Width && rect?.Height && rect.X && rect.Y) {
        p.X = rect?.Width / 2 + rect?.X;
        p.Y = rect?.Height / 2 + rect?.Y;
    }
    return p;
}

export function GetRect(x1:number, y1:number, x2:number, y2:number) {
    var rect = new SvgRect();

    var minX = x1 > x2 ? x2 : x1;
    var minY = y1 > y2 ? y2 : y1;
    var maxX = x1 > x2 ? x1 : x2;
    var maxY = y1 > y2 ? y1 : y2;

    rect.X = minX;
    rect.Y = minY;
    rect.X2 = maxX;
    rect.Y2 = maxY;

    rect.Width = maxX - rect.X;
    rect.Height = maxY - rect.Y;
    rect.CX = minX + rect.Width / 2;
    rect.CY = minY + rect.Height / 2;

    rect.ScaleX = 1;
    rect.ScaleY = 1;
    rect.Rotate = 0;
    rect.SubObjs = [];

    var joinPoint = 15;
    var joinSize = 4;


    rect.SubObjs.push(GetSubObj(-joinPoint, rect.Height / 2, joinSize, "LC", "white", "#96C6DE"));
    rect.SubObjs.push(GetSubObj(rect.Width + joinPoint, rect.Height / 2, joinSize, "RC", "white", "#96C6DE"));
    rect.SubObjs.push(GetSubObj(rect.Width / 2, -joinPoint, joinSize, "TC", "white", "#96C6DE"));
    rect.SubObjs.push(GetSubObj(rect.Width / 2, rect.Height + joinPoint, joinSize, "BC", "white", "#96C6DE"));



    function GetSubObj(x:number, y:number, r:number, type:string, s:string, f:string) {
        return  {R : r,cX : x,cY : y,S : s,F : f,Type : type}

    }


    return rect;
}

export function GetPath(startRect:SvgRect, endRect:SvgRect){

    var startPoint: SvgPoint
    var endPoint: SvgPoint
    var cenPoint:SvgPoint;
    if (startRect.CY < endRect.CY && startRect.CX < endRect.CX) {
        startPoint = { X: startRect.X2, Y: startRect.CY }
        endPoint = { X: endRect.CX, Y: endRect.Y }
        //ㄱ
    }
    else if (startRect.CY < endRect.CY && startRect.CX > endRect.CX) {


        startPoint = { X: startRect.X, Y: startRect.CY }
        endPoint = { X: endRect.CX , Y: endRect.Y }
    }
    else if (startRect.CY > endRect.CY && startRect.CX < endRect.CX) {

        //_|

        startPoint = { X: startRect.X2, Y: startRect.CY }
        endPoint = { X: endRect.CX , Y: endRect.Y2 }
    }
    else {
        // ㄴㄴ

        startPoint = { X: startRect.X, Y: startRect.CY }
        endPoint = { X: endRect.CX , Y: endRect.Y2 }
    }

    cenPoint ={ X: endPoint.X , Y: startPoint.Y }

    
    if(startRect.X < cenPoint.X && cenPoint.X <startRect.X2 && startRect.Y < cenPoint.Y && cenPoint.Y <startRect.Y2){
        //start 포함

        if(startRect.CY < endRect.CY){
            startPoint = { X: startRect.CX, Y: startRect.Y2 }
        }
        else{
            startPoint = { X: startRect.CX, Y: startRect.Y }
        }
        return `M ${startPoint.X} ${startPoint.Y} L ${endPoint.X} ${endPoint.Y} `
    }
    else if(endRect.X < cenPoint.X && cenPoint.X <endRect.X2 && endRect.Y < cenPoint.Y && cenPoint.Y <endRect.Y2){
        //end 포함
        if(startRect.CX < endRect.CX){
            endPoint = { X: endRect.X, Y: endRect.CY }
        }
        else{
            endPoint =  { X: endRect.X2, Y: endRect.CY }
        }
        return `M ${startPoint.X} ${startPoint.Y} L ${endPoint.X} ${endPoint.Y} `
    }
    else{
        return `M ${startPoint.X} ${startPoint.Y} L ${cenPoint.X} ${cenPoint.Y} L ${endPoint.X} ${endPoint.Y} `
    }
        
}
export function GetPathCurveType(startPoint:SvgPoint, endPoint:SvgPoint){
    
    var obj:JoinDrawObj  = GetJoinDrawObj(startPoint, endPoint);
    
    if (startPoint.IsH )
        return GetDrawPathCurveH(obj);
    else
        return GetDrawPathCurveV(obj);
}


export function Get2PathCurveType(startPoint:SvgPoint, endPoint:SvgPoint,size:number){
    var obj:JoinDrawObj  = GetJoinDrawObj(startPoint, endPoint);
   
    var halfSize = size/2;
    
    
    if (startPoint.IsH) {
        halfSize = startPoint.X<endPoint.X?halfSize:halfSize*-1;
        var centerPoint1: SvgPoint = { X: obj.cX-halfSize, Y: obj.cY, IsH: startPoint.IsH };
        var centerPoint2: SvgPoint = { X: obj.cX+halfSize, Y: obj.cY, IsH: startPoint.IsH };
    }
    else {
        halfSize = startPoint.Y<endPoint.Y?halfSize:halfSize*-1;
        var centerPoint1: SvgPoint = { X: obj.cX, Y: obj.cY-halfSize, IsH: startPoint.IsH };
        var centerPoint2: SvgPoint = { X: obj.cX, Y: obj.cY+halfSize, IsH: startPoint.IsH };
    }
    var path1Obj = GetJoinDrawObj(startPoint,centerPoint1);
    var path2Obj = GetJoinDrawObj(centerPoint2,endPoint);
    
    var rtn:string[]=[];

    if (startPoint.IsH){
        rtn.push(GetDrawPathCurveH(path1Obj));
    }
    else{
        rtn.push(GetDrawPathCurveV(path1Obj));
    }
    if(endPoint.IsH){
        rtn.push(GetDrawPathCurveH(path2Obj));
    }
    else{
        rtn.push(GetDrawPathCurveV(path2Obj));
    }
    rtn.push(`translate(${obj.cX-size/4},${obj.cY-size/4}) `)
    return rtn;
}

function GetDrawPathCurveH(obj:JoinDrawObj) {
    
    var str = "";
    if (obj) {
        var sub = 2
        var w = obj.w / sub;

        //var h = obj.h / sub;
        var arry = [];
        
        arry.push({ tag: 'M', x: obj.sX, y: obj.sY });
        if ((obj.lineFlow === 'LRTB' || obj.lineFlow === 'LRBT')) {
            arry.push({ tag: 'C', x: obj.sX + w, y: obj.sY });
            arry.push({ tag: ',', x: obj.eX - w, y: obj.eY });

        } else if (obj.lineFlow === 'RLTB' || obj.lineFlow === 'RLBT') {
            arry.push({ tag: 'C', x: obj.sX - w, y: obj.sY });
            arry.push({ tag: ',', x: obj.eX + w, y: obj.eY });
        }

        arry.push({ tag: ',', x: obj.eX, y: obj.eY });

        
        for (var i in arry) {
            var t = arry[i];
            str += " " + t.tag + " " + t.x + " " + t.y;
        }

    }
    
    return str;
}
function GetDrawPathCurveV(obj:JoinDrawObj) {
    var str = "";
    if(obj){
    var sub = 2
    //var w = obj.w / sub;
    var h = obj.h / sub;
    var arry = [];
    arry.push({ tag: 'M', x: obj.sX, y: obj.sY });
    if (obj.lineFlow === 'LRTB' || obj.lineFlow === 'RLTB') {
        arry.push({ tag: 'C', x: obj.sX, y: obj.sY + h });
        arry.push({ tag: ',', x: obj.eX, y: obj.eY - h });

    } else if (obj.lineFlow === 'LRBT' || obj.lineFlow === 'RLBT') {
        arry.push({ tag: 'C', x: obj.sX, y: obj.sY - h });
        arry.push({ tag: ',', x: obj.eX, y: obj.eY + h });
    }
    arry.push({ tag: ',', x: obj.eX, y: obj.eY });

    
    for (var i in arry) {
        var t = arry[i];
        str += " " + t.tag + " " + t.x + " " + t.y;
    }
    }
    return str;

}

export function GetJoinDrawObj(startPoint:SvgPoint, endPoint:SvgPoint) {
    var obj = new JoinDrawObj();

    obj.minX = -1;
    obj.minY = -1;
    obj.maxX = -1;
    obj.maxY = -1;
    obj.w = -1;
    obj.h = -1;
    obj.cX = -1;
    obj.cY = -1;
    obj.sX = startPoint.X;
    obj.sY = startPoint.Y;
    obj.eX = endPoint.X;
    obj.eY = endPoint.Y;
    obj.lineFlow = "";

    if (startPoint.X === endPoint.X) {
        obj.minX = obj.maxX = startPoint.X;
        
        if (startPoint.Y === endPoint.Y) {
            obj.minY = obj.maxY = startPoint.Y;
        }
        else if (startPoint.Y > endPoint.Y) {
            obj.lineFlow += "BT";
            obj.minY = endPoint.Y;
            obj.maxY = startPoint.Y;
        }
        else {
            obj.lineFlow += "TB";
            obj.minY = startPoint.Y;
            obj.maxY = endPoint.Y;
        }
    }
    else if (startPoint.X < endPoint.X) {

        obj.minX = startPoint.X;
        obj.maxX = endPoint.X;
        obj.lineFlow = "LR";
        if (startPoint.Y === endPoint.Y) {
            obj.minY = obj.maxY = startPoint.Y;
        }
        else if (startPoint.Y > endPoint.Y) {
            obj.lineFlow += "BT";
            obj.minY = endPoint.Y;
            obj.maxY = startPoint.Y;
        }
        else {
            obj.lineFlow += "TB";
            obj.minY = startPoint.Y;
            obj.maxY = endPoint.Y;
        }
    }
    else {

        obj.minX = endPoint.X;
        obj.maxX = startPoint.X;
        obj.lineFlow = "RL";
        if (startPoint.Y === endPoint.Y) {
            obj.minY = obj.maxY = startPoint.Y;
        }
        else if (startPoint.Y > endPoint.Y) {
            obj.lineFlow += "BT";
            obj.minY = endPoint.Y;
            obj.maxY = startPoint.Y;
        }
        else {
            obj.lineFlow += "TB";
            obj.minY = startPoint.Y;
            obj.maxY = endPoint.Y;
        }
    }

    obj.w = obj.maxX - obj.minX;
    obj.h = obj.maxY - obj.minY;
    obj.cX = obj.minX + obj.w / 2;
    obj.cY = obj.minY + obj.h / 2;
    return obj;
}



export function GetLoopZone (joinList: JoinObj[]){
    var loopZoneList: Array<JoinObj[]> = []
    if (joinList) {
        for (var i in joinList) {
            var jObj = joinList[i];
            var chkListID: string[] = [];
            var isFind = loopZoneList.findIndex(x => x.findIndex(y => y.ID === jObj.ID) > -1) > -1
            if (!isFind) {
                var r = IsCheckLoop(jObj.OrgItem.FK_START_MAP_ID, jObj.OrgItem.FK_END_MAP_ID, chkListID);
                if (r && r.length > 0) {
                    r.push(jObj)
                    loopZoneList.push(r);
                }
            }
        }
    }


    function IsCheckLoop(chkID: string, endID: string, chkListID: string[]) {
        var rtn: JoinObj[] = [];
        if (chkID && endID) {
            var id = `${chkID}_${endID}`;

            var isChk = chkListID.findIndex(x => x === id) < 0;
            if (isChk) {
                chkListID.push(id);
                var lst = joinList.filter(x => x.OrgItem.FK_START_MAP_ID === endID);

                if (lst && lst.length > 0) {
                    var fndInx = lst.findIndex(x => x.OrgItem.FK_END_MAP_ID === chkID);

                    if (fndInx > -1) {

                        rtn.push(lst[fndInx]);

                    }
                    else {

                        for (var i in lst) {
                            var item = lst[i];
                            rtn = IsCheckLoop(chkID, item.OrgItem.FK_END_MAP_ID, chkListID);

                            if (rtn && rtn.length > 0) {
                                rtn.push(item);
                                return rtn;
                            }
                        }
                    }
                }
            }
        }

        return rtn;
    }
    
    return loopZoneList;
}

export function SvgObjListToRect( svgObjList:SvgObj[]){
    var rtn;
    for(var i in svgObjList){
        var rect = svgObjList[i]?.Rect;
        if (rect) {
            if(rtn){
                rtn = AppendRect(rtn, rect);
            }
            else{
                rtn = rect;
            }
        }
    }
    return rtn;
} 
export function AppendRect( s:SvgRect,e:SvgRect){
    var minX = s.X > e.X ? e.X : s.X;
    var minY = s.Y > e.Y ? e.Y : s.Y;
    var maxX = s.X2 > e.X2 ? s.X2 : e.X2;
    var maxY = s.Y2 > e.Y2 ? s.Y2 : e.Y2;

    return GetRect(minX,minY,maxX,maxY);
}
