"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSnippet = exports.saveResponseBody = exports.copyResponseBody = exports.processResponse = void 0;
const vscode = require("vscode");
const basewebview_1 = require("../util/basewebview");
const responsePanelClient_1 = require("../util/responsePanelClient");
const fs_1 = require("fs");
const httpSnippetsGenerator_1 = require("../util/httpSnippetsGenerator");
let HTTPSnippet = require('httpsnippet');
let svcResult;
let contentType = '';
let contentDisposition = {
    attachment: false,
    filename: ''
};
let requestHeaders = {};
/**
 * Processes the HTTP service response that's received.
 * @param result HTTP response received from the service
 */
function processResponse(result) {
    svcResult = result || result.response;
    if (result.status >= 200 && result.status <= 300) {
        handleResponseSuccess(result);
    }
    else {
        handleResponseError(result);
    }
}
exports.processResponse = processResponse;
/**
 * Handles success procedure.
 * @param result Success data from the HTTP response
 */
function handleResponseSuccess(result) {
    // console.log(result);
    if (result.headers && result.headers['content-disposition']) {
        // "attachment; filename=PointOfSale.2020-07-30.json; filename*=UTF-8''PointOfSale.2020-07-30.json"}
        let dispositionString = result.headers['content-disposition'];
        contentDisposition.attachment = !!dispositionString.split(';')[0];
        contentDisposition.filename = dispositionString.split(';')[1].replace(`filename=`, ``).trim();
        vscode.window
            .showInformationMessage(`Service is trying to provide the response data as attachment. What would you like to do?`, {
            title: `Download`
        }, { title: `Show inline` })
            .then((val) => {
            switch (val === null || val === void 0 ? void 0 : val.title) {
                case 'Download':
                    // console.log('Download');
                    saveResponseBody();
                    break;
                default:
                    basewebview_1.AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(result);
                    break;
            }
        });
    }
    else {
        basewebview_1.AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(result);
    }
}
/**
 * Handles error procedure.
 * @param error Error data received
 */
function handleResponseError(error) {
    // console.log(error.code);
    // console.log(error.response);
    // console.log(error.toJSON);
    // console.log(error.name);
    // console.log(error.config);
    if (error.response) {
        basewebview_1.AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(error.response);
    }
    else {
        if (error.code && error.code === 'ENOTFOUND') {
            vscode.window.showErrorMessage(`Please check your internet settings\n. ${error.name}: ${error.message}`);
            return;
        }
        vscode.window.showErrorMessage(`${error.name}: ${error.message}`);
    }
}
/**
 * Generates HTML content for response panel.
 * @param result Data received from the service
 */
function generateResponseHtml(result) {
    const responseHeaderContent = getResponseHeaderContent(result);
    const bodyContent = responsePanelClient_1.responseBodyAsHtml(result.data || result.statusText, result.headers['content-type'] || '');
    const headTagContent = responsePanelClient_1.getHeadTagContent();
    const scriptTagContent = responsePanelClient_1.getScriptTagContent();
    return `<html> 
				${headTagContent}
				<body class='monospace response-html'>
                    <div id='main'>
                        ${responseHeaderContent}
						${bodyContent}
						${scriptTagContent} 
					</div>
				</body>
			</html>
		`;
}
/**
 * Extracts header content from the response and generates HTML content for displaying.
 * @param result Result received from the service
 */
function getResponseHeaderContent(result) {
    let htmlContent = '';
    // console.log(result.config);
    // console.log(result.request);
    const baseUrl = result.request.res.responseUrl || 'NA';
    const responseStatus = `${result.status} ${result.statusText}`;
    const headersObject = result.headers;
    const rawHeaders = result.request ? result.request.res['rawHeaders'] : [];
    let requestHeadersHTML = '';
    if (rawHeaders) {
        for (let i = 0; i < rawHeaders.length; i++) {
            if (i % 2 === 0) {
                requestHeaders[rawHeaders[i].toString().trim()] = rawHeaders[i + 1].toString().trim() || '-';
            }
            continue;
        }
    }
    if (requestHeaders) {
        requestHeadersHTML += ``;
        Object.keys(requestHeaders).forEach((header) => {
            requestHeadersHTML += `
									<p><span class='header-label'>${header}</span>: ${requestHeaders[header]}</p>
									`;
        });
    }
    const date = headersObject.date;
    contentType = headersObject['content-type'];
    const location = headersObject.location || '';
    htmlContent += `<table class='request-url-table'>
						<tr>
							<td>
								<span class='request-url-label'>Request URL:</span>
							</td>
							<td>
								<input id='btn-generate-code-snippet' class='btn-generate-code-snippet' type='button' value='Generate Code Snippet'/>
							</td>
						</tr>
						<tr>
							<td colspan='2'><span class='base-url'>${baseUrl}</span></td>
						</tr>
					</table>
				
					<div id='header-div' class='header-div'>
						<p>${location} ${responseStatus}</p>
						${requestHeadersHTML}
					</div>
					`;
    return htmlContent;
}
/**
 * Handles command for copying response body
 */
function copyResponseBody() {
    // const d = responseBody;
    // console.log(`Inside copy \n${responseBody}`);
    const clipboard = vscode.env.clipboard;
    if (clipboard) {
        clipboard.writeText(JSON.stringify(svcResult.data) || svcResult.statusText).then(() => {
            vscode.window.showInformationMessage('Response copied to clipboard.');
        });
    }
    else {
        vscode.window.showErrorMessage('Error: Clipboard may not be accessible.');
    }
}
exports.copyResponseBody = copyResponseBody;
/**
 * Handles action for saving response body based on its type
 */
function saveResponseBody() {
    let filters = {};
    let fullResponse = svcResult.data || svcResult.statusText;
    const headersObject = svcResult.headers;
    contentType = headersObject['content-type'];
    let ext = '.json';
    if (contentType.indexOf('json') >= 0) {
        filters['JSON'] = [ext];
        fullResponse = JSON.stringify(svcResult.data);
    }
    else if (contentType.indexOf('xml') >= 0) {
        ext = '.xml';
        filters['XML'] = [ext];
        fullResponse = svcResult.data.toString();
    }
    else {
        filters['HTML'] = ['.html', '.htm'];
        filters['Text'] = ['.txt'];
    }
    const filename = contentDisposition.filename ? contentDisposition.filename : `untitled${ext}`;
    try {
        vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(filename) }).then((uri) => {
            if (!uri) {
                return;
            }
            const filePath = uri.fsPath;
            fs_1.writeFile(filePath, fullResponse, () => {
                vscode.window.showInformationMessage(`File saved to: ${filePath}.`, { title: `Open` }).then((val) => {
                    if ((val === null || val === void 0 ? void 0 : val.title) === `Open`) {
                        vscode.workspace.openTextDocument(filePath).then(vscode.window.showTextDocument);
                    }
                });
            });
        });
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}
exports.saveResponseBody = saveResponseBody;
function generateSnippet() {
    //console.log(svcResult);
    httpSnippetsGenerator_1.genSnippet(svcResult);
}
exports.generateSnippet = generateSnippet;
//# sourceMappingURL=responseHelper.js.map