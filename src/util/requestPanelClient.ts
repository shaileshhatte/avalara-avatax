// VSCode imports
import * as vscode from 'vscode';
import { AvaWebView } from './basewebview';
import * as nonceutil from '../util/nonceutil';
const prettyPrintJson = require('pretty-print-json');
import { convertSchemaToJson } from '../helpers/requestJsonGenerator';
import { generateDefinitionQuickPickItems } from '../providers/definitionsProvider';

/**
 * Provides content for head tag inside HTML page.
 * @returns string
 */
export function getHeadContent(nonce: string): string {
    let htmlContent = '';
    try {
        const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;

        const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'requestStyle.css');
        // console.log(stylePathOnDisk);
        const styleUri = AvaWebView.reqPanel?.webview.asWebviewUri(stylePathOnDisk);
        htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }

    return `<head>${htmlContent}</head>`;
}

/**
 * Generates a client-side behavior script for a request webview panel.
 * Communicates with extension and also maintains state.
 * @returns string
 */
export function getScriptContent(nonce: string): string {
    let htmlContent = '';
    try {
        const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;
        const scriptPathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'js', 'requestClient.js');
        const scriptUri = AvaWebView.reqPanel?.webview.asWebviewUri(scriptPathOnDisk);
        htmlContent += `<script nonce='${nonce}' src='${scriptUri}'></script>`;
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}

/**
 * Show error message notification in case there are any required fields left empty
 */
export function showRequiredFieldsError() {
    vscode.window.showErrorMessage(`Please provide values for all required fields.`);
    return;
}

/**
 * Launches a model view panel for provided model name
 * @param data Data received from the request panel - contains 'model' property with model name
 */
export async function launchModel(fromLink?: boolean, data?: any, onlyModel?: boolean) {
    let modelName: string = '';
    let generateFullModelExample: boolean = false;

    // If arguments.length is Zero – launched via command palette. show options.
    if (!arguments || !arguments.length) {
        modelName = await getModelNameFromQuickPick();
        onlyModel = false;
    } else {
        if (fromLink && data) {
            modelName = data.model.trim() || ''; // Launched  via model link on request body
        } else {
            /**
             * If arguments[0] contains string value, it means this method has been launched from treeview definition item click.
             * If arguments[0]['definitionName'] has value, it means that this is launched from context menu on model via 'Generate Example'.
             */
            let launchedFromViewItem: boolean = false; // false - launched from context menu
            if (typeof arguments[0] === 'string') {
                launchedFromViewItem = true; // true - launched from view item click
            }
            modelName = launchedFromViewItem ? arguments[0] : arguments[0]['definitionName'];
            // generateFullModelExample = launchedFromViewItem ? false : true;
            onlyModel = launchedFromViewItem ? true : false;
        }
    }

    if (!modelName) {
        return;
    }

    try {
        const modelData: any = convertSchemaToJson(modelName, generateFullModelExample, onlyModel);
        const panel: vscode.WebviewPanel = AvaWebView.createModelViewPanel(modelName);
        if (panel) {
            let formattedData = prettyPrintJson.toHtml(modelData, {
                quoteKeys: true,
                indent: 3
            });

            formattedData = `<pre id='model-body' class='monospace model-body'>${formattedData}</pre>`;

            panel.webview.html = `<html>
									<head>
										 ${modelStyleContent(panel)}
                                	</head>
									<body>
										${formattedData}
									</body>
                                </html>`;
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Provides style tag content for model web view panel
 * @param panel Model web view panel instance
 */
function modelStyleContent(panel: vscode.WebviewPanel): string {
    let htmlContent: string = '';
    try {
        const nonce = nonceutil.getNonce();
        const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;
        const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'modelStyle.css');

        const styleUri = panel.webview.asWebviewUri(stylePathOnDisk);
        htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }

    return htmlContent;
}

async function getModelNameFromQuickPick(): Promise<string> {
    let modelName: string = ``;

    try {
        let definitionQuickPickItems = generateDefinitionQuickPickItems();
        const pickedItem = await vscode.window.showQuickPick(definitionQuickPickItems, {
            placeHolder: `Select a model to view its example`
        });

        if (pickedItem) {
            modelName = pickedItem.label;
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return modelName;
}
