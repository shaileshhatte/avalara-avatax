import * as vscode from 'vscode';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { AvaWebView } from './basewebview';
import * as nonceutil from '../util/nonceutil';

const HTTPSnippet = require('httpsnippet');

import * as LANGUAGE_ITEMS from '../data/snippetLanguages.json';

let svcResult: AxiosResponse;

class LanguageQuickPickItem implements vscode.QuickPickItem {
	label: string;
	description?: string | undefined;
	detail?: string | undefined;
	code: string;
	libraries: any[];

	constructor(code: string, label: string, description?: string, detail?: string, libraries?: any[]) {
		this.code = code;
		this.label = label;
		this.description = description;
		this.detail = detail;
		this.libraries = libraries || [];
	}
}

function getLanugageQuickPickItems(): LanguageQuickPickItem[] {
	const quickPickItems: LanguageQuickPickItem[] = [];
	try {
		LANGUAGE_ITEMS.forEach((lang) => {
			let libraries: any[] = [];
			if (lang.libraries) {
				lang.libraries.forEach((lib: any) => {
					libraries.push(lib);
				});
			}
			let qpItem: LanguageQuickPickItem = new LanguageQuickPickItem(lang.code, lang.label, lang.description, lang.detail, libraries);
			if (qpItem) {
				quickPickItems.push(qpItem);
			}
		});
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
	return quickPickItems;
}

export function genSnippet(res: AxiosResponse) {
	console.log('entered');
	svcResult = res;

	try {
		vscode.window
			.showQuickPick(getLanugageQuickPickItems(), {
				canPickMany: false,
				matchOnDescription: true,
				placeHolder: 'Choose a programming language for generating a code snippet'
			})
			.then(
				(langItem) => {
					const lang: string = langItem?.code || '';

					console.log(langItem?.libraries);

					if (langItem?.libraries && langItem.libraries.length > 0) {
						console.log(`if --> ${lang}`);
						let libQuickPickItems: LanguageQuickPickItem[] = [];
						langItem?.libraries.forEach((lib: any) => {
							let libQuickPickItem: LanguageQuickPickItem = new LanguageQuickPickItem(
								lib.code,
								lib.label,
								lib.description,
								lib.detail,
								[]
							);

							libQuickPickItems.push(libQuickPickItem);
						});

						vscode.window
							.showQuickPick(libQuickPickItems, {
								canPickMany: false,
								matchOnDescription: true,
								placeHolder: 'Choose a client/library to use'
							})
							.then(
								(lib) => {
									constructSnippet(lang, lib?.code || '');
								},
								(err) => {
									vscode.window.showErrorMessage(err);
								}
							);
					} else {
						constructSnippet(lang, '');
					}
				},
				(err) => {
					console.error(err);
					vscode.window.showErrorMessage(err);
				}
			);
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}
}

function constructSnippet(lang: string, library?: string): void {
	try {
		const requestConfig: AxiosRequestConfig = svcResult.config;
		let headers: Array<any> = [];
		Object.keys(svcResult.config.headers).forEach((key) => {
			if (svcResult.config.headers[key].toString().indexOf('axios') < 0) {
				headers.push({
					name: key,
					value: svcResult.config.headers[key].toString().trim()
				});
			}
		});

		let har: any = {
			url: `${requestConfig.baseURL}${requestConfig.url}`.trim() || `https://yourdomain/api/`,
			method: requestConfig.method?.toUpperCase() || 'GET',
			headers: headers || [],
			postData: {
				text: svcResult.config.data !== '' ? svcResult.config.data : ''
			}
		};

		let snippet = new HTTPSnippet(har);

		let convertedSnippet: string = '';

		if (library) {
			console.log('if 1');
			convertedSnippet = snippet.convert(lang.toLowerCase(), library, {
				indent: '\t'
			});
		} else {
			console.log('if 2');
			convertedSnippet = snippet.convert(lang.toLowerCase(), {
				indent: '\t'
			});
		}

		if (!convertedSnippet) {
			return;
		}

		let htmlContent = convertedSnippet;

		let panel: vscode.WebviewPanel = AvaWebView.createGenericViewPanel(lang);
		panel.webview.html = `<html>
								<head>
									${getStyleTagContent()}
                                </head>
                                <body>
                            		<textarea class='monospace' readonly>${htmlContent}</textarea>
                            	</body>
                            </html>`;

		// vscode.workspace.openTextDocument({
		// 	content: convertedSnippet
		// });
	} catch (err) {
		vscode.window.showErrorMessage(err);
	}
}

/**
 * Generated style tag content for HTML page
 */
function getStyleTagContent(): string {
	let htmlContent: string = '';
	try {
		const nonce = nonceutil.getNonce();
		const avacontext: vscode.ExtensionContext = AvaWebView.extensionContext;
		const stylePathOnDisk = vscode.Uri.joinPath(avacontext.extensionUri, 'static', 'css', 'snippetStyle.css');
		const styleUri = AvaWebView.getOrCreateResponseViewPanel().webview.asWebviewUri(stylePathOnDisk);
		htmlContent += `<link nonce='${nonce}' rel='stylesheet' href='${styleUri}'>`;
	} catch (err) {
		console.error(err);
		vscode.window.showErrorMessage(err);
	}
	return htmlContent;
}
