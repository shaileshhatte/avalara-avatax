import * as vscode from 'vscode';
import { sendRequest } from '../service/requestor';
import { createAxiosConfig } from '../service/requestFactory';

const testConnectionUrl: string = `/api/v2/utilities/ping`;

/**
 * Hands over valid data to service caller to make a service call
 * @param data Request data including model
 */
export async function makeRequest(data: any) {
	if (data) {
		try {
			if (data.reqbody && data.reqbody !== 'NA') {
				JSON.parse(data.reqbody);
			}
			const axiosConfig = await createAxiosConfig(data);
			if (axiosConfig) {
				sendRequest(axiosConfig);
			} else {
				throw new Error(`Problems constructing the request.`);
			}
		} catch (err) {
			vscode.window.showErrorMessage('Invalid Request Body.');
			console.error(err);
		}
	} else {
		vscode.window.showErrorMessage(`Missing request content.`);
	}
}
