import * as vscode from 'vscode';
import { fireRequest } from '../service/requestor';

/**
 * Hands over valid data to service caller to make a service call
 * @param data Request data including model
 */
export function makeRequest(data: any): void {
	if (data) {
		try {
			if (data.reqbody !== 'NA') {
				JSON.parse(data.reqbody);
			}
			fireRequest(data);
		} catch (err) {
			vscode.window.showErrorMessage('Invalid Request Body.');
			console.error(err);
		}
	} else {
		vscode.window.showErrorMessage(`Missing request content.`);
	}
}
