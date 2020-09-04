import * as vscode from 'vscode';
import { AxiosResponse, AxiosError } from 'axios';
import { writeFile } from 'fs';
import { AvaWebView } from '../util/basewebview';
import { getHeadTagContent, getScriptTagContent, responseBodyAsHtml } from '../util/responsePanelClient';
import { genSnippet } from '../util/httpSnippetsGenerator';

let svcResult: AxiosResponse;
let contentType: string = '';
let contentDisposition: any = {
	attachment: false,
	filename: ''
};

/**
 * Processes the HTTP service response that's received.
 * @param result HTTP response received from the service
 */
export async function processResponse(result: AxiosResponse | AxiosError) {
	svcResult = (result as AxiosResponse) || (result as AxiosError).response;
	if ((result as AxiosResponse).status >= 200 && (result as AxiosResponse).status <= 300) {
		await handleResponseSuccess(result as AxiosResponse);
	} else {
		handleResponseError(result as AxiosError);
	}
}

/**
 * Handles success procedure.
 * @param result Success data from the HTTP response
 */
async function handleResponseSuccess(result: AxiosResponse): Promise<void> {
	try {
		if (result.headers && result.headers['content-disposition']) {
			let dispositionString: string = result.headers['content-disposition'];
			contentDisposition.attachment = !!dispositionString.split(';')[0];
			contentDisposition.filename = dispositionString.split(';')[1].replace(`filename=`, ``).trim();
			const val = await vscode.window.showInformationMessage(
				`Service response is also available as an attachment.`,
				{
					title: `Download`
				},
				{ title: `Show Inline` }
			);

			if (val) {
				switch (val?.title) {
					case 'Download':
						saveResponseBody();
						break;
					default:
						AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(result);
						break;
				}
			}
		} else {
			AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(result);
		}
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
}

/**
 * Handles error procedure.
 * @param error Error data received
 */
function handleResponseError(error: AxiosError) {
	if (error.response) {
		AvaWebView.getOrCreateResponseViewPanel().webview.html = generateResponseHtml(error.response);
	} else {
		if (error.code && error.code === 'ENOTFOUND') {
			vscode.window.showErrorMessage(`Please check your internet settings\n. ${error.message}`);
			return;
		}
		vscode.window.showErrorMessage(`${error.name}: ${error.message}`);
	}
}

/**
 * Generates HTML content for response panel.
 * @param result Data received from the service
 */
function generateResponseHtml(result: AxiosResponse): string {
	let htmlContent: string = '';
	const responseHeaderContent = getResponseHeaderContent(result);
	const bodyContent = responseBodyAsHtml(result.data || result.statusText, result.headers['content-type'] || '');
	const headTagContent = getHeadTagContent();
	const scriptTagContent = getScriptTagContent();

	console.log(result);

	try {
		htmlContent += `<html> 
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
	} catch (err) {
		console.error(err);
	}

	return htmlContent;
}

/**
 * Extracts header content from the response and generates HTML content for displaying.
 * @param result Result received from the service
 */
function getResponseHeaderContent(result: AxiosResponse): string {
	let htmlContent: string = '';

	try {
		const baseUrl: string = result.request.res.responseUrl || 'NA';
		const responseStatus: string = `${result.status} ${result.statusText}`;
		const headersObject = result.headers;
		const rawHeaders = result.request ? result.request.res['rawHeaders'] : [];

		let requestHeadersHTML: string = '';
		let requestHeaders: any = {};

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

		const date: string = headersObject.date;
		contentType = headersObject['content-type'];
		const location: string = headersObject.location || '';

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
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
	return htmlContent;
}

/**
 * Handles command for copying response body
 */
export function copyResponseBody() {
	try {
		const clipboard: vscode.Clipboard = vscode.env.clipboard;
		if (clipboard) {
			clipboard.writeText(JSON.stringify(svcResult.data) || svcResult.statusText).then(() => {
				vscode.window.showInformationMessage('Response copied to clipboard.');
			});
		} else {
			vscode.window.showErrorMessage('Error: Clipboard may not be accessible.');
		}
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
}

/**
 * Handles action for saving response body based on its type
 */
export async function saveResponseBody() {
	let filters: any = {};
	try {
		let fullResponse: string = svcResult.data || svcResult.statusText;

		const headersObject = svcResult.headers;
		contentType = headersObject['content-type'];

		let ext: string = '.json';
		if (contentType.indexOf('json') >= 0) {
			filters['JSON'] = [ext];
			fullResponse = JSON.stringify(svcResult.data);
		} else if (contentType.indexOf('xml') >= 0) {
			ext = '.xml';
			filters['XML'] = [ext];
			fullResponse = svcResult.data.toString();
		} else {
			filters['HTML'] = ['.html', '.htm'];
			filters['Text'] = ['.txt'];
		}

		const filename: string = contentDisposition.filename ? contentDisposition.filename : `untitled${ext}`;

		const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(filename) });
		if (uri) {
			const filePath = uri.fsPath;
			writeFile(filePath, fullResponse, async () => {
				const val = await vscode.window.showInformationMessage(`File saved to: ${filePath}.`, { title: `Open` });
				if (val?.title) {
					const textDocument = await vscode.workspace.openTextDocument(filePath);
					await vscode.window.showTextDocument(textDocument);
				}
			});
		}
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
}

export function generateSnippet() {
	genSnippet(svcResult);
}
