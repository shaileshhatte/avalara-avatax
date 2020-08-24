// VSCode imports
import * as vscode from 'vscode';
import { AvaWebView } from './basewebview';
import * as nonceutil from '../util/nonceutil';
/**
 * Provides content for head tag inside HTML page.
 * @returns string
 */
export function getHeadContent(nonce: string): string {
	let htmlContent = '';
	try {
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;

		const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'requestStyle.css');
		console.log(stylePathOnDisk);
		const styleUri = AvaWebView.reqPanel?.webview.asWebviewUri(stylePathOnDisk);
		htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return `<head>${htmlContent}</head>`;
}

/**
 * Generates a client-side behavior script for a request webview panel.
 * Communicates with extension and also maintains state.
 * @returns string
 */
export function getScriptContent(nonce: string): string {
	let htmlContent = '';

	try {
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;

		const scriptPathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'js', 'requestClient.js');

		const scriptUri = AvaWebView.reqPanel?.webview.asWebviewUri(scriptPathOnDisk);

		htmlContent += `<script nonce='${nonce}' src='${scriptUri}'></script>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}

	return htmlContent;
}
