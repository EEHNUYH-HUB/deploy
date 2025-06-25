import { SvgPoint } from "./svg.common.js";

export default class SvgMover {

    StartPoint?: SvgPoint;
    IsDown?: boolean;
    Point: SvgPoint;
    Scale: number
    OnMove?: (point: SvgPoint) => void
    constructor() {
        this.Point = new SvgPoint();
        this.Point.X = 0;
        this.Point.Y = 0;
        this.Scale = 1;
    }

    SetScale(s: number) {
        this.Scale = s;
        var isChange = false;
        var min = -1000 * this.Scale;

        if (this.Point.X < min) {
            this.Point.X = min;
            isChange = true;
        }
        if (this.Point.Y < min) {
            this.Point.Y = min;
            isChange = true;
        }

        if (isChange && this.OnMove)
            this.OnMove(this.Point)
    }
    MouseDown(eventArg: any) {
        this.IsDown = true;
        this.StartPoint = { X: eventArg.clientX/this.Scale, Y: eventArg.clientY/this.Scale };


    }
    MouseMove(eventArg: any) {

        
        if (this.IsDown && this.StartPoint) {

            var endPoint = { X: eventArg.clientX/this.Scale, Y: eventArg.clientY /this.Scale};
            var xV = this.StartPoint.X - endPoint.X;
            var yV = this.StartPoint.Y - endPoint.Y;

            this.StartPoint = endPoint;
            if (this.OnMove) {
                this.Point.X -= xV;
                this.Point.Y -= yV;

                // if (this.Point.X > 0) {
                //     this.Point.X = 0;
                // }
                // if (this.Point.Y > 0) {
                //     this.Point.Y = 0;
                // }
                // var min = -1000 * this.Scale;
                // if (this.Point.X < min) {
                //     this.Point.X = min;
                // }
                // if (this.Point.Y < min) {
                //     this.Point.Y = min;
                // }



                this.OnMove(this.Point)
            }
        }
    }


    MouseUp(eventArg: any) {
        this.IsDown = false;
    }

}
