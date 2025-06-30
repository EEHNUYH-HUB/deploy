import { Guid } from "flowline_common_model/result/util.common";
import { GetCenterforRect, GetOffsetPoint, GetPath, GetPathCurveType, JoinObj, SvgObj, SvgPoint, SvgRect, SvgRectSubObj } from "./svg.common.js";
import { HorizontalAddCtrl, VerticalAddCtrl } from "ctrl.panel.add.js";



export default class Drawing {

    ObjList:SvgObj[];
    JoinList:JoinObj[];
    GroupZoneList:SvgRect[];
    IsDown :boolean;
    DefaultLineSize:number;
    ResizeValue:number;
    StartPoint :SvgPoint|null;
    BeforeRotate:number|undefined|null;
    EndPoint:SvgPoint|null;
    
    SelectedItems :SvgObj[];
    SelectedItem :SvgObj|null;
    SubRect :SvgRectSubObj|null;
    ChangeObj :SvgObj|null;
    IsDrawJoin :boolean;
    JoinItem :SvgObj|null;

    IsShowStandby :boolean;
    IsShowIcon  :boolean;
    
    IsRightClick  :boolean;
    
    OnBeforeDeleteSvgObj?:Function;
    OnDrawSvgObj? :Function;
    OnDeleteSvgObj? :Function;
    OnDrawJoinObj?:Function;
    OnDeleteJoinObj? :Function;
    OnMoveSvgObjs? :Function;
    OnClear? :Function;
    OnDrawPath? :Function;
    OnDrawGroupZone?:Function;
    Scale?:number;
    IsMoveChildItem?:boolean;
    JoinDrawType:"ALL"|"LR"|"BT"="LR"
    constructor() {
        this.ObjList= [];
        this.JoinList = []
        this.GroupZoneList =[]
        this.IsDown = false;
        this.DefaultLineSize= 50;
        this.ResizeValue = 50;
        this.StartPoint = null;
        this.BeforeRotate = null;
        this.EndPoint = null;
        
        this.SelectedItems = [];
        this.SelectedItem = null;

        this.SubRect = null;
        this.ChangeObj = null;
        this.IsDrawJoin = false;
        this.JoinItem = null;

        this.IsShowStandby = false;
        this.IsShowIcon = false;
        
        this.IsRightClick = false;
        this.IsMoveChildItem = false;
        this.Scale = 1;
    }

    MouseDown(eventArg:any) {
        if (eventArg.ctrlKey) {
            return;
        }
        var e = GetOffsetPoint(eventArg ,this.Scale);
       
        this.IsDown = true;
        this.IsRightClick = false;
        this.StartPoint = {X:e.X,Y:e.Y};
        this.EndPoint = e;

        if (this.SelectedItems.length > 0) {
            for (var i in this.SelectedItems) {
                var obj = this.SelectedItems[i];

                if (obj && obj.Rect && obj.Rect.SubObjs) {

                    if(obj.IsSupportDrag){
                        for (var j in obj.Rect.SubObjs) {
                            var sub = obj.Rect.SubObjs[j];
                            if (sub && sub.IsDown) {
                                this.SubRect = sub;

                                this.IsDrawJoin = this.SubRect.Type === "TC" || this.SubRect.Type === "BC" || this.SubRect.Type === "LC" || this.SubRect.Type === "RC";;
                                this.AllUnSelected()
                                
                                obj.Select()
                                this.ChangeObj = obj;
                                this.BeforeRotate = obj.Rect.Rotate;

                                this.SelectedItems.push(obj);

                                return;
                            }
                        }
                    }
                    else if (obj.IsResize) {
                        for (var j in obj.Rect.SubObjs) {
                            var sub = obj.Rect.SubObjs[j];
                            if (sub.IsDown) {
                                
                                
                                if(obj.Rect && obj.Rect.Width && obj.Rect.Height){
                                    var width = sub.Type === "LC" ? -this.ResizeValue : sub.Type === "RC" ? this.ResizeValue : 0;
                                    var height = sub.Type === "TC" ? -this.ResizeValue : sub.Type === "BC" ? this.ResizeValue : 0;
                                    this.ResizeSvgObj(obj, obj.Rect.Width + width, obj.Rect.Height + height);
                                }
                                sub.IsDown = false;
                                return;
                            }
                        }
                    }
                }
            }
        }

        var selItem = null;
        for (var i in this.ObjList) {

            var item = this.ObjList[i];
            if (item.Rect && this.IsFind(item.Rect, e.X, e.Y)) {
                selItem = item;
                break;
            }
        }
        this.IsShowStandby = false;
        if (selItem) {

            if (this.SelectedItem === selItem) {
                this.IsShowStandby = true;
            }

            this.SelectedItem = selItem;

            if (this.SelectedItems.length > 1) {
                if (!selItem.IsSelected) {
                    this.AllUnSelected()
                    selItem.Select()

                    this.SelectedItems.push(selItem);
                }
            }
            else {
                this.AllUnSelected()
                selItem.Select()

                this.SelectedItems.push(selItem);
            }

        }
        else {
            this.SelectedItem = null;
            this.AllUnSelected()
        }
    }
    MouseMove(eventArg:any) {

        if (this.IsDown) {
            var e = GetOffsetPoint(eventArg,this.Scale);
            if ( this.SelectedItems && this.SelectedItems.length > 0) {

                if (!this.IsDrawJoin) {
                    var end = e;

                    if(this.StartPoint){
                        var xV = this.StartPoint.X - e.X;
                        var yV = this.StartPoint.Y - e.Y;
                        var isSize = (xV < 100 && xV > -100 && yV < 100 && yV > -100);
                        if (!isSize) {
                            end = this.StartPoint;
                        }


                        if (this.SubRect) {
                            this.SizeSvgObj(this.StartPoint, end)
                        }
                        else {
                            this.MoveSvgObj(this.StartPoint, end)
                        }

                        this.StartPoint.X = end.X;
                        this.StartPoint.Y = end.Y;
                    }
                }
                else if(this.SelectedItem) {

                    if(this.SelectedItem.IsSupportDrag){
                        this.EndPoint = e;
                        this.WriteDrawPath(this.GetDrawPathCurve(this.EndPoint));
                    }

                }
            }
            else {
                this.EndPoint = e;

                if (this.StartPoint) {
                    this.WriteDrawPath(
                        " M" + this.StartPoint.X + " " + this.StartPoint.Y
                        + " L" + this.EndPoint.X + " " + this.StartPoint.Y
                        + " L" + this.EndPoint.X + " " + this.EndPoint.Y
                        + " L" + this.StartPoint.X + " " + this.EndPoint.Y
                        + " L" + this.StartPoint.X + " " + this.StartPoint.Y + " Z");
                }
            }
        }
    }

    WriteDrawPath(str:string) {
        if (this.OnDrawPath) {
            this.OnDrawPath(str);
        }
    }
    MouseOut(eventArg:any) {

    }
    MouseUp(eventArg:any) {
        this.IsDown = false;
        this.WriteDrawPath("");


        if (this.SubRect) {

            if (this.IsDrawJoin) {
                if (this.JoinItem) {
                    if(this.ChangeObj)
                        this.DrawJoin(this.ChangeObj, this.JoinItem, undefined);

                    this.AllUnSelected(true)
                    this.SelectedItem = null;
                    this.IsDrawJoin = false;

                }
                else {
                    if (!this.IsShowIcon) {
                        this.IsShowIcon = true;
                        this.SubRect.IsDown = false;
                        return;
                    }
                    else {
                        this.AllUnSelected(true)
                    }
                }

            }
            else {
                this.AllUnSelected()
            }
        }
        this.IsShowIcon = false;

        this.Select();

        
        this.IsRightClick = false;
        if (eventArg) {
            if ("which" in eventArg)
                this.IsRightClick = eventArg.which === 3;
            else if ("button" in eventArg)
                this.IsRightClick = eventArg.button === 2;
        }

    }
    Select() {

        if (this.SelectedItems.length === 0) {
            var svgs = this.PointToSvgs(this.StartPoint,this.EndPoint)
            for (var i in svgs) {
                var item = svgs[i];                

                item.Select();
                this.SelectedItems.push(item);

                
            }
        }

   }
    PointToSvgs(startPoint:SvgPoint|null,endPoint:SvgPoint|null){
        var rtn =[];
        for (var i in this.ObjList) {
            var item = this.ObjList[i];
            if (startPoint &&endPoint&& item.Rect && this.IsFind2(item.Rect, startPoint.X, startPoint.Y, endPoint.X, endPoint.Y)) {

                rtn.push(item)
            }
        }
        return rtn;
    }
    PointToSvg(startPoint:SvgPoint|null){
        
        for (var i in this.ObjList) {
            var item = this.ObjList[i];
            if (startPoint && item.Rect && this.IsFind(item.Rect, startPoint.X, startPoint.Y)) {

                return item
            }
        }
        return undefined;
    }
    AllUnSelected(isSubUnSelected:boolean=false) {

        for (var i in this.SelectedItems) {
            var item = this.SelectedItems[i];
            item.UnSelect()
            if (item.Rect) {
                for (var i in item.Rect.SubObjs) {
                    item.Rect.SubObjs[i].IsDown = false;
                }
            }
        }
        this.SelectedItems = [];

        if (isSubUnSelected) {
            if (this.JoinItem) {

                this.JoinItem.UnSelect();
                if(this.JoinItem.Rect){
                for (var i in this.JoinItem.Rect.SubObjs) {
                    this.JoinItem.Rect.SubObjs[parseInt(i)].IsDown = false;
                }
            }
                if (this.ChangeObj && this.ChangeObj.Rect) {
                    for (var i in this.ChangeObj.Rect.SubObjs) {
                        this.ChangeObj.Rect.SubObjs[parseInt(i)].IsDown = false;
                    }
                }
            }
            this.SubRect = null;
            this.ChangeObj = null;
            this.JoinItem = null;
            this.IsDrawJoin = false;
        }

        var selectJoin = this.JoinList.find(x=>x.IsSelected);
        if(selectJoin)
            selectJoin.IsSelected = false;
    }
    DrawJoin(startObj:SvgObj, endObj:SvgObj, jobj?:JoinObj) {
        
        if (endObj.Rect) {
            var obj = this.GetJoinPointSvgToSvg(startObj, endObj)
            var sJoinPoint = obj?.startPoint
            var eJoinPoint = obj?.endPoint
            if (sJoinPoint && eJoinPoint) {

                var path;

                if(jobj?.JoinType === "virtualline" && startObj.Rect && endObj.Rect){
                    //path = GetPath(startObj.Rect, endObj.Rect);
                    path = GetPathCurveType(sJoinPoint, eJoinPoint);
                }
                else{
                    path = GetPathCurveType(sJoinPoint, eJoinPoint);
                }
                if (!jobj) {

                    if (startObj.IsInclude(endObj) === true) {
                        return null;
                    }

                    jobj = new JoinObj();
                    jobj.ID = Guid();
                    jobj.StartObj = startObj;
                    jobj.EndObj = endObj;
                    jobj.StartJoinPoint = sJoinPoint;
                    jobj.EndJoinPoint = eJoinPoint;
                    jobj.StrokeColor = endObj.StrokeColor;
                    jobj.FillColor = "none";
                    jobj.Path = path;
                    if (!startObj.JoinObjs) {
                        startObj.JoinObjs = [];
                    }
                    startObj.JoinObjs.push(jobj);

                    if (!endObj.JoinObjs) {
                        endObj.JoinObjs = [];
                    }
                    endObj.JoinObjs.push(jobj);
                    jobj.StartType = "url(#Circle)";
                    jobj.EndType = "url(#Triangle)";
                    jobj.JoinType = "line";
                    this.JoinList.push(jobj);

                    if (this.OnDrawJoinObj)
                        this.OnDrawJoinObj(jobj);
                }
                else {
                    jobj.StartJoinPoint = sJoinPoint;
                    jobj.EndJoinPoint = eJoinPoint;
                    jobj.Path = path;
                    jobj.Chaged();
                }

                return jobj;
            }
        }
        return null;
    }
    ClearGroupZone(){
        this.GroupZoneList =[];
        if (this.OnDrawGroupZone)
            this.OnDrawGroupZone();
    }
    DrawGroupZone(rect:SvgRect){
        this.GroupZoneList.push(rect)

        if (this.OnDrawGroupZone)
            this.OnDrawGroupZone();
    }
    IsJoin(startObj: SvgObj, endObj: SvgObj) {
        if (startObj && endObj && startObj.ID && endObj.ID) {
            var source = startObj.ID + endObj.ID;
            for (var i in this.JoinList) {
                var join = this.JoinList[i];
                if (join && join.StartObj && join.EndObj && join.StartObj.ID && join.EndObj.ID) {
                    var chk1 = join.StartObj.ID + join.EndObj.ID;
                    var chk2 = join.EndObj.ID + join.StartObj.ID;

                    if (chk1 === source || chk2 === source) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
    Clear() {
        this.ObjList = [];
        this.JoinList = []
        this.SelectedItems = [];
        if (this.OnClear)
            this.OnClear();

    }
    SetMap(obj:SvgObj){
        
        if(obj.Rect && obj.Rect.CX && obj.Rect.CY){
          


            var minX = obj.Rect.X;
            var minY = obj.Rect.Y;
            var maxX= obj.Rect.X+obj.Rect.Width;
            var maxY= obj.Rect.Y+obj.Rect.Height;
            obj.MinCol = Math.floor(minX / this.DefaultLineSize)
            obj.MinRow = Math.floor(minY / this.DefaultLineSize)


            obj.MaxCol = Math.floor(maxX / this.DefaultLineSize)
            obj.MaxRow = Math.floor(maxY / this.DefaultLineSize)

            
        }
        
    }
    ResizeSvgObj(obj:SvgObj, width:number, height:number) {
        
        if(width < this.ResizeValue){
            width = this.ResizeValue;
        }

        if(height < this.ResizeValue){
            height = this.ResizeValue;
        }
        
        if(obj.Rect){
            var appendCx =(obj.Rect.Width<width?obj.Rect.Width - width:(obj.Rect.Width - width)*-1)/2;
            var appendCy =(obj.Rect.Height<height?obj.Rect.Height - height:(obj.Rect.Height - height)*-1)/2

            obj.SetRect(width,height,{X:obj.Rect.CX+appendCx,Y:obj.Rect.CY+appendCy});
            this.SetMap(obj);
            obj.Chaged();
        }
    
        
    }
    DrawSvgObj(obj:SvgObj, width:number, height:number, point:SvgPoint) {
        if (!point && this.EndPoint) {
            point = this.EndPoint
        }
        if(!obj.ID)
            obj.ID = Guid();
        
        obj.SetRect(width,height,point);
        
        this.SetMap(obj);
        
        
        this.ObjList.push(obj)


        if (this.IsDrawJoin //&& obj.IsSupportDrop
            ) {

            this.JoinItem = obj
            this.MouseUp(null);

        }

        if (this.OnDrawSvgObj) {

            this.OnDrawSvgObj(obj);
        }

        return obj;
    }
    
    

    SizeSvgObj(start:SvgPoint, end:SvgPoint) {

        var scalemode = true;

        if (this.SubRect && this.SubRect.Type === "TR") {

            if(this.ChangeObj&&this.ChangeObj.Rect){
                var cp = GetCenterforRect(this.ChangeObj.Rect);

                var cx = cp.X;
                var cy = cp.Y;
                var x = cx - end.X;
                var y = cy - end.Y;

                var r = - ((Math.atan(x / y) * (180 / Math.PI)));

                if (y < 0) {

                    r = (180 + r)
                }


                this.ChangeObj.Rect.Rotate = r; //*(180/Math.PI);
            }

        }
        else if (scalemode) {
            if(this.SubRect&&this.SubRect.Type&&this.ChangeObj&&this.ChangeObj.Rect){
                if (this.SubRect.Type.indexOf('R') !== -1) {
                    if( this.ChangeObj.Rect.Width&& this.ChangeObj.Rect.ScaleX){
                        var newWidth = (this.ChangeObj.Rect.Width * this.ChangeObj.Rect.ScaleX) + end.X - start.X;
                        this.ChangeObj.Rect.ScaleX = newWidth / this.ChangeObj.Rect.Width;
                    }
                }
                if (this.SubRect.Type.indexOf('L') !== -1) {
                    if( this.ChangeObj.Rect.Width&& this.ChangeObj.Rect.ScaleX){
                        var newWidth = (this.ChangeObj.Rect.Width * this.ChangeObj.Rect.ScaleX) - (end.X - start.X);
                        this.ChangeObj.Rect.X = end.X
                        this.ChangeObj.Rect.ScaleX = newWidth / this.ChangeObj.Rect.Width;
                    }
                }
                if (this.SubRect.Type.indexOf('B') !== -1) {
                    if( this.ChangeObj.Rect.Height&& this.ChangeObj.Rect.ScaleY){
                        var newHeight = (this.ChangeObj.Rect.Height * this.ChangeObj.Rect.ScaleY) + end.Y - start.Y;
                        this.ChangeObj.Rect.ScaleY = newHeight / this.ChangeObj.Rect.Height;
                    }
                }
                if (this.SubRect.Type.indexOf('T') !== -1) {
                    if( this.ChangeObj.Rect.Height&& this.ChangeObj.Rect.ScaleY){
                    var newHeight = (this.ChangeObj.Rect.Height * this.ChangeObj.Rect.ScaleY) - (end.Y - start.Y);
                    this.ChangeObj.Rect.Y = end.Y
                    this.ChangeObj.Rect.ScaleY = newHeight / this.ChangeObj.Rect.Height;
                    }
                }
            }
        }
        else {
            if(this.ChangeObj && this.ChangeObj.Rect&&this.ChangeObj.Rect.X&&this.ChangeObj.Rect.Y&&this.SubRect&& this.SubRect.Type){
                var mw = end.X - start.X;
                var mh = end.Y - start.Y;
                var x = this.ChangeObj.Rect.X;
                var y = this.ChangeObj.Rect.Y;
                var w = this.ChangeObj.Rect.Width;
                var h = this.ChangeObj.Rect.Height;

                if (this.SubRect.Type.indexOf('R') !== -1) {
                    if(this.ChangeObj.Rect.Width)
                    w = this.ChangeObj.Rect.Width + mw;

                }
                if (this.SubRect.Type.indexOf('L') !== -1) {
                    x = end.X;
                    if(this.ChangeObj.Rect.Width)
                    w = this.ChangeObj.Rect.Width - mw;


                }
                if (this.SubRect.Type.indexOf('B') !== -1) {
                    if(this.ChangeObj.Rect.Height)
                    h = this.ChangeObj.Rect.Height + mh;

                }
                if (this.SubRect.Type.indexOf('T') !== -1) {
                    y = end.Y
                    if(this.ChangeObj.Rect.Height)
                    h = this.ChangeObj.Rect.Height - mh;
                }


                if (w&& w <= 50) {
                    this.ChangeObj.Rect.Width = 50;
                    return
                }

                if (h&& h <= 50) {
                    this.ChangeObj.Rect.Height = 50;
                    return;
                }
                this.ChangeObj.Rect.X = x;
                this.ChangeObj.Rect.Y = y;
                this.ChangeObj.Rect.Width = w;
                this.ChangeObj.Rect.Height = h;
            }
        }

    }
    MoveSvgObj(start:SvgPoint, end:SvgPoint) {
        var items = [...this.SelectedItems];
        
        if(this.IsMoveChildItem){
            for(var j in this.SelectedItems){
                var item = this.SelectedItems[j]
                var index =this.SelectedItems.findIndex(x=>x===item)
                if(index < 0)
                    items.push(item)
                var targets = item.NextAllStepSvgObjs()
                for(var k in targets){
                    var tItem = targets[k]
                    index =items.findIndex(x=>x===tItem)
                    if(index < 0){
                        items.push(tItem)
                    }
                }
                
            }
        }

        for (var i in items) {
            var obj = items[i];
            
            var x = end.X - start.X;
            var y = end.Y - start.Y;
            if(obj.Rect){
                obj.Rect.X = obj.Rect.X + x;
                obj.Rect.Y = obj.Rect.Y + y;
                obj.Rect.X2 = obj.Rect.X2 + x;
                obj.Rect.Y2 = obj.Rect.Y2 + y;
                obj.Rect.CX = obj.Rect.CX + x;
                obj.Rect.CY = obj.Rect.CY + y;
            }
            if (obj && obj.JoinObjs && obj.JoinObjs.length > 0) {

                for (var i in obj.JoinObjs) {
                    var jObj = obj.JoinObjs[i];
                    if(jObj && jObj.StartObj &&jObj.EndObj)
                        this.DrawJoin(jObj.StartObj, jObj.EndObj, jObj)
                }
            }
            this.SetMap(obj);
            obj.Chaged();
        }
        if (this.OnMoveSvgObjs)
            this.OnMoveSvgObjs(this.SelectedItems);
    }


    DeleteSvgObj(obj:SvgObj) {
        obj.UnSelect();
        if (this.OnBeforeDeleteSvgObj && this.OnBeforeDeleteSvgObj(obj) === false) {
            return;
        }
        else{
            for (var j in this.ObjList) {
                if (this.ObjList[j].ID === obj.ID) {
                    this.ObjList.splice(parseInt(j), 1); 
                    
                    this.ClearSvgObjForJoinObjs(obj);
                    
                    break;
                }
            }
            if (this.OnDeleteSvgObj) {
                this.OnDeleteSvgObj(obj);
            }
        }
        
    }

    ClearSvgObjForJoinObjs(obj:SvgObj){

        var newArry:JoinObj[] = [];
        if(obj.JoinObjs)
            newArry = newArry.concat(obj.JoinObjs);

        for (var k in newArry) {
            this.DeleteJoinObj(newArry[k]);
        }
    }

    DeleteJoinObj(obj:JoinObj) {
        if (obj) {
            if(this.JoinList){
                for (var j in this.JoinList) {
                    if (this.JoinList[j].ID === obj.ID) {
                        this.JoinList.splice(parseInt(j), 1);
                        break;
                    }
                }
            }
            if(obj.StartObj && obj.StartObj.JoinObjs && obj.StartObj.JoinObjs.length > 0){
                for (var k in obj.StartObj.JoinObjs) {
                    if (obj.StartObj.JoinObjs[k].ID === obj.ID) {
                        obj.StartObj.JoinObjs.splice(parseInt(k), 1);
                        break;
                    }
                }
            }
            if(obj.EndObj && obj.EndObj.JoinObjs && obj.EndObj.JoinObjs.length > 0){
                for (var l in obj.EndObj.JoinObjs) {
                    if (obj.EndObj.JoinObjs[l].ID === obj.ID) {
                        obj.EndObj.JoinObjs.splice(parseInt(l), 1);
                        break;
                    }
                }
            }

            if (this.OnDeleteJoinObj) {
                this.OnDeleteJoinObj(obj);
            }
        }
    }

    IsFind(rect:SvgRect, x:number, y:number) {
        if (rect && x && y) {
            var x1 = rect.X;
            var y1 = rect.Y;
            var x2 = (rect.Width * rect.ScaleX) + rect.X;
            var y2 = (rect.Height * rect.ScaleY) + rect.Y;

            var minX = x1 > x2 ? x2 : x1;
            var minY = y1 > y2 ? y2 : y1;
            var maxX = x1 > x2 ? x1 : x2;
            var maxY = y1 > y2 ? y1 : y2;

            return (minX < x && maxX > x && minY < y && maxY > y);
        }
        return false;
    }
    IsFind2(rect:SvgRect, x1:number, y1:number, x2:number, y2:number) {

        if (rect && x1 && y1 && x2 && y2) {

            var minX = x1 > x2 ? x2 : x1;
            var minY = y1 > y2 ? y2 : y1;
            var maxX = x1 > x2 ? x1 : x2;
            var maxY = y1 > y2 ? y1 : y2;
            var cp = GetCenterforRect(rect);

            return (cp.X > minX && cp.X < maxX && cp.Y > minY && cp.Y < maxY);
        }
        return false;
    }

    JoinObj(item:SvgObj) {
        
        if(item.IsSupportDrop && item.IsSupportDrop()){
            if (item !== this.ChangeObj) {
                if (this.IsDrawJoin) {
                    item.Select()
                    this.JoinItem = item;
                }
            }
        }
    }
    UnJoinObj(item:SvgObj) {
        if (item !== this.ChangeObj) {
            if (this.IsDrawJoin) {
                item.UnSelect()
                this.JoinItem = null;
            }
        }
    }
    GetDrawPathCurve(endPoint:SvgPoint) {


        if(this.ChangeObj){
            var sJoinPoint = this.GetJoinPoint(this.ChangeObj, endPoint, true);
            var e = new SvgPoint;
            e.X = endPoint.X;
            e.Y = endPoint.Y;

            if (this.JoinItem) {
                var eJoinPoint = this.GetJoinPoint(this.JoinItem, sJoinPoint, false);
                e.X = eJoinPoint.X;
                e.Y = eJoinPoint.Y;
            }
            return GetPathCurveType(sJoinPoint, e);
        }
        return "";
        
    }

    GetJoinPointSvgToSvg(startObj:SvgObj,endObj:SvgObj){

        var startRect =startObj.Rect
        var endRect = endObj.Rect
       
        if (startRect && endRect) {
            var type = "exclude";
            var startXInclude = false;
            var endXInclude = false;
            var startYInclude = false;
            var endYInclude = false;

            var startType: string | undefined;
            var endType: string | undefined;
            if (startRect.X < endRect.X && startRect.X2 > endRect.X) {
                //end X시작점 포함
                startXInclude = true;
            }
            if (startRect.X < endRect.X2 && startRect.X2 > endRect.X2) {
                //end X종료점 포함
                endXInclude = true;
            }
            if (startRect.Y < endRect.Y && startRect.Y2 > endRect.Y) {
                //end Y시작점 포함
                startYInclude = true;
            }
            if (startRect.Y < endRect.Y2 && startRect.Y2 > endRect.Y2) {
                //end Y종료점 포함
                endYInclude = true;
            }

            if (startYInclude || endYInclude) {
                type = "horizontal"

            }
            else if (startXInclude || endXInclude) {
                type = "vertical";


            }

            if (!type) {
                var v = Math.atan2((endRect.CY - startRect.CY), (endRect.CX - startRect.CX)) * 180 / Math.PI + 90;
                if (v > 45 && v <= 135) {
                    type = "horizontal"
                }
                else if (v > 135 && v <= 225) {
                    type = "vertical";
                }
                else if (v > 225 && v <= 315) {
                    type = "horizontal"
                }
                else {
                    type = "vertical";
                }
            }
            if (type === "horizontal") {
                if (startRect.CX < endRect.CX) {
                    startType = "RC"
                    endType = 'LC'
                }
                else {

                    startType = "LC"
                    endType = 'RC'
                }
            }
            else {
                if (startRect.CY < endRect.CY) {
                    startType = "BC"
                    endType = 'TC'

                }
                else {
                    startType = "TC"
                    endType = 'BC'
                }
            }
    
            var startPoint = new SvgPoint();
            var endPoint = new SvgPoint();
            
            if(type !== "exclude"  && startType && endType){
                
                startPoint = _getPoint(startRect,startType,type)
                endPoint = _getPoint(endRect,endType,type)

                function _getPoint(rect:SvgRect,subType:string,type:string){
                    var rtn = new SvgPoint();
                    var sub = rect.SubObjs?.find(x=>x.Type===subType)
                    if(sub){
                        rtn.X = rect.X + sub.cX;
                        rtn.Y = rect.Y + sub.cY;
                        rtn.IsH = type=="horizontal"
                    }   
                    return rtn;
                }

                return {startPoint:startPoint,endPoint:endPoint}
            }    
        

            var sJoinPoint = this.GetJoinPoint(startObj, {X:endRect.CX,Y:endRect.CY}, true);
            var eJoinPoint = this.GetJoinPoint(endObj, sJoinPoint, false);
            return {startPoint:sJoinPoint,endPoint:eJoinPoint}
        }
        
    }
    GetJoinPoint(svgObj:SvgObj, endPoint:SvgPoint, isStart:boolean) {

       

        if (svgObj.IsPointFixed === false ) {
            
            var endX = endPoint.X;
            var endY = endPoint.Y;
            var cx = svgObj.Rect?svgObj.Rect.CX:0;
            var cy = svgObj.Rect?svgObj.Rect.CY:0;
            var v = Math.atan2((endY - cy), (endX - cx)) * 180 / Math.PI + 90;
            if (v < 0) {
                v = v + 360
            }
            var findType = "";
            
            var gap  = 0;

            if (this.JoinDrawType === "ALL") {



                if (v > 45 - gap && v <= 135 + gap) {
                    findType = "RC";
                }
                else if (v > 135 + gap && v <= 225 - gap) {
                    findType = "BC";
                }
                else if (v > 225 - gap && v <= 315 + gap) {
                    findType = "LC";
                }
                else {
                    findType = "TC";
                }
            }
            else {
                if (this.JoinDrawType === "LR") {

                    if (cx < endX) {
                        findType = "RC"
                    }
                    else {
                        findType = "LC"
                    }
                }
                else if (this.JoinDrawType === "BT") {

                    if (cy < endY) {
                        findType = "BC"
                    }
                    else {
                        findType = "TC"
                    }
                }
            }
           
        }
        else {
            if(isStart)
                findType = "RC"
            else    
                findType = "LC"
    
        }

        
        var obj = new SvgPoint();

        if(svgObj.Rect){
            for (var j in svgObj.Rect.SubObjs) {
                var sub = svgObj.Rect.SubObjs[parseInt(j)];

                if (this.IsDrawJoin)
                    sub.IsDown = sub.Type === findType;
                if (sub.Type === findType) {
                    if (this.IsDrawJoin)
                        this.SubRect = sub;
                    obj.X = svgObj.Rect.X + sub.cX;
                    obj.Y = svgObj.Rect.Y + sub.cY;
                    obj.IsH = findType === "RC" || findType === "LC";

                }
            }
        }
        

        return obj;

    }

}
