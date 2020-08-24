"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptTagContent = exports.getHeadTagContent = exports.responseBodyAsHtml = void 0;
const vscode = require("vscode");
const basewebview_1 = require("./basewebview");
const nonceutil = require("../util/nonceutil");
// NPM imports
const xmlbeautify = require('xml-formatter');
const prettyPrintJson = require('pretty-print-json');
/**
 *  Generates HTML for response body
 * @param data Data received from the service
 * @param contentType content-type of the data (e.g. application/json)
 */
function responseBodyAsHtml(data, contentType) {
    let htmlContent = '';
    let formattedData = '';
    if (contentType.indexOf('xml') >= 0) {
        formattedData = xmlbeautify(data, {
            indentation: '    ',
            collapseContent: true
        });
        formattedData = `<textarea class='monospace' readonly>${formattedData}</textarea>`;
    }
    else if (contentType.indexOf('json') >= 0) {
        formattedData = prettyPrintJson.toHtml(data, {
            quoteKeys: true,
            indent: 3
        });
        formattedData = `<pre id='response-body' class='monospace response-body'>${formattedData}</pre>`;
    }
    else {
        formattedData = data.toString();
    }
    htmlContent += `<div>
						<div class='action-buttons-div'>
                            <input id='btn-copy' class='btn-copy' type='button' value='Copy'/>
                            <input id='btn-save' class='btn-save' type='button' value='Save'/>
                        </div>
                        <br>
						<div id='res-body'>
							${formattedData}
						</div>
                    </div>
                `;
    return htmlContent;
}
exports.responseBodyAsHtml = responseBodyAsHtml;
/**
 * Generated head tag content in HTML page.
 */
function getHeadTagContent() {
    let htmlContent = '';
    try {
        const styleTagContent = getStyleTagContent();
        htmlContent += styleTagContent;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}
exports.getHeadTagContent = getHeadTagContent;
/**
 * Generated style tag content for HTML page
 */
function getStyleTagContent() {
    let htmlContent = '';
    try {
        const nonce = nonceutil.getNonce();
        const avacontext = basewebview_1.AvaWebView.extensionContext;
        const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'responseStyle.css');
        console.log(stylePathOnDisk);
        const styleUri = basewebview_1.AvaWebView.getOrCreateResponseViewPanel().webview.asWebviewUri(stylePathOnDisk);
        htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}
/**
 * Generates script tag content for response panel
 */
function getScriptTagContent() {
    let scriptContent = '';
    try {
        const avacontext = basewebview_1.AvaWebView.extensionContext;
        const scriptPathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'js', 'responseClient.js');
        console.log(scriptPathOnDisk);
        const nonce = nonceutil.getNonce();
        const scriptUri = basewebview_1.AvaWebView.getOrCreateResponseViewPanel().webview.asWebviewUri(scriptPathOnDisk);
        scriptContent += `<script nonce='${nonce}' src='${scriptUri}'></script>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return scriptContent;
}
exports.getScriptTagContent = getScriptTagContent;
//# sourceMappingURL=responsePanelClient.js.map