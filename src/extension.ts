import * as vscode from 'vscode';
import { EndPointsProvider } from './providers/endpointsProvider';
import { launchEndpoint } from './helpers/requestLauncher';
import { DefinitionsProvider } from './providers/definitionsProvider';
import { launchModel } from './helpers/requestHelper';
import { AvaWebView } from './util/basewebview';

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

	AvaWebView.extensionContext = context;
	// Launch endpoint command
	const epLaunchDisposable = vscode.commands.registerCommand('endpoint.launch', launchEndpoint);
	const modelLaunchDisposable = vscode.commands.registerCommand('model.launch', launchModel);

	context.subscriptions.push(apiEndpointsProviderDisposable, definitionsProviderDisposable, epLaunchDisposable, modelLaunchDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
