import * as axiosModule from 'axios';
import { getATConfiguration, getATLicenseKey } from '../util/configurationProvider';
import { Base64 } from 'js-base64';
import { window } from 'vscode';

// AvaTax config constants
const avataxAccountNumberConfigName: string = `avataxaccountnumber`;
const environmentConfigName: string = `environment`;
const requestTimeOutConfigName: string = `requesttimeout`;
// Request Config constants
let ACCOUNT_NUMBER: string = '';
let LICENSE_KEY: string = '';
let ENV_TYPE: string = '';
let REQUEST_TIMEOUT: number = 0;
let BASE_URL: string = '';

const SANDBOX_BASE_URL: string = `https://sandbox-rest.avatax.com`;
const PRODUCTION_BASE_URL: string = `https://rest.avatax.com`;

// local constants
let endpointUrl: string = '';

class AxiosConfiguration implements axiosModule.AxiosRequestConfig {
	url: string;
	baseURL: string = BASE_URL;
	data: any;
	headers: any;
	method:
		| 'get'
		| 'GET'
		| 'delete'
		| 'DELETE'
		| 'head'
		| 'HEAD'
		| 'options'
		| 'OPTIONS'
		| 'post'
		| 'POST'
		| 'put'
		| 'PUT'
		| 'patch'
		| 'PATCH'
		| 'link'
		| 'LINK'
		| 'unlink'
		| 'UNLINK'
		| undefined;
	params: any;
	timeout: number;

	/**
	 * Generates Axios request configurarion object of type `AxiosRequestConfig`. Mandatory parameters on `data` param (if not null) object – url, method
	 * @param data Data object
	 * @param endpointUrl Endpoint URL. If provided url property from the data object is ignored.
	 */
	constructor(data: any) {
		this.url = generateEndpointUrl(data);
		this.data = data.reqbody ? (data.reqbody !== `NA` ? JSON.parse(data.reqbody) : ``) : ``;
		this.headers = data.parameters?.headervalues ? data.parameters?.headervalues : {};
		this.headers = getHeaders(data.parameters?.headervalues || undefined);
		this.method = data.method ? data.method : ``;
		this.params = data.parameters?.queryvalues ? data.parameters?.queryvalues : {};
		this.timeout = REQUEST_TIMEOUT || 0;
	}
}

function getHeaders(headerValues: any): any {
	let headerObject: any = {};
	if (headerValues) {
		headerObject = headerValues;
	}
	headerObject.Authorization = `Basic ${Base64.encode(ACCOUNT_NUMBER + ':' + LICENSE_KEY)}`;
	return headerObject;
}

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

async function setATSettings(data?: any) {
	if (data) {
		ACCOUNT_NUMBER = data.accountNumber || ``;
		LICENSE_KEY = data.licenseKey || ``;
	} else {
		try {
			ACCOUNT_NUMBER = (getATConfiguration(avataxAccountNumberConfigName) as string) || ``;
			LICENSE_KEY = (await getATLicenseKey(ACCOUNT_NUMBER)) || ``;
		} catch (err) {
			console.error(err);
			window.showErrorMessage(err);
		}
	}

	ENV_TYPE = (getATConfiguration(environmentConfigName) as string) || ``;
	REQUEST_TIMEOUT = (getATConfiguration(requestTimeOutConfigName) as number) || 0;
	BASE_URL = ENV_TYPE === 'Sandbox' ? SANDBOX_BASE_URL : PRODUCTION_BASE_URL;
}
