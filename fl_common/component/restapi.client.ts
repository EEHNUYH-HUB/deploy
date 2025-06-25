import axios, { AxiosInstance } from "axios";

import { ConvertJsonToKeyValueObject, ConvertKeyValueObjectToObject } from 'flowline_common_model/src/util.common'
import { GetBaseUrl } from './ui.utils.js';




export default class APIClient {
  
  
  
  axiosService: AxiosInstance;
  
  constructor() {
    this.axiosService = this._createInstance();
  }

  private _createInstance() {
    const instance = axios.create({
      baseURL: GetBaseUrl(),
    });

    return this._setInterceptors(instance);
  }
  private _setInterceptors(instance: AxiosInstance) {
    var _self = this;
    instance.interceptors.request.use(
      function (config) {
          config.headers.Authorization = sessionStorage.getItem("apikey");
          config.headers['usr-id'] = sessionStorage.getItem("usr-id");
          config.headers['usr-current-project'] = sessionStorage.getItem("usr-current-project");
          config.headers['usr-token'] = sessionStorage.getItem("usr-token");
          
        return config;
      },
      function (e) {
        _self._errorMethod(e);
      }
    );

    instance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (e) {
        _self._errorMethod(e);
      }
    );
    return instance;
  }
  private _errorMethod(error: any) {

    return Promise.reject(error);
  }
  
  

  async Post(path: string, parameter: any) {
       const rtn = await this.axiosService.post(
         `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${path}`,
         ConvertKeyValueObjectToObject(parameter)
       );

       return rtn?.data;

  }

  async Get(path: string) {
       const rtn = await this.axiosService.get(
         `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${path}`
      );
      return rtn?.data;

  }
  async Delete(path: string) {
       const rtn = await this.axiosService.delete(
         `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${path}`
       );

       return rtn?.data;

  }

  async FileUpload(path: string, file: string | Blob, parameter: any | undefined, progressHandler: Function) {
    let formData = new FormData()
    formData.append("file", file)
    if (parameter) {
      var keyvalue = ConvertJsonToKeyValueObject(parameter);
      if (keyvalue) {
        for (var i in keyvalue) {
          formData.append(keyvalue[i].key, keyvalue[i].value)
        }
      }
    }
    formData.append("param", parameter)

    var url = `${process.env.REACT_APP_API_BASE_APPLICACTION_NAME}/${path}`;
    var config = {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (data: any) => {
        if (data.total)
          progressHandler(Math.round((100 * data.loaded) / data.total))
      }
    };
    const rtn = 
    await this.axiosService.post(url, formData,config)
    return rtn?.data;
  }

}
