import * as vscode from 'vscode';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { AvaWebView } from './basewebview';
import * as nonceutil from '../util/nonceutil';
import { writeFile } from 'fs';
import path = require('path');
const HTTPSnippet = require('httpsnippet');

import * as LANGUAGE_ITEMS from '../data/snippetLanguages.json';

let svcResult: AxiosResponse;

/**
 * Class that provides for language item template
 */
class LanguageQuickPickItem implements vscode.QuickPickItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    code: string;
    fileExtension: string;
    libraries: any[];

    constructor(code: string, label: string, fileExtension: string, description?: string, detail?: string, libraries?: any[]) {
        this.code = code;
        this.label = label;
        this.fileExtension = fileExtension;
        this.description = description;
        this.detail = detail;
        this.libraries = libraries || [];
    }
}

/**
 * Generates a collection of language quick pick items of type `LanguageQuickPickItem`
 */
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
            let qpItem: LanguageQuickPickItem = new LanguageQuickPickItem(lang.code, lang.label, lang.fileextension || `.txt`, lang.description, lang.detail, libraries);
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

/**
 * Generates code snippet for a given response
 * @param res Service response
 */
export async function genSnippet(res: AxiosResponse) {
    svcResult = res;
    try {
        const langItemSelected = await vscode.window.showQuickPick(getLanugageQuickPickItems(), {
            canPickMany: false,
            matchOnDescription: true,
            placeHolder: 'Choose a programming language for generating the snippet'
        });

        if (langItemSelected) {
            const lang: string = langItemSelected?.code || '';
            const fileExtension: string = langItemSelected.fileExtension;

            if (langItemSelected.libraries && langItemSelected.libraries.length > 0) {
                let libQuickPickItems: LanguageQuickPickItem[] = [];
                langItemSelected.libraries.forEach((lib: any) => {
                    let libQuickPickItem: LanguageQuickPickItem = new LanguageQuickPickItem(lib.code, lib.label, lib.fileExtension, lib.description, lib.detail, []);

                    libQuickPickItems.push(libQuickPickItem);
                });

                const libSelected = await vscode.window.showQuickPick(libQuickPickItems, {
                    canPickMany: false,
                    matchOnDescription: true,
                    placeHolder: 'Choose a client/library to use'
                });

                if (libSelected) {
                    constructSnippet(lang, fileExtension, libSelected.code || '');
                }
                libQuickPickItems = [];
            } else {
                constructSnippet(lang, fileExtension, '');
            }
        }
    } catch (err) {
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Generates a code snippet for provide language using provided library
 * @param lang Language to generate a snippet for
 * @param library HTTP client/library to use to generate a snippet
 */
async function constructSnippet(lang: string, fileExtension: string, library?: string): Promise<void> {
    try {
        const requestConfig: AxiosRequestConfig = svcResult.config;
        const headers: Array<any> = [];
        Object.keys(svcResult.config.headers).forEach((key) => {
            if (svcResult.config.headers[key].toString().indexOf('axios') < 0) {
                headers.push({
                    name: key,
                    value: svcResult.config.headers[key].toString().trim()
                });
            }
        });

        const har: any = {
            url: `${requestConfig.baseURL}${requestConfig.url}`.trim() || `https://yourdomain/api/`,
            method: requestConfig.method?.toUpperCase() || 'GET',
            headers: headers || [],
            postData: {
                text: svcResult.config.data !== '' ? svcResult.config.data : ''
            }
        };

        const snippet = new HTTPSnippet(har);
        let convertedSnippet: string = '';

        if (library) {
            convertedSnippet = snippet.convert(lang.toLowerCase(), library, {
                indent: '\t'
            });
        } else {
            convertedSnippet = snippet.convert(lang.toLowerCase(), {
                indent: '\t'
            });
        }

        if (!convertedSnippet) {
            return;
        }

        const htmlContent = convertedSnippet;

        try {
            /** Show generated code in a file */
            const filename: string = `untitled${fileExtension || '.txt'}`;
            const uri: vscode.Uri = vscode.Uri.file(path.join(__dirname, `../../temp/`, filename));

            if (uri) {
                const filePath = uri.fsPath;
                writeFile(filePath, htmlContent, async () => {
                    const textDocument = await vscode.workspace.openTextDocument(filePath);
                    await vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One);
                });
            }
        } catch (e) {
            // Show generated code as web view panel
            const panel: vscode.WebviewPanel = AvaWebView.createGenericViewPanel(lang);
            panel.webview.html = `<html>
								<head>
									${getStyleTagContent()}
                                </head>
                                <body>
                            		<textarea class='monospace' readonly>${htmlContent}</textarea>
                            	</body>
							</html>`;
        }
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
