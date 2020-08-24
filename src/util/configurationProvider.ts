import * as vscode from 'vscode';

export function getConfiguration(): any {
	try {
		const configurationObject = vscode.workspace.getConfiguration();

		const config: any = configurationObject['avalara'];
		return config;
	} catch (err) {
		vscode.window.showErrorMessage(`Configurations are not available. ${err}`);
	}
}
