import * as vscode from 'vscode';
import { AvaWebView } from './basewebview';
import * as nonceutil from '../util/nonceutil';

// NPM imports
const xmlbeautify = require('xml-formatter');
const prettyPrintJson = require('pretty-print-json');

/**
 *  Generates HTML for response body
 * @param data Data received from the service
 * @param contentType content-type of the data (e.g. application/json)
 */
export function responseBodyAsHtml(data: string, contentType: string): string {
	let htmlContent: string = '';
	let formattedData: string = '';

	if (contentType.indexOf('xml') >= 0) {
		formattedData = xmlbeautify(data, {
			indentation: '    ',
			collapseContent: true
		});

		formattedData = `<textarea class='monospace' readonly>${formattedData}</textarea>`;
	} else if (contentType.indexOf('json') >= 0) {
		formattedData = prettyPrintJson.toHtml(data, {
			quoteKeys: true,
			indent: 3
		});

		formattedData = `<pre id='response-body' class='monospace response-body'>${formattedData}</pre>`;
	} else {
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

/**
 * Generated head tag content in HTML page.
 */
export function getHeadTagContent(): string {
	let htmlContent: string = '';
	try {
		const styleTagContent = getStyleTagContent();
		htmlContent += styleTagContent;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return htmlContent;
}

/**
 * Generated style tag content for HTML page
 */
function getStyleTagContent(): string {
	let htmlContent: string = '';

	try {
		const nonce = nonceutil.getNonce();
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;

		const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'responseStyle.css');
		console.log(stylePathOnDisk);

		const styleUri = AvaWebView.getOrCreateResponseViewPanel().webview.asWebviewUri(stylePathOnDisk);
		htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return htmlContent;
}

/**
 * Generates script tag content for response panel
 */
export function getScriptTagContent(): string {
	let scriptContent: string = '';

	try {
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;

		const scriptPathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'js', 'responseClient.js');
		console.log(scriptPathOnDisk);
		const nonce = nonceutil.getNonce();

		const scriptUri = AvaWebView.getOrCreateResponseViewPanel().webview.asWebviewUri(scriptPathOnDisk);

		scriptContent += `<script nonce='${nonce}' src='${scriptUri}'></script>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return scriptContent;
}
