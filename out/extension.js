"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const endpointsProvider_1 = require("./providers/endpointsProvider");
const requestLauncher_1 = require("./helpers/requestLauncher");
const definitionsProvider_1 = require("./providers/definitionsProvider");
const requestHelper_1 = require("./helpers/requestHelper");
const basewebview_1 = require("./util/basewebview");
function activate(context) {
    // API Endpoints provider
    const endPointsProvider = new endpointsProvider_1.EndPointsProvider();
    const apiEndpointsProviderDisposable = vscode.window.registerTreeDataProvider('api-endpoints', endPointsProvider);
    vscode.window.createTreeView('api-endpoints', {
        treeDataProvider: endPointsProvider
    });
    // Request model definition provider
    const definitionsProvider = new definitionsProvider_1.DefinitionsProvider();
    const definitionsProviderDisposable = vscode.window.registerTreeDataProvider('definition-models', definitionsProvider);
    vscode.window.createTreeView('definition-models', {
        treeDataProvider: definitionsProvider
    });
    basewebview_1.AvaWebView.extensionContext = context;
    // Launch endpoint command
    const epLaunchDisposable = vscode.commands.registerCommand('endpoint.launch', requestLauncher_1.launchEndpoint);
    const modelLaunchDisposable = vscode.commands.registerCommand('model.launch', requestHelper_1.launchModel);
    context.subscriptions.push(apiEndpointsProviderDisposable, definitionsProviderDisposable, epLaunchDisposable, modelLaunchDisposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map