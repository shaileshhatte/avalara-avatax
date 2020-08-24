import * as vscode from 'vscode';
import { convertSchemaToJson } from './requestJsonGenerator';
const prettyPrintJson = require('pretty-print-json');
import { AvaWebView } from '../util/basewebview';
import * as nonceutil from '../util/nonceutil';

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
export function launchModel(fromLink?: boolean, data?: any, onlyModel?: boolean) {
	let modelName: string = '';
	let textDocumentContent: string = '';
	if (fromLink && data) {
		modelName = data.model.trim() || '';
	} else {
		modelName = arguments[0];
		onlyModel = true;
	}

	try {
		const modelData: any = convertSchemaToJson(modelName, fromLink, onlyModel);

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

function modelStyleContent(panel: vscode.WebviewPanel): string {
	let htmlContent: string = '';
	try {
		const nonce = nonceutil.getNonce();
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;
		const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'modelStyle.css');
		console.log(stylePathOnDisk);
		const styleUri = panel.webview.asWebviewUri(stylePathOnDisk);
		htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return htmlContent;
}
