// VSCode imports
import * as vscode from 'vscode';
// script imports
import { AvaWebView } from '../util/basewebview';
import { EndpointMethod } from '../models/EndpointMethod';
import * as requestGenerator from './requestGenerator';
import * as requestWebviewClient from '../util/requestPanelClient';

import * as nonceutil from '../util/nonceutil';

/**
 * Launches a request webviewpanel for an endpoint
 * provided by extension context arguments.
 * Also launches a empty response webviewpanel on next viewcolumn.
 * @returns void
 */
export function launchEndpoint(): void {
	try {
		// console.log(context.extensionUri);
		// console.log(arguments[0]);
		if (!arguments) {
			// console.error(`Command invoked without any arguments.`);
			vscode.window.showErrorMessage('Illegal command.');
			return;
		}
		const endpoint: EndpointMethod = arguments[0];
		const requestPanelTitle: string = `${endpoint.method.toUpperCase()} ${endpoint.operationId}`;

		const panel: vscode.WebviewPanel | undefined = AvaWebView.getOrCreateRequestViewPanel(requestPanelTitle);
		if (panel) {
			panel.webview.html = generateRequestWebviewContent(endpoint);
		}
	} catch (err) {
		console.error(err);
		vscode.window.showInformationMessage(err);
	}
}

/**
 * Generates HTML page for request web view panel.
 * Inserts head, style, script content into it.
 * @param endpoint - Endpoint (of type EndpointMethod) for launching its request webview panel.
 * @returns HTML content for rendering on request webview panel
 */
function generateRequestWebviewContent(endpoint: EndpointMethod): string {
	const nonce = nonceutil.getNonce();

	const bodyContent = requestGenerator.getRequestContentHtml(endpoint);
	const headTagContent = requestWebviewClient.getHeadContent(nonce);
	const scriptTagContent = requestWebviewClient.getScriptContent(nonce);

	const htmlContent = `<html> 
				${headTagContent}
				<body>
					<div id='main' data-method='${endpoint.method}' data-url='${endpoint.urlLabel}'>
						${bodyContent}
						${scriptTagContent} 
					</div>
				</body>
			</html>
		`;

	return htmlContent;
}
