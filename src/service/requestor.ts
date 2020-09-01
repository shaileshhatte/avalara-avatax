// VSCode module imports
import * as vscode from 'vscode';
// NPM module imports
import * as axiosModule from 'axios';
const axios = axiosModule.default;
// script imports
import { processResponse } from '../helpers/responseHelper';

/**
 * Sends an API request to AvaTax.
 * Upon receiving the response, hands it over to `processResponse` method to process.
 * @param axiosConfig Axios Request configuration object
 */
export function sendRequest(axiosConfig: axiosModule.AxiosRequestConfig) {
	try {
		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				cancellable: false,
				title: `Request in progress...`
			},
			() => {
				return axios(axiosConfig)
					.then((res) => {
						processResponse(res);
					})
					.catch((err) => {
						processResponse(err);
					});
			}
		);
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}
}
