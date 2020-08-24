"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchModel = exports.showRequiredFieldsError = void 0;
const vscode = require("vscode");
const requestJsonGenerator_1 = require("./requestJsonGenerator");
const prettyPrintJson = require('pretty-print-json');
const basewebview_1 = require("../util/basewebview");
const nonceutil = require("../util/nonceutil");
/**
 * Show error message notification in case there are any required fields left empty
 */
function showRequiredFieldsError() {
    vscode.window.showErrorMessage(`Please provide values for all required fields.`);
    return;
}
exports.showRequiredFieldsError = showRequiredFieldsError;
/**
 * Launches a model view panel for provided model name
 * @param data Data received from the request panel - contains 'model' property with model name
 */
function launchModel(fromLink, data, onlyModel) {
    let modelName = '';
    let textDocumentContent = '';
    if (fromLink && data) {
        modelName = data.model.trim() || '';
    }
    else {
        modelName = arguments[0];
        onlyModel = true;
    }
    try {
        const modelData = requestJsonGenerator_1.convertSchemaToJson(modelName, fromLink, onlyModel);
        const panel = basewebview_1.AvaWebView.createModelViewPanel(modelName);
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
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}
exports.launchModel = launchModel;
function modelStyleContent(panel) {
    let htmlContent = '';
    try {
        const nonce = nonceutil.getNonce();
        const avacontext = basewebview_1.AvaWebView.extensionContext;
        const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'modelStyle.css');
        console.log(stylePathOnDisk);
        const styleUri = panel.webview.asWebviewUri(stylePathOnDisk);
        htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}
//# sourceMappingURL=requestHelper.js.map