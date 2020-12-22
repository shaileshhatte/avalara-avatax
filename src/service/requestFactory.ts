import * as axiosModule from 'axios';
import { getATConfiguration, getATLicenseKey } from '../util/configurationProvider';
import { Base64 } from 'js-base64';
import { Uri, window, workspace } from 'vscode';
import { AVConstants } from '../util/avconstants';
const FormData = require('form-data');
import * as fs from 'fs';
import * as path from 'path';

// Request Config constants
let ACCOUNT_NUMBER: string = '';
let LICENSE_KEY: string = '';
let ENV_TYPE: string = '';
let REQUEST_TIMEOUT: number = 0;
let BASE_URL: string = '';

// local constants
let endpointUrl: string = '';

/**
 * Creates axios request configuration
 * @param data Request data
 */
export async function createAxiosConfig(data: any): Promise<AxiosConfiguration | undefined> {
    let requestConfiguration: AxiosConfiguration | undefined;
    try {
        await setATSettings();
        if (data) {
            requestConfiguration = new AxiosConfiguration(data);
        }
    } catch (err) {
        console.error(err);
        window.showErrorMessage(err);
    }
    return requestConfiguration;
}

/**
 * Class that templates AxiosRequestConfig for generating request config
 */
class AxiosConfiguration implements axiosModule.AxiosRequestConfig {
    url: string;
    baseURL: string = BASE_URL;
    data: any;
    headers: any = {};
    formData: any;
    method: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH' | 'link' | 'LINK' | 'unlink' | 'UNLINK' | undefined;
    params: any;
    timeout: number;

    /**
     * Generates Axios request configurarion object of type `AxiosRequestConfig`. Mandatory parameters on `data` param (if not null) object – url, method
     * @param data Data object
     * @param endpointUrl Endpoint URL. If provided url property from the data object is ignored.
     */
    constructor(data: any) {
        // If there is a file to be uploaded
        if (!!data.parameters.filePath) {
            const content = fs.readFileSync(path.resolve(data.parameters.filePath), {
                encoding: `base64`
            });

            this.data = {
                file: content
            };

            this.headers['Content-Type'] = 'multipart/form-data';
        }
        this.url = generateEndpointUrl(data);
        this.data = data.reqbody ? (data.reqbody !== `NA` ? JSON.parse(data.reqbody) : ``) : ``;
        // If there is a file to be uploaded
        if (!!data.parameters.filePath) {
            const form = new FormData();
            form.append('file', fs.createReadStream(path.resolve(data.parameters.filePath)));
            this.data = form;
            this.headers = form.getHeaders() ? form.getHeaders() : {};
        }

        // Set headers
        if (data.parameters?.headervalues) {
            const headerObject = data.parameters?.headervalues;
            Object.keys(headerObject).forEach((key) => {
                this.headers[key] = headerObject[key];
            });
        }
        this.headers[`Authorization`] = `Basic ${Base64.encode(ACCOUNT_NUMBER + ':' + LICENSE_KEY)}`;

        if (data.parameters?.accepts && !data.parameters.filePath) {
            const acceptsArray: string[] = data.parameters?.accepts;
            let acceptsString: string = '';
            acceptsArray.forEach((item, index) => {
                acceptsString += item;
                if (index < acceptsArray.length - 1) {
                    acceptsString += `;`;
                }
            });
            this.headers[`Accept`] = acceptsString;
        }

        this.method = data.method ? data.method : ``;
        this.params = data.parameters?.queryvalues ? data.parameters?.queryvalues : {};
        this.timeout = REQUEST_TIMEOUT || 0;
    }
}

/**
 * Generates endpoint url from the data
 * @param data Request data
 */
function generateEndpointUrl(data: any): string {
    endpointUrl = data.url || ``;
    let pathParams: [] = data.parameters?.pathvalues || [];

    if (pathParams.length > 0) {
        let parameterObject: any = {};
        pathParams.forEach((param) => {
            const key = Object.keys(param)[0];
            const val = param[key];
            parameterObject[key] = val;
        });
        let paramsArray = [];
        var rxp = /{([^}]+)}/g,
            curMatch;

        while ((curMatch = rxp.exec(endpointUrl))) {
            paramsArray.push(curMatch[1]);
        }

        paramsArray.forEach((param) => {
            endpointUrl = endpointUrl.replace('{' + param + '}', parameterObject[param]);
        });
    }

    return endpointUrl;
}

/**
 * Sets AvaTax configuration values
 */
async function setATSettings() {
    try {
        ACCOUNT_NUMBER = (getATConfiguration(AVConstants.avataxAccountNumberConfigName) as string) || ``;
        LICENSE_KEY = (await getATLicenseKey(ACCOUNT_NUMBER)) || ``;
        ENV_TYPE = (getATConfiguration(AVConstants.environmentConfigName) as string) || ``;
        REQUEST_TIMEOUT = (getATConfiguration(AVConstants.requestTimeOutConfigName) as number) || 0;
        BASE_URL = ENV_TYPE === 'Sandbox' ? AVConstants.sandboxBaseUrl : AVConstants.productionBaseUrl;
    } catch (err) {
        console.error(err);
        window.showErrorMessage(err);
    }
}
