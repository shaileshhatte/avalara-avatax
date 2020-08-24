"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScriptTagContent = exports.getHeadTagContent = exports.responseBodyAsHtml = void 0;
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
    const styleTagContent = getStyleTagContent();
    htmlContent += styleTagContent;
    return htmlContent;
}
exports.getHeadTagContent = getHeadTagContent;
/**
 * Generated style tag content for HTML page
 */
function getStyleTagContent() {
    let htmlContent = '';
    htmlContent += `<style>
						.monospace {
							font-family: input, menlo, lucida console, monospace;
						}

						.header-label {
							color: #f16f6f;
						}

						.header-div {
							line-height: 80%;
							margin-top: 40px;
						}

						.base-url {
							color: #5baeff
						}

						textarea {
							width: 98%;
							max-width: 800px;
							min-width: 400px;
							height: 700px;
							min-height: 400px;
							max-height: 700px;
							font-size: var(--vscode-font-size);
							background-color: transparent;
							color: var(--vscode-editor-foreground);
							line-height: 18px;
							letter-spacing: 0.05rem;
							padding: 5px;
							border: var(--vscode-input-border);
						}

						textarea:focus {
							outline-color: transparent;
						}

						.btn-copy, .btn-save {
							width: 60px;
							height: 100%;
							margin: 10px 0 8px 0;
							background-color: var(--vscode-button-background);
							color: var(--vscode-button-foreground); 
							border-radius: 2px;
							padding: 5px 0 5px 0;
							border-color: var(--vscode-button-background);
						}

                        .btn-copy:hover,
                        .btn-save:hover {
							background-color: var(--vscode-button-hoverBackground);
							cursor: pointer;
                        }
                        
                        .action-buttons-div {
                            float: right;
                        }

						
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
                        
                        .res-body {
                            margin-top: 30px;
                        }

						.resppnse-body {
							line-height: 150%;
						}

						.request-url-label {
							color: #daa520;
						}

						.response-html {
							margin-top: 10px;
						}

						.btn-generate-code-snippet {
							float: right;
							width: 150px;
							height: 100%;
							margin: 2px 0 8px 0;
							background-color: var(--vscode-editor-background);
							color: var(--vscode-editor-foreground); 
							border-radius: 2px;
							padding: 5px 0 5px 0;
							border-color: var(--vscode-button-background);
						}

						.btn-generate-code-snippet:hover {
							background-color: var(--vscode-button-hoverBackground);
							cursor: pointer;
						}
						
						.request-url-table {
							width: 100%;
						}
					</style>`;
    return htmlContent;
}
/**
 * Generates script tag content for response panel
 */
function getScriptTagContent() {
    let scriptContent = '';
    scriptContent += `<script>
						(function() {
							const vscode = acquireVsCodeApi();

							const btnCopy = document.getElementById('btn-copy');
							if (btnCopy) {
								btnCopy.addEventListener('click', (e) => {
                                    console.log('Hello');
									vscode.postMessage({
                                        action: 'copy',
                                        data: {}
									});

								});
							}


							const btnSave = document.getElementById('btn-save');
							if (btnSave) {
								btnSave.addEventListener('click', (e) => {

									vscode.postMessage({
                                        action: 'save',
                                        data: {}
									});

								});
							}

							const btnGenerateSnippet = document.getElementById('btn-generate-code-snippet');
							if (btnGenerateSnippet) {
								btnGenerateSnippet.addEventListener('click', function(e) {
									vscode.postMessage({
                                        action: 'generatecodesnippet',
                                        data: {}
									});
								})
							}



						}())

					</script>`;
    return scriptContent;
}
exports.getScriptTagContent = getScriptTagContent;
//# sourceMappingURL=responsePanelClient.js.map