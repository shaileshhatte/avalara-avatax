"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptContent = exports.getHeadContent = void 0;
// VSCode imports
const vscode = require("vscode");
const basewebview_1 = require("./basewebview");
/**
 * Provides content for head tag inside HTML page.
 * @returns string
 */
function getHeadContent(nonce) {
    var _a;
    let htmlContent = '';
    try {
        const avacontext = basewebview_1.AvaWebView.extensionContext;
        const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'requestStyle.css');
        console.log(stylePathOnDisk);
        const styleUri = (_a = basewebview_1.AvaWebView.reqPanel) === null || _a === void 0 ? void 0 : _a.webview.asWebviewUri(stylePathOnDisk);
        htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return `<head>${htmlContent}</head>`;
}
exports.getHeadContent = getHeadContent;
/**
 * Generates a client-side behavior script for a request webview panel.
 * Communicates with extension and also maintains state.
 * @returns string
 */
function getScriptContent(nonce) {
    var _a;
    let htmlContent = '';
    try {
        const avacontext = basewebview_1.AvaWebView.extensionContext;
        const scriptPathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'js', 'requestClient.js');
        const scriptUri = (_a = basewebview_1.AvaWebView.reqPanel) === null || _a === void 0 ? void 0 : _a.webview.asWebviewUri(scriptPathOnDisk);
        htmlContent += `<script nonce='${nonce}' src='${scriptUri}'></script>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}
exports.getScriptContent = getScriptContent;
//# sourceMappingURL=requestPanelClient.js.map