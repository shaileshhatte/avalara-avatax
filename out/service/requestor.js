"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fireRequest = void 0;
// VSCode module imports
const vscode = require("vscode");
// NPM module imports
const axiosModule = require("axios");
const Base64 = require("js-base64");
// script imports
const responseHelper_1 = require("../helpers/responseHelper");
const configurationProvider_1 = require("../util/configurationProvider");
/**
 * Constants
 */
const axios = axiosModule.default;
const config = configurationProvider_1.getConfiguration();
const ACCOUNT_NUMBER = config[`avataxaccountnumber`]; // '2000928076';
const LICENSE_KEY = config[`avataxlicensekey`]; //'64E43E6D81DA7113';
const REQUEST_TIMEOUT = config[`requesttimeout`]; // 0
const ENV_TYPE = config[`environment`];
const BASE_URL = ENV_TYPE === 'Sandbox' ? `https://sandbox-rest.avatax.com` : 'https://rest.avatax.com';
// svc.addHeader('Accept', 'application/json');
// svc.addHeader('X-Avalara-Client', clientHeaderStr);
// svc.addHeader('Authorization', 'Basic ' + encodedAuthStr);
let endpointUrl = '';
let endpointMethod;
let requestBody = '';
let axiosConfig = {};
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
exports.fireRequest = (data) => {
    if (!ACCOUNT_NUMBER || !LICENSE_KEY) {
        vscode.window.showErrorMessage(`AvaTax account credentials missing. Go to Settings > Extensions > Avalara, and configure your AvaTax credentials.`);
        return;
    }
    setup(data);
    try {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
            title: `Request in progress...`
        }, () => {
            return axios(axiosConfig)
                .then((res) => {
                responseHelper_1.processResponse(res);
            })
                .catch((err) => {
                responseHelper_1.processResponse(err);
            });
        });
        // axios(axiosConfig)
        // 	.then((res) => {
        // 		processResponse(res);
        // 	})
        // 	.catch((err) => {
        // 		processResponse(err);
        // 	});
    }
    catch (err) {
        vscode.window.showErrorMessage(err);
    }
};
const setup = (data) => {
    try {
        endpointUrl = data.url || '';
        endpointMethod = data.method || 'GET';
        requestBody = data.reqbody;
        // console.log(data);
        if (!!data.parameters) {
            let headerParams = data.parameters.headervalues;
            let queryParams = data.parameters.queryvalues;
            let pathParams = data.parameters.pathvalues;
            if (headerParams.length > 0) {
                headerParams.forEach((param) => {
                    const key = Object.keys(param)[0];
                    const val = param[key];
                    axiosConfig.headers = { key: val };
                });
            }
            if (queryParams.length > 0) {
                let parameterObject = {};
                queryParams.forEach((param) => {
                    let key = Object.keys(param)[0];
                    let val = param[key];
                    parameterObject[key] = val;
                });
                if (Object.keys(parameterObject).length > 0) {
                    // endpointUrl += '?';
                    let count = Object.keys(parameterObject).length;
                    Object.keys(parameterObject).forEach((key, index) => {
                        //		console.log(`${index} ${key}`);
                        if (!!parameterObject[key]) {
                            endpointUrl +=
                                (index === 0 ? '?' : '') +
                                    encodeURIComponent(key) +
                                    '=' +
                                    encodeURIComponent(parameterObject[key]) +
                                    (index < count - 1 ? '&' : '');
                        }
                    });
                    if (endpointUrl.charAt(endpointUrl.length - 1) === '&') {
                        endpointUrl = endpointUrl.substr(0, endpointUrl.length - 1);
                    }
                }
            }
            if (pathParams.length > 0) {
                let parameterObject = {};
                pathParams.forEach((param) => {
                    const key = Object.keys(param)[0];
                    const val = param[key];
                    parameterObject[key] = val;
                });
                let paramsArray = [];
                var rxp = /{([^}]+)}/g, curMatch;
                while ((curMatch = rxp.exec(endpointUrl))) {
                    paramsArray.push(curMatch[1]);
                }
                // console.log(paramsArray);
                paramsArray.forEach((param) => {
                    // console.log('{' + param + '}');
                    endpointUrl = endpointUrl.replace('{' + param + '}', parameterObject[param]);
                });
                // console.log(endpointUrl);
            }
        }
        // console.log(baseURL + endpointUrl);
        axiosConfig.baseURL = BASE_URL;
        axiosConfig.url = endpointUrl;
        axiosConfig.timeout = REQUEST_TIMEOUT || 0;
        axiosConfig.method = endpointMethod;
        axiosConfig.headers = {
            Authorization: `Basic ${Base64.encode(ACCOUNT_NUMBER + ':' + LICENSE_KEY)}`
        };
        axiosConfig.data = data.reqbody !== 'NA' ? JSON.parse(data.reqbody) : '';
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
};
//# sourceMappingURL=requestor.js.map