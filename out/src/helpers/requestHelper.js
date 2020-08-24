"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchModel = exports.showRequiredFieldsError = void 0;
const vscode = require("vscode");
const requestJsonGenerator_1 = require("./requestJsonGenerator");
const prettyPrintJson = require('pretty-print-json');
const basewebview_1 = require("../util/basewebview");
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
        // textDocumentContent = JSON.stringify(convertSchemaToJson(modelName, fromLink, onlyModel), null, 4);
        //	const modelName: string = data.model.trim() || '';
        // vscode.workspace.openTextDocument(filePath).then(vscode.window.showTextDocument);
        const panel = basewebview_1.AvaWebView.createModelViewPanel(modelName);
        if (panel) {
            let formattedData = prettyPrintJson.toHtml(modelData, {
                quoteKeys: true,
                indent: 3
            });
            formattedData = `<pre id='model-body' class='monospace model-body'>${formattedData}</pre>`;
            panel.webview.html = `<html><head><style> 
                                    
                                ${modelStyleContent()}

                                </style>
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
function modelStyleContent() {
    let htmlContent = '';
    htmlContent += `
                    .json-key {
                        color: #89d0d4;
                    }

                    .json-number {
                        color: #d8d842;
                    }

                    .json-string {
                        color: var(--vscode-editor-foreground);
                    }

                    .json-boolean {
                        color: #3fcc27;
                    }

                    .monospace {
                        font-family: input, menlo, lucida console, monospace;
                    }
                `;
    return htmlContent;
}
//# sourceMappingURL=requestHelper.js.map