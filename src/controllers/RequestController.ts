import * as vscode from 'vscode';
import { sendRequest } from '../service/requestor';
import { createAxiosConfig } from '../service/requestFactory';
/** Local constants */
const MISSING_CONTENT: string = `Missing request content.`;
const PROBLEM_CONTRUCTING_REQUEST: string = `Problem constructing the request.`;
const INVALID_REQ_BODY: string = 'Invalid Request Body.';

/**
 * Hands over valid data to service caller to make a service call
 * @param data Request data including model
 */
export async function makeRequest(data: any): Promise<void> {
	if (data) {
		try {
			if (data.reqbody && data.reqbody !== 'NA') {
				JSON.parse(data.reqbody);
			}
			const axiosConfig = await createAxiosConfig(data);
			if (axiosConfig) {
				sendRequest(axiosConfig);
			} else {
				throw new Error(PROBLEM_CONTRUCTING_REQUEST);
			}
		} catch (err) {
			vscode.window.showErrorMessage(INVALID_REQ_BODY);
			console.error(err);
		}
	} else {
		vscode.window.showErrorMessage(MISSING_CONTENT);
	}
}
