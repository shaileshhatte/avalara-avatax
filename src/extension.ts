import * as vscode from 'vscode';
import { EndPointsProvider } from './providers/endpointsProvider';
import { launchEndpoint, launchTaxCalculationEndpoint, launchAddressCalculationEndpoint } from './helpers/requestLauncher';
import { DefinitionsProvider } from './providers/definitionsProvider';
import { launchModel } from './util/requestPanelClient';
import { AvaWebView } from './util/basewebview';
import { setupAvataxCredentials, deleteCredentials } from './util/authenticator';

/**
 * A function that's invoked when the extension is activated.
 * @param context VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
	// API Endpoints provider
	const endPointsProvider = new EndPointsProvider();
	const apiEndpointsProviderDisposable = vscode.window.registerTreeDataProvider('api-endpoints', endPointsProvider);
	vscode.window.createTreeView('api-endpoints', {
		treeDataProvider: endPointsProvider
	});

	// Request model definition provider
	const definitionsProvider = new DefinitionsProvider();
	const definitionsProviderDisposable = vscode.window.registerTreeDataProvider('definition-models', definitionsProvider);
	vscode.window.createTreeView('definition-models', {
		treeDataProvider: definitionsProvider
	});

	// Share the Extension context so its accessible for using static resources
	AvaWebView.extensionContext = context;

	// Command - Setup AvaTax credentials
	const setupCredentialsDisposable = vscode.commands.registerCommand('avatax.setup', setupAvataxCredentials);
	// Command - Launch endpoint command
	const epLaunchDisposable = vscode.commands.registerCommand('endpoint.launch', launchEndpoint);
	const modelLaunchDisposable = vscode.commands.registerCommand('model.launch', launchModel);

	// Command - tax calculation
	const epTaxLaunchDisposable = vscode.commands.registerCommand('taxendpoint.launch', launchTaxCalculationEndpoint);
	// Command - Launch address validation
	const epAddressLaunchDisposable = vscode.commands.registerCommand('addressendpoint.launch', launchAddressCalculationEndpoint);

	context.subscriptions.push(
		apiEndpointsProviderDisposable,
		definitionsProviderDisposable,
		setupCredentialsDisposable,
		epLaunchDisposable,
		modelLaunchDisposable,
		epTaxLaunchDisposable,
		epAddressLaunchDisposable
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
	// Delete account credentials from the system keychain
	deleteCredentials();
}
