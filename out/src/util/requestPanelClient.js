"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleContent = exports.getScriptContent = exports.getHeadContent = void 0;
// VSCode imports
const vscode = require("vscode");
/**
 * Provides content for head tag inside HTML page.
 * @returns string
 */
function getHeadContent() {
    const styleTagContent = getStyleContent();
    return `<head> ${styleTagContent} </head>`;
}
exports.getHeadContent = getHeadContent;
/**
 * Generates a client-side behavior script for a request webview panel.
 * Communicates with extension and also maintains state.
 * @returns string
 */
function getScriptContent() {
    let htmlContent = '';
    try {
        htmlContent += `<script>
                            (function() {
                                const vscode = acquireVsCodeApi();

								// *************** Description show/hide behavior ************************ //

								let descShowLink = document.getElementById('description-show-link');
								if (descShowLink) {
									console.log('Inside 1');
									descShowLink.addEventListener('click', function(e) {
										console.log('Inside 2');
										let descriptionDiv = document.getElementById('description-div');
										if (descriptionDiv && descriptionDiv.style.display != 'none') {
											console.log('Inside 3');
											descriptionDiv.style.display = 'none';
											e.target.innerHTML = 'Show Description';
										} else {
											console.log('Inside 4');
											descriptionDiv.style.display = 'inherit';
											e.target.innerHTML = 'Hide';
										}
										
									});
								}

								// **************** Model label link click handler ************************ //
								
								let modelLink = document.getElementById('model-link');
								if (modelLink) {
									modelLink.addEventListener('click', function(e) {
										console.log(e.target.innerHTML || '');
										const modelName = e.target.innerHTML || '';
										vscode.postMessage({
											action: 'launchmodel',
											data: {
												model: modelName
											}
										});
									});
								}

								// **************** Model label link click handler ************************ //

                                const btnSend = document.getElementById('btn-send');
                                // Send button click handler
                                btnSend.addEventListener('click', (e) => {

									// Check all mandatory fields are filled in

									let requiredInputFields = document.getElementsByClassName('input-true');
									for (let i=0; i < requiredInputFields.length; i++) {
										let ipField = requiredInputFields[i];
										if (!ipField.value.toString().trim()) {
											vscode.postMessage({
												action: 'requiredfields'
											});

											return;
										}
									}

									// Gather all data
                                    let endpointMethod = '';
                                    let endpointUrl = '';
                                    const mainDiv = document.getElementById('main');
                                    if (!!mainDiv) {
                                        endpointMethod = mainDiv.getAttribute('data-method');
                                        endpointUrl = mainDiv.getAttribute('data-url');
                                    }

                                    const reqBodyElement = document.getElementById('request-body');
                                    let reqModel = '';
                                    let reqBody = '';
                                    if (!!reqBodyElement) {
                                        reqBody = reqBodyElement.value;
                                        reqModel = reqBodyElement.getAttribute('data-model');
                                    }

                                    // Collect path values
                                    let pathInputBoxes = document.getElementsByClassName('input-path');
                                    let pathValues = [];

                                    for (let i=0; i< pathInputBoxes.length; i++) {
                                        let inputBox = pathInputBoxes[i];
                                        let ho = {};
                                        let paramName = inputBox.getAttribute('data-paramname').trim();
                                        let paramValue = inputBox.value.trim() || '';
                                        ho[paramName] = paramValue;
                                        pathValues.push(ho);
                                    }

                                    // Collect header values
                                    let headerInputBoxes = document.getElementsByClassName('input-header');
                                    let headerValues = [];

                                    for (let i=0; i< headerInputBoxes.length; i++) {
                                        let inputBox = headerInputBoxes[i];
                                        let ho = {};
                                        let paramName = inputBox.getAttribute('data-paramname').trim();
                                        let paramValue = inputBox.value.trim() || '';
                                        ho[paramName] = paramValue;
                                        headerValues.push(ho);
                                    }

                                    // Collect query values
                                    let queryInputBoxes = document.getElementsByClassName('input-query');
                                    let queryValues = [];

                                    for (let j=0; j < queryInputBoxes.length; j++) {
                                        let inputBox = queryInputBoxes[j];
                                        let ho = {};
                                        let paramName = inputBox.getAttribute('data-paramname').trim();
                                        let paramValue = inputBox.value.trim() || '';
                                        ho[paramName] = paramValue;
                                        queryValues.push(ho);
                                    }


                                    vscode.postMessage({
                                        action: 'send',
                                        data: {
                                            reqbody: reqBody || 'NA',
                                            url: endpointUrl,
                                            method: endpointMethod,
                                            model: reqModel || '',
                                            parameters: {
                                                headervalues: headerValues,
                                                queryvalues: queryValues,
                                                pathvalues: pathValues
                                            }
                                        }
                                    });
                                });

    						}())
					</script>`;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return htmlContent;
}
exports.getScriptContent = getScriptContent;
/**
 * Generates a stylesheet for a request webview panel.
 * Changes color theme based on VSCode themes (Dark/Light).
 * @returns string
 */
function getStyleContent() {
    let htmlContent = '';
    // const colorTheme = vscode.window.activeColorTheme;
    // let textareaForegroundColor = colorTheme.kind === vscode.ColorThemeKind.Light ? '#000' : '#dddddd';
    // let headingRowBackgroundColor = colorTheme.kind === vscode.ColorThemeKind.Light ? '#dddddd' : '#242523';
    // let headingRowForegroundColor = colorTheme.kind === vscode.ColorThemeKind.Light ? '#black' : '#e8f4ff';
    // let textareaBorderColor = colorTheme.kind === vscode.ColorThemeKind.Light ? '';
    // vscode.window.onDidChangeActiveColorTheme((colorTheme: vscode.ColorTheme) => {
    // 	reqPanel.webview.html = generateRequestWebviewContent(endpoint);
    // 	resPanel.webview.html = 'Send the request to view the response.';
    // });
    htmlContent += `
			<style>

				table {
					border-collapse: collapse;
					width: 100%;
					font-size: 100%;
					margin-top: 10px;
				}

				td,
				th {
					border: 1px dotted var(--vscode-descriptionForeground);
					text-align: left;
					padding: 8px;
				}

				tr.heading {
					background-color: var(--vscode-input-background);
				}
				
				.td-center {
					text-align: center;
				}

				textarea {
					width: 98%;
					max-width: 800px;
					min-width: 400px;
					height: 700px;
					min-height: 400px;
					max-height: 700px;
					background-color: var(--vscode-input-background);
					color: var(--vscode-input-foreground);
					line-height: 18px;
					letter-spacing: 0.05rem;
					padding: 5px;
					border: var(--vscode-input-border);
					font-size: var(--vscode-font-size);
				}

				textarea:focus {
					outline-color: transparent;
				}

				input {
					width: 98%;
					height: 20px;
					padding: 0 2px 0 5px;
					background-color: var(--vscode-input-background);
					color: var(--vscode-input-foreground);
					border: var(--vscode-input-border);
				}

				input:: selection, textarea::selection {
					color: var(--vscode-selection-foreground);
					background: var(--vscode-selection-background);
				}

				.bold-text {
					font-weight: bold;
				}

				.input-rounded-border {
					border-radius: 1px;
				}

				.required-flag {
					color: #e9967a;
					font-style: italic;
					font-size: x-small;
				}

				.monospace {
					font-family: Input, menlo, lucida console, monospace;
				}

				.btn-send {
					width: 100px;
					height: 100%;
					float: right;
					margin: 10px 0 8px 0;
					background-color: var(--vscode-button-background);
					color: var(--vscode-button-foreground); 
					border-radius: 2px;
					padding: 5px 0 5px 0;
				}

				.btn-send:hover {
					background-color: var(--vscode-button-hoverBackground);
					cursor: pointer;
				}

				.endpoint-label {
					float: left;
					padding: 15px 0 0 0px;
					font-style: italic;
					color: gray;
				}

				.endpoint-label {
					color: var(--vscode-descriptionForeground);
				}

				.request-body {
					padding: 5px;
				}

				.model-label {
					float: right;
				}

				a {
					color: var(--vscode-descriptionForeground);
					letter-spacing: 0.05rem;
				}
			
				a:hover, a:active {
					color: var(--vscode-input-foreground);
				}

				.endpoint-description {
					color: var(--vscode-descriptionForeground);
					letter-spacing: 0.02rem;
					line-height: 20px;
				}

				.description-section {
					margin-top: 30px
				}

				.description-div {
					display: none;
				}
			</style>
		`;
    return htmlContent;
}
exports.getStyleContent = getStyleContent;
//# sourceMappingURL=requestPanelClient.js.map