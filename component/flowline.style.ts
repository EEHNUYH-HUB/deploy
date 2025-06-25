//import { createTheme, Theme } from "@mui/material/index.js";

import { createTheme, Theme } from "@mui/material";
import { CSSProperties } from "react";

export class FlowLineStyle {

    public static Theme: 'light' | 'dark' | 'system'
    
    public static HeaderHeightInt: number = 30;
    public static HeaderHeight: string = `${FlowLineStyle.HeaderHeightInt}px`;
    public static HeaderMinHeight: string = "0px";

    public static FontSize: string = "0.85rem";
    public static FontFamily: string = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'//'Inter, Helvetica, "sans-serif"'
    public static FontColor = '#424242'
    public static ActiveFontColor = "#1976d2"
    public static TreeFontSize: string = "0.9rem";

    public static HeaderActiveBackgroundColor: string = "var(--bs-body-bg)";
    public static HeaderBackgroundColor: string = 'rgba(255, 255, 255, 0.12)'
    public static TabHeaderBackgroundColor: string = 'rgba(255, 255, 255, .05)'
    public static SplitColor:string = 'rgba(255, 255, 255, 0.5)'
    public static ContentBackgroundColor: string = "var(--bs-body-bg)"
    public static AppBackgroundColor= "var(--bs-body-bg)"
    public static IConColor: string = "var(--bs-gray)"//"#1976d2"//"#90caf9"//"#1976d2"

    public static ThCss:CSSProperties;
    
    public static CardCss:CSSProperties;
    public static LeftCss:CSSProperties;
    public static CardHeaderCss:CSSProperties;
    public static CardBodyCss:CSSProperties;
    public static CardTitle:CSSProperties;
    public static SelectOption:CSSProperties;
    
    public static SvgBackgroundColor: string = 'rgba(255, 255, 255, .05)'
    
    public static GridTitleColor = 'black'
    
    public static LabelColor = '#1976d2'
    
    public static SvgTitleColor = 'var(--bs-gray)'
    public static GridDefaultColor ='var(--bs-gray)';
    public static GridSubColor = 'var(--bs-gray)'
    public static BorderColor = "#eceff5";//'var(--bs-gray-300)';//'var(--bs-header-border-color);
    public static BorderStyle = "1px solid "+ FlowLineStyle.BorderColor
    public static LeftBorderColor = 'var(--bs-gray-200)'
    public static TextBoxInnerColor = 'var(--bs-gray-700)'
    public static StyleOverrides:any ;
    public static Gray =(v?:string)=>{
        return  `var(--bs-gray${v?`-${v}`:''})`
    }
    public static TextGray =(v?:string)=>{
        return  `var(--bs-text-gray${v?`-${v}`:''})`
    }
    public static BackgroundColor ='';
    public static HeaderBorderColor = 'var(--bs-header-border-color)'
    public static CardBorderColor = 'var(--bs-card-border-color)'
    public static CardBackgroundColor =     'var(--bs-card-bg)'
    
    public static CanvasContext2D:CanvasRenderingContext2D;
    
    public static Load() {
        var theme = localStorage.getItem("kt_theme_mode_value");
        if (theme === 'dark' || theme === 'light' || theme === 'system') {
            this.Theme = theme;
        }
        else {
            this.Theme = "light"
        }

        const context = document.createElement('canvas').getContext('2d');
        if (context) {
            context.font = '10.5px / 15.75px Inter, Helvetica, "sans-serif"';
            
            FlowLineStyle.CanvasContext2D = context;
        }

        if (this.Theme === "light") {
            FlowLineStyle.FontColor = '#424242'
            FlowLineStyle.ActiveFontColor = "#1976d2"
            FlowLineStyle.IConColor = 'var(--bs-gray)'
            FlowLineStyle.SvgTitleColor = FlowLineStyle.FontColor;//'var(--bs-gray)';
            
            
            FlowLineStyle.LabelColor = '#1976d2'
            FlowLineStyle.SvgBackgroundColor = 'var(--bs-gray-100)'
            FlowLineStyle.SplitColor = "rgb(244, 244, 244) "

            FlowLineStyle.BorderColor= "#eceff5";
            FlowLineStyle.BorderStyle = "1px solid "+ FlowLineStyle.BorderColor
            FlowLineStyle.BackgroundColor ="#fff";
            FlowLineStyle.GridTitleColor = FlowLineStyle.GridDefaultColor = 'rgb(0, 4, 68)'
            FlowLineStyle.GridSubColor = '#7081b9'
            FlowLineStyle.ThCss = { color: "#303e67", backgroundColor: "#f1f5fa", borderColor: FlowLineStyle.BorderColor, verticalAlign: "middle", fontWeight: 600, padding: "0.7rem" }
            
            FlowLineStyle.CardHeaderCss = {
                backgroundColor: FlowLineStyle.BackgroundColor,
                borderBottom: FlowLineStyle.BorderStyle,
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                padding: "var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x)"
            }
            FlowLineStyle.CardTitle = {
                textTransform: "capitalize",
                letterSpacing: ".02em",
                fontSize: "14px",
                fontWeight: 600,
                margin: 0,
                lineHeight: "22px",
                overflowWrap: "break-word",
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                color: "#303e67"
            }
            FlowLineStyle.CardBodyCss = {
                backgroundColor: FlowLineStyle.BackgroundColor,
                flex: "1 1 auto",
                padding: "var(--bs-card-spacer-y) var(--bs-card-spacer-x)",
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                color: "var(--bs-card-color)"
            }
        }
        else {
            FlowLineStyle.FontColor = '#FFFFFFB3'
            FlowLineStyle.ActiveFontColor = "#90caf9"
            FlowLineStyle.IConColor = '#FFFFFFB3'
            
            FlowLineStyle.SvgTitleColor = FlowLineStyle.FontColor;//'var(--bs-gray)';
            
            FlowLineStyle.AppBackgroundColor ="#202634"
            FlowLineStyle.BorderColor= "#333a4e";
            FlowLineStyle.BorderStyle = "1px solid "+ FlowLineStyle.BorderColor
            FlowLineStyle.BackgroundColor ="#293042";

            FlowLineStyle.LabelColor = '#90caf9'
            FlowLineStyle.SvgBackgroundColor = 'rgba(255, 255, 255, .05)'
            FlowLineStyle.SplitColor ='rgba(255, 255, 255, .05)'

            FlowLineStyle.GridTitleColor = FlowLineStyle.GridDefaultColor = 'rgb(212, 214, 217)'
            FlowLineStyle.GridSubColor = '#b6c2e4'
            FlowLineStyle.ThCss ={ color:"#eaf0f9",backgroundColor:"#30384c",borderColor:FlowLineStyle.BorderColor,verticalAlign:"middle",fontWeight:500,padding:"4.75px 8px"}
            
            
            

            FlowLineStyle.CardHeaderCss = {
                backgroundColor:FlowLineStyle.BackgroundColor,
                borderBottom: FlowLineStyle.BorderStyle,
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                padding: "var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x)"
            }
            FlowLineStyle.CardTitle = {
                textTransform: "capitalize",
                letterSpacing: ".02em",
                fontSize: "14px",
                fontWeight: 600,
                margin: 0,
                lineHeight: "22px",
                overflowWrap: "break-word",
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                color: "#eaf0f9"
            }
            FlowLineStyle.CardBodyCss = {
                backgroundColor: FlowLineStyle.BackgroundColor,
                flex: "1 1 auto",
                padding: "var(--bs-card-spacer-y) var(--bs-card-spacer-x)",
                borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",
                color: "var(--bs-card-color)"
            }
            
        }
        FlowLineStyle.LeftCss = {  borderRight: FlowLineStyle.BorderStyle, boxShadow: "none" }
        FlowLineStyle.CardCss = {...FlowLineStyle.LeftCss,backgroundColor: FlowLineStyle.BackgroundColor, border:FlowLineStyle.BorderStyle ,marginBottom: "16px",borderRadius: "calc(.5rem - 1px) calc(.5rem - 1px) 0 0",}

        FlowLineStyle.StyleOverrides = {
            root: {
                '--TextField-brandBorderColor': FlowLineStyle.BorderColor,
                '--TextField-brandBorderHoverColor': '#B2BAC2',
                '--TextField-brandBorderFocusedColor': '#6F7E8C',
                '&::before': {
                    borderBottom: '1px solid var(--TextField-brandBorderColor)',
                },
                '&:hover:not(.Mui-disabled, .Mui-error):before': {
                    borderBottom: '1px solid var(--TextField-brandBorderHoverColor)',
                },
                '&.Mui-focused:after': {
                    borderBottom: '1px solid var(--TextField-brandBorderFocusedColor)'
                },
                '& label': {
                    color: FlowLineStyle.TextBoxInnerColor,
                    fontSize: FlowLineStyle.TreeFontSize
                },
                '& span': {
                    color: FlowLineStyle.TextBoxInnerColor,
                    fontSize: FlowLineStyle.TreeFontSize,
                },
                'input[type="checkbox"]': {
                    paddingColor: '0px'
                },
                color: FlowLineStyle.TextBoxInnerColor,
                fontFamily: FlowLineStyle.FontFamily,
                fontSize: FlowLineStyle.TreeFontSize,
            },
        }

        FlowLineStyle.SelectOption ={backgroundColor:FlowLineStyle.HeaderBackgroundColor
            ,color: FlowLineStyle.FontColor
            ,fontSize:FlowLineStyle.FontSize,fontFamily:FlowLineStyle.FontFamily }
    }
    //'#FFFFFFB3' ,'#424242'
}



export const customTheme = (outerTheme: Theme) =>
    createTheme({
        palette: {
            mode: outerTheme.palette.mode,
        },
        components: {

            MuiSelect: { styleOverrides: FlowLineStyle.StyleOverrides },
            MuiTextField: { styleOverrides: FlowLineStyle.StyleOverrides },
            MuiInputLabel: { styleOverrides: FlowLineStyle.StyleOverrides },
            MuiFormControlLabel: { styleOverrides: FlowLineStyle.StyleOverrides },
            MuiCheckbox: { styleOverrides: FlowLineStyle.StyleOverrides },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 5,
                        backgroundColor: FlowLineStyle.CardBackgroundColor, borderColor: FlowLineStyle.LeftBorderColor
                    }
            }},
            // MuiTypography:{
            //     styleOverrides: {
            //         root: {
            //             color: FlowLineStyle.TextGray('600')
                        
            //         }
            // }},

            //   MuiOutlinedInput: {
            //     styleOverrides: {
            //       notchedOutline: {
            //         borderColor: 'var(--TextField-brandBorderColor)',
            //       },
            //       root: {
            //         [`&:hover .${outlinedInputClasses.notchedOutline}`]: {
            //           borderColor: 'var(--TextField-brandBorderHoverColor)',
            //         },
            //         [`&.Mui-focused .${outlinedInputClasses.notchedOutline}`]: {
            //           borderColor: 'var(--TextField-brandBorderFocusedColor)',
            //         },
            //       },
            //     },
            //   },
            //   MuiFilledInput: {
            //     styleOverrides: {
            //       root: {
            //         '&::before, &::after': {
            //           borderBottom: '1px solid var(--TextField-brandBorderColor)',
            //         },
            //         '&:hover:not(.Mui-disabled, .Mui-error):before': {
            //           borderBottom: '1px solid var(--TextField-brandBorderHoverColor)',
            //         },
            //         '&.Mui-focused:after': {
            //           borderBottom: '1px solid var(--TextField-brandBorderFocusedColor)',
            //         },
            //       },
            //     },
            //   },
            MuiInput: { styleOverrides: FlowLineStyle.StyleOverrides },
        },
    });
