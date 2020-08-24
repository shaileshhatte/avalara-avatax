"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchEndpoint = void 0;
// VSCode imports
const vscode = require("vscode");
// script imports
const basewebview_1 = require("../util/basewebview");
const requestGenerator = require("./requestGenerator");
const requestWebviewClient = require("../util/requestPanelClient");
/**
 * Launches a request webviewpanel for an endpoint
 * provided by extension context arguments.
 * Also launches a empty response webviewpanel on next viewcolumn.
 * @returns void
 */
function launchEndpoint() {
    try {
        if (!arguments) {
            console.error(`Command invoked without any arguments.`);
            vscode.window.showErrorMessage('Illegal command.');
            return;
        }
        const endpoint = arguments[0];
        const requestPanelTitle = `${endpoint.method.toUpperCase()} ${endpoint.operationId}`;
        const panel = basewebview_1.AvaWebView.getOrCreateRequestViewPanel(requestPanelTitle);
        if (panel) {
            panel.webview.html = generateRequestWebviewContent(endpoint);
        }
    }
    catch (err) {
        console.error(err);
        vscode.window.showInformationMessage(err);
    }
}
exports.launchEndpoint = launchEndpoint;
/**
 * Generates HTML page for request web view panel.
 * Inserts head, style, script content into it.
 * @param endpoint - Endpoint (of type EndpointMethod) for launching its request webview panel.
 * @returns HTML content for rendering on request webview panel
 */
function generateRequestWebviewContent(endpoint) {
    const bodyContent = requestGenerator.getRequestContentHtml(endpoint);
    const headTagContent = requestWebviewClient.getHeadContent();
    const scriptTagContent = requestWebviewClient.getScriptContent();
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
//# sourceMappingURL=requestLauncher.js.map