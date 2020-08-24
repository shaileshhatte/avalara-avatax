import * as vscode from 'vscode';

// export class RequestEditorProvider implements vscode.CustomTextEditorProvider {
// 	public static register(context: vscode.ExtensionContext): vscode.Disposable {
// 		const provider = new RequestEditorProvider(context);
// 		const providerRegistration = vscode.window.registerCustomEditorProvider(RequestEditorProvider.viewType, provider);
// 		return providerRegistration;
// 	}

// 	private static viewType = 'endpoint.request';

// 	constructor(private readonly context: vscode.ExtensionContext) {}

// 	// Called when the custom editor is opened
// 	public async resolveCustomTextEditor(
// 		document: vscode.TextDocument,
// 		webviewPanel: vscode.WebviewPanel,
// 		token: vscode.CancellationToken
// 	): Promise<void> {
// 		console.log('Ava Custom editor is opened! Language ID: ' + document.languageId);
// 		/*
// 		webviewPanel.title = 'Request';
// 		webviewPanel.webview.options = {
// 			enableScripts: true,
// 		};

//         webviewPanel.webview.html = '<html><body><button>Send</button></br></br>' + document.getText() + '</body></html>';

//         */

// 		// let filePath = path.join('.', 'requests', 'test', '.atrequest');

// 		// vscode.window.showTextDocument(vscode.Uri.file(filePath));
// 	}
// }
