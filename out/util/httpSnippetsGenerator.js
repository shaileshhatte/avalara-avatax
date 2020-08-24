"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genSnippet = void 0;
const vscode = require("vscode");
const basewebview_1 = require("./basewebview");
const HTTPSnippet = require('httpsnippet');
const LANGUAGE_ITEMS = [
    {
        code: 'shell',
        label: 'Shell',
        description: 'cURL / HTTPie / Wget',
        detail: 'Generates an HTTP request for command-line interpreter',
        libraries: [
            {
                code: 'curl',
                label: 'cURL',
                description: '(Client URL)',
                detail: 'A command line tool and library for transferring data with URL syntax'
            },
            {
                code: 'httpie',
                label: 'HTTPie',
                description: '(A cURL-like tool)',
                detail: 'A user-friendly command-line HTTP client'
            },
            {
                code: 'wget',
                label: 'Wget',
                description: '(GNU Wget)',
                detail: 'A software package for retrieving files using HTTP, HTTPS'
            }
        ]
    },
    {
        code: 'javascript',
        label: 'JavaScript',
        description: 'XMLHttpRequest / jQuery.AJAX',
        detail: 'Generates an HTTP request for browser-based JavaScript',
        libraries: [
            {
                code: 'xhr',
                label: 'XMLHttpRequest',
                description: '(XHR)',
                detail: 'W3C Standard API that provides scripted client functionality'
            },
            {
                code: 'jquery',
                label: 'jQuery.AJAX',
                description: '(Asynchronous JavaScript and XML)',
                detail: 'Performs an asynchronous HTTP (AJAX) requests with jQuery'
            },
            {
                code: 'fetch',
                label: 'Fetch',
                description: '(Flexible API interface)',
                detail: 'Promise-based, with support for CORS and HTTP Origin header semantics'
            },
            {
                code: 'axios',
                label: 'Axios',
                description: '(Axios NPM module)',
                detail: 'Promise based HTTP client for the browser and NodeJS'
            }
        ]
    },
    {
        code: 'node',
        label: 'NodeJS',
        description: 'Native / Request / Unirest',
        detail: 'JavaScript that runs outside of the web browser.',
        libraries: [
            {
                code: 'native',
                label: 'Native',
                description: '(NodeJS native)',
                detail: 'NodeJS native HTTP interface'
            },
            {
                code: 'unirest',
                label: 'Unirest',
                description: '(Unirest NPM module)',
                detail: 'Lightweight HTTP Request Client Library'
            },
            {
                code: 'axios',
                label: 'Axios',
                description: '(Axios NPM module)',
                detail: 'Promise based HTTP client for the browser and NodeJS'
            }
        ]
    },
    {
        code: 'java',
        label: 'Java',
        description: 'Unirest / OkHttp',
        detail: 'A class-based, object-oriented langauge that runs inside JVM',
        libraries: [
            {
                code: 'unirest',
                label: 'Unirest',
                description: '(Unirest for Java)',
                detail: 'A Lightweight HTTP Request Client Library'
            },
            {
                code: 'okhttp',
                label: 'OkHttp',
                description: '(OkHttp for Java)',
                detail: 'An efficient HTTP Request Client Library'
            },
            {
                code: 'asynchttp',
                label: 'AsyncHTTP',
                description: '(AsyncHttpClient)',
                detail: 'A library built on top of Netty'
            },
            {
                code: 'nethttp',
                label: 'NetHTTP',
                description: '(java.net.http)',
                detail: 'Provides high-level client interfaces to HTTP and low-level client interfaces to WebSocket'
            }
        ]
    },
    {
        code: 'csharp',
        label: 'C#',
        description: 'RestSharp',
        detail: 'A strongly-typed, component-oriented language (.NET)',
        libraries: [
            {
                code: 'httpclient',
                label: 'HttpClient',
                description: '(System.Net.Http)',
                detail: 'Provides a base class for sending HTTP requests and receiving HTTP responses'
            },
            {
                code: 'restsharp',
                label: 'RestSharp',
                description: '(RestSharp NuGet Package)',
                detail: 'Simple .NET client for HTTP REST APIs.'
            }
        ]
    },
    {
        code: 'php',
        label: 'PHP',
        description: `ext-curl; pecl/http v1; pecl/http v2`,
        detail: 'A hypertext preprocessor scripting langauge',
        libraries: [
            {
                code: 'curl',
                label: 'cURL',
                description: '(ext-curl)',
                detail: 'A library that lets you make HTTP requests in PHP'
            },
            {
                code: 'http1',
                label: 'pecl/http v1',
                description: '(PHP with pecl/http v1)',
                detail: 'HTTP extension handling HTTP requests supporting API version 1'
            },
            {
                code: 'http2',
                label: 'pecl/http v2',
                description: '(PHP with pecl/http v1)',
                detail: 'HTTP extension handling HTTP requests with support for API version 2'
            }
        ]
    },
    {
        code: 'python',
        label: 'Python',
        description: 'Python 3 / Requests',
        detail: 'An interpreted, high-level, general-purpose programming language',
        libraries: [
            {
                code: 'python3',
                label: 'Python 3',
                description: '(http.client)',
                detail: 'Python3 HTTP Client'
            },
            {
                code: 'requests',
                label: 'Requests',
                description: '(Requests module)',
                detail: 'An elegant and simple HTTP library for Python'
            }
        ]
    },
    {
        code: 'ruby',
        label: 'Ruby',
        description: 'Native',
        detail: 'A dynamically typed, multi-paradigm programming language'
    },
    {
        code: 'swift',
        label: 'Swift',
        description: 'NSURLSession',
        detail: `Multi-paradigm, compiled language developed for Apple (c) devices`
    },
    {
        code: 'c',
        label: 'C',
        description: 'LibCurl',
        detail: 'A programming language, constructs of which map to machine instructions'
    },
    {
        code: 'go',
        label: 'Go',
        description: 'Native HTTP client',
        detail: 'A statically typed language with memory-safety and CSP-style concurrency'
    },
    {
        code: 'r',
        label: 'R',
        description: 'HTTR - R HTTP client',
        detail: 'A programming language for statistical computing and graphics'
    }
];
const SHELL_LANG = 'shell';
const JAVASCRIPT_LANG = 'javaScript';
const NODEJS_LANG = 'node';
const JAVA_LANG = 'java';
const CSHARP_LANG = 'csharp';
const PHP_LANG = 'php';
const PYTHON_LANG = 'python';
const RUBY_LANG = 'ruby';
const SWIFT_LANG = 'swift';
const C_LANG = 'c';
const GO_LANG = 'go';
let svcResult;
class LanguageQuickPickItem {
    constructor(code, label, description, detail, libraries) {
        this.code = code;
        this.label = label;
        this.description = description;
        this.detail = detail;
        this.libraries = libraries || [];
    }
}
function getLanugageQuickPickItems() {
    const quickPickItems = [];
    try {
        LANGUAGE_ITEMS.forEach((lang) => {
            let libraries = [];
            if (lang.libraries) {
                lang.libraries.forEach((lib) => {
                    libraries.push(lib);
                });
            }
            let qpItem = new LanguageQuickPickItem(lang.code, lang.label, lang.description, lang.detail, libraries);
            if (qpItem) {
                quickPickItems.push(qpItem);
            }
        });
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return quickPickItems;
}
function genSnippet(res) {
    console.log('entered');
    svcResult = res;
    try {
        vscode.window
            .showQuickPick(getLanugageQuickPickItems(), {
            canPickMany: false,
            matchOnDescription: true,
            placeHolder: 'Choose a programming language for generating a code snippet'
        })
            .then((langItem) => {
            const lang = (langItem === null || langItem === void 0 ? void 0 : langItem.code) || '';
            console.log(langItem === null || langItem === void 0 ? void 0 : langItem.libraries);
            if ((langItem === null || langItem === void 0 ? void 0 : langItem.libraries) && langItem.libraries.length > 0) {
                console.log(`if --> ${lang}`);
                let libQuickPickItems = [];
                langItem === null || langItem === void 0 ? void 0 : langItem.libraries.forEach((lib) => {
                    let libQuickPickItem = new LanguageQuickPickItem(lib.code, lib.label, lib.description, lib.detail, []);
                    libQuickPickItems.push(libQuickPickItem);
                });
                vscode.window
                    .showQuickPick(libQuickPickItems, {
                    canPickMany: false,
                    matchOnDescription: true,
                    placeHolder: 'Choose a client/library to use'
                })
                    .then((lib) => {
                    constructSnippet(lang, (lib === null || lib === void 0 ? void 0 : lib.code) || '');
                }, (err) => {
                    vscode.window.showErrorMessage(err);
                });
            }
            else {
                constructSnippet(lang, '');
            }
        }, (err) => {
            console.error(err);
            vscode.window.showErrorMessage(err);
        });
    }
    catch (err) {
        vscode.window.showErrorMessage(err);
    }
}
exports.genSnippet = genSnippet;
function constructSnippet(lang, library) {
    var _a;
    console.log(library);
    try {
        const requestConfig = svcResult.config;
        let headers = [];
        Object.keys(svcResult.config.headers).forEach((key) => {
            if (svcResult.config.headers[key].toString().indexOf('axios') < 0) {
                headers.push({
                    name: key,
                    value: svcResult.config.headers[key].toString().trim()
                });
            }
        });
        console.log(svcResult);
        console.log(`Hello ${svcResult.config.data}`);
        let har = {
            url: `${requestConfig.baseURL}${requestConfig.url}`.trim() || `https://yourdomain/api/`,
            method: ((_a = requestConfig.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || 'GET',
            headers: headers || [],
            postData: {
                text: svcResult.config.data !== '' ? svcResult.config.data : ''
            }
        };
        console.log(har);
        let snippet = new HTTPSnippet(har);
        let convertedSnippet = '';
        if (library) {
            console.log('if 1');
            convertedSnippet = snippet.convert(lang.toLowerCase(), library, {
                indent: '\t'
            });
        }
        else {
            console.log('if 2');
            convertedSnippet = snippet.convert(lang.toLowerCase(), {
                indent: '\t'
            });
        }
        // let snippetContent = snippet.convert(lang.toLowerCase(), library, {
        // 	indent: '\t'
        // });
        console.log(convertedSnippet);
        if (!convertedSnippet) {
            return;
        }
        // let htmlContent: string = `<pre id="model-body" class="monospace model-body">
        // 								${convertedSnippet}
        // 							</pre>`;
        let htmlContent = convertedSnippet;
        let panel = basewebview_1.AvaWebView.createGenericViewPanel(lang);
        panel.webview.html = `<html>
								<head>
									<style> 
										.monospace {
											font-family: input, menlo, lucida console, monospace;
										}

										textarea {
												width: 100%;
												max-width: 1000px;
												min-width: 400px;
												height: 1000px;
												min-height: 400px;
												max-height: 1000px;
												font-size: var(--vscode-font-size);
												background-color: transparent;
												color: var(--vscode-editor-foreground);
												line-height: 18px;
												letter-spacing: 0.05rem;
												padding: 5px;
												border: var(--vscode-input-border);
										}
                                	</style>
                                </head>
                                <body>
                            		<textarea class='monospace' readonly>${htmlContent}</textarea>
                            	</body>
                            </html>`;
        // vscode.workspace.openTextDocument({
        // 	content: convertedSnippet
        // });
    }
    catch (err) {
        vscode.window.showErrorMessage(err);
    }
}
//# sourceMappingURL=httpSnippetsGenerator.js.map