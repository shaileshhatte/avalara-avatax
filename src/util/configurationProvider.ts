import * as vscode from 'vscode';
import { getCredentials } from './authenticator';
import { AVConstants } from './avconstants';

const configurationSectionName: string = AVConstants.configurationSectionName;

/**
 * Retrieves the configuration value of given configuration property.
 * @param configName Name of the configuration
 */
export function getATConfiguration(configName: string): string | number | undefined {
	let configValue: string | number | undefined = undefined;
	try {
		configValue = vscode.workspace.getConfiguration(configurationSectionName).get(configName);
		return configValue;
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}
}

/**
 * Updates the value of the given configuration with new value.
 * @param configName Covfiguration that needs to be updated
 * @param newValue New Value that needs to be set
 */
export async function updateATConfiguration(configName: string, newValue: string) {
	try {
		const result = await vscode.workspace.getConfiguration(configurationSectionName).update(configName, newValue, true);
		return result;
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}
}

/**
 * Fetches the password for given account ID.
 * @param accountId Account ID to fetch password for.
 */
export async function getATLicenseKey(accountId: string): Promise<string> {
	let lKey: string = ``;
	try {
		lKey = (await getCredentials(accountId)) || ``;
		return Promise.resolve(lKey);
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
	return Promise.reject(lKey);
}
