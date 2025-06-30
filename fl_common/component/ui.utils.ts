import { MuiButtonStyle } from "flowline_common_model/result/models";
import React, { ReactNode } from "react";


export function GetBaseUrl(){
    var rtn = process.env.REACT_APP_API_BASE_URL
    if(!rtn){
        rtn = window.location.origin
    }
    return rtn;
}

export function GetBaseMcpUrl(){
    var rtn = process.env.REACT_APP_MCP_BASE_URL
    if(!rtn){
        rtn = window.location.origin
    }
    return rtn;
}
export function GetBaseSocketUrl(){
    var rtn = process.env.REACT_APP_WEBSOCKET_BASE_URL
    if(!rtn){
        rtn = window.location.origin
    }

    return rtn;
}
export function DownloadLink(staticID:string) {
    var rtn = GetBaseUrl() + '/api/File/Download?staticid=' + staticID;

    return rtn;
}

export function ImageLink(staticID:string) {
    var rtn = GetBaseUrl() + '/api/File/Image?staticid=' + staticID;

    return rtn;
}

export function Download(staticID:string, name:string) {
    var downloadLink = DownloadLink(staticID);
    const link = document.createElement('a');
    link.href = downloadLink;
    link.setAttribute('download', name + '.xlsm');
    // 3. Append to html page
    document.body.appendChild(link);
    // 4. Force download
    link.click();
    // 5. Clean up and remove the link
    link.parentNode?.removeChild(link);

    return;
    
}


export function GetKeyValueSessionStorageItems() {
    var rtn = [];
    const keys = Object.keys(sessionStorage);
    for (var i in keys) {
        var keyName = keys[i];

        var strValue = sessionStorage.getItem(keyName);
        rtn.push({ key: keyName, value: strValue });
    }
    return rtn;
}

export function ClearSessiontStroage(withOut:string[]) {
    var items = GetKeyValueSessionStorageItems();
    if (items) {
        for (var i in items) {
            var item = items[i];
            var strKey = item.key;
            if (withOut) {
                for (var j in withOut) {
                    if (strKey === withOut[j]) {
                        continue;
                    }
                }
            }
            sessionStorage.setItem(strKey, '');
        }
    }
}


export function IsEqualUrl(url:string) {
    
    if (!window.location.href || !url) {
        return false;
    }

    if (window.location.pathname + window.location.search === url) {
        return true;
    }

    return false;
}

export function IsContainUrl(url:string) {
    if (!window.location.href || !url) {
        return false;
    }

    var r = (window.location.pathname + window.location.search).includes(url, 0);

    return r;
}



export const GetDynamicButtonCss = (colorType:string|undefined) => {

    var rtn: MuiButtonStyle
        = { variant: "contained", color: "primary" }

    if (colorType) {
        var variantindex = colorType.indexOf("light");
        if (variantindex > -1) {
            rtn.variant = "outlined";
        }
        else
        {
            variantindex = colorType.indexOf("text");
            if (variantindex > -1) {
                rtn.variant = "text";
            }
        }
        if (colorType.indexOf("primary") > -1) {
            rtn.color = "primary";
        }
        else if (colorType.indexOf("secondary") > -1) {
            rtn.color = "secondary";
        }
        else if (colorType.indexOf("success") > -1) {
            rtn.color = "success";
        }
        else if (colorType.indexOf("error") > -1) {
            rtn.color = "error";
        }
        else if (colorType.indexOf("info") > -1) {
            rtn.color = "info";
        }
        else if (colorType.indexOf("warning") > -1) {
            rtn.color = "warning";
        }
    }
    

    return rtn;
}

export function StringToCss(str?:string) {
    if (str) {
        
        const str2: string = str.toString();
        var index: number = 0;
        for (const char of str2) {
            index += char.charCodeAt(0);
        }

        var v = index % 5;

        var bg = '';
        var txt = '';
        if (v === 0) {
            bg = 'bg-light-primary';
            txt = 'text-primary';
        } else if (v === 1) {
            bg = 'bg-light-warning';
            txt = 'text-warning';
        } else if (v === 2) {
            bg = 'bg-light-danger';
            txt = 'text-danger';
        } else if (v === 3) {
            bg = 'bg-light-info';
            txt = 'text-info';
        } else if (v === 4) {
            bg = 'bg-light-success';
            txt = 'text-success';
        }
        // else if (v === 5) {
        //     bg = 'bg-light-secondary';
        //     txt = 'text-primary';
        // }
        // else if (v === 6) {
        //     bg = 'bg-light-secondary';
        //     txt = 'text-warning';
        // }
       
        // else if (v === 7) {
        //     bg = 'bg-light-secondary';
        //     txt = 'text-danger';
        // }
       
        // else if (v === 8) {
        //     bg = 'bg-light-secondary';
        //     txt = 'text-info';
        // }
        // else if (v === 9) {
        //     bg = 'bg-light-secondary';
        //     txt = 'text-success';
        // }
        //  else if (v === 5) {
        //     bg = 'bg-primary';
        //     txt = 'text-light-primary';
        // } else if (v === 6) {
        //     bg = 'bg-warning';
        //     txt = 'text-light-warning';
        // } else if (v === 7) {
        //     bg = 'bg-danger';
        //     txt = 'text-light-danger';
        // } else if (v === 8) {
        //     bg = 'bg-info';
        //     txt = 'text-light-info';
        // } else if (v === 9) {
        //     bg = 'bg-success';
        //     txt = 'text-light-success';
        // }

        return `symbol-label ${bg}  ${txt}  fs-6 fw-bolder`;
    } else return 'symbol-label bg-light-danger text-danger fs-6 fw-bolder';
}

export function GetUserImgUrl(id?:string) {
    
    if (id !== null && id !== undefined && id !== '' && id !== 'ERROR')
        return `${GetBaseUrl()}${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/builder/azureuserimg?id=/${id}`;

    return '';
}

export function StringToChipColor(str:string): 'default'| 'primary' | 'secondary' |'error'| 'info' | 'success' | 'warning' {
    var index = 0;

    const str2: string = str.toString();
    var index: number = 0;
    for (const char of str2) {
        index += char.charCodeAt(0);
    }
    index += str?.length;

    var v = index % 7;

    var rtn = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'][v];

    if (rtn === "default" || rtn === "primary" || rtn === "secondary" || rtn === "error" || rtn === "info" || rtn === "success" || rtn === "warning") {
        return rtn;
    }
    else {
        return 'default';
    }
}
export function StringToChipVariant(str: string): 'filled' | 'outlined' {

    var index: number = str?.length;

    var v = index % 2;
    var rtn = ['filled', 'outlined'][v]

    if (rtn === "filled" || rtn === "outlined") {
        return rtn;
    }
    else {
        return 'outlined';
    }
}

export function StringToBadgeCss(str:string) {
    if (str) {

        if (str === "GET") {
            return `badge badge-light-success fs-8 fw-bold`;
        }
        else if (str === "POST") {
            return `badge badge-light-primary fs-8 fw-bold`;
        }
        else if (str === "DELETE") {
            return `badge badge-light-danger fs-8 fw-bold`;
        }
        else if (str === "PATCH") {
            return `badge badge-light-warning fs-8 fw-bold`;
        }
        else if (str === "PUT") {
            return `badge badge-light-info fs-8 fw-bold`;
        }
        else {
            var index = 0;
             
            const str2: string = str.toString();
            var index: number = 0;
            for (const char of str2) {
                index += char.charCodeAt(0);
            }
            index += str?.length;
            
            var v = index % 10;

            var bg = '';

            if (v === 0) {
                bg = 'badge-light-primary rounded-pill';
            } else if (v === 1) {
                bg = 'badge-light-warning rounded-pill';
            } else if (v === 2) {
                bg = 'badge-light-danger rounded-pill';
            } else if (v === 3) {
                bg = 'badge-light-info rounded-pill';
            } else if (v === 4) {
                bg = 'badge-light-success rounded-pill';
            } 
            else if (v === 5) {
                bg = 'badge-light-secondary text-primary rounded-pill';
            }
            else if (v === 6) {
                bg = 'badge-light-secondary text-warning rounded-pill';
            }
            else if (v === 7) {
                bg = 'badge-light-secondary text-danger rounded-pill';
            }
            else if (v === 8) {
                bg = 'badge-light-secondary text-info rounded-pill';
            }
            else if (v === 9) {
                bg = 'badge-light-secondary text-success rounded-pill';
            }
       
        // else if (v === 5) {
        //     bg = 'badge-primary badge-outlined';
        //     txt = 'text-light-primary';
        // } else if (v === 6) {
        //     bg = 'badge-warning badge-outlined';
        //     txt = 'text-light-warning';
        // } else if (v === 7) {
        //     bg = 'badge-danger badge-outlined';
        //     txt = 'text-light-danger';
        // } else if (v === 8) {
        //     bg = 'badge-info badge-outlined';
        //     txt = 'text-light-info';
        // } else if (v === 9) {
        //     bg = 'badge-success badge-outlined';
        //     txt = 'text-light-success';
        // }

            return `badge ${bg} fs-8 fw-bold`;
        }
    } else return 'badge badge-light-danger fs-8 fw-bold';
}

export function IndexToCss(index:number) {
    if (index) {
        var v = index % 10;
        if (v === 0) return 'primary';
        else if (v === 1) return 'warning';
        else if (v === 2) return 'danger';
        else if (v === 3) return 'info';
        else if (v === 4) return 'success';
        else if (v === 5) return 'light-primary';
        else if (v === 6) return 'light-warning';
        else if (v === 7) return 'light-danger';
        else if (v === 8) return 'light-info';
        else if (v === 9) return 'light-success';
    } else return 'danger';
}


export async function GetCache(isCache:boolean,codeKey:string|undefined, action:Function) {
    if (isCache && codeKey) {
        const strRtn = sessionStorage.getItem(codeKey);

        if (strRtn != null && strRtn !== undefined && strRtn.length > 0) {
            return JSON.parse(strRtn);
        }
        
    }
    
    var rtn = await action()
    if (rtn && codeKey) {
        sessionStorage.setItem(codeKey, JSON.stringify(rtn));
    }
    return rtn;


}

export function MoveScroll(parentID:string,targetID:string){
    var parentDiv = document.getElementById(parentID);
    var targetDiv = document.getElementById(targetID);
    if(parentDiv && targetDiv)
        parentDiv.scrollTop = targetDiv.offsetTop;
}


export function isHTMLString(str:string) {
    // 정규 표현식을 사용하여 HTML 태그를 검사
    const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
    return htmlTagPattern.test(str);
}
export function ReactNodeToString (children:ReactNode){

    const ConvertToString = (element: any) => {

        var rtn = '';
        if (element) {
            var type = typeof element;
            if (type === 'string') {
                rtn = element;
            }
            else if (type === 'object') {
                var childElement = element as React.ReactElement
                if (childElement.props.children) {
                    var strArry = React.Children.map(childElement.props.children, child => ConvertToString(child));
                    if (strArry) {
                        rtn = strArry.join('');
                    }
                }

            }
        }

        return rtn;
    }

    if (children) {
        var childArry = children as React.ReactChild;
        if (childArry) {
            var strArry = React.Children.map(childArry, child => ConvertToString(child));

            if (strArry && strArry.length > 0) {
                var str = strArry.join('');

                if (strArry.length === 1) {
                    var indexOf = str?.indexOf('\n');
                    if (indexOf > 0) {
                        return str
                    }
                }
                else
                    return str
            }

        }
    }

    return "";
}