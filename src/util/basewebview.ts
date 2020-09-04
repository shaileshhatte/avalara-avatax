import * as vscode from 'vscode';
import { makeRequest } from '../controllers/RequestController';
import { copyResponseBody, saveResponseBody, generateSnippet } from '../helpers/responseHelper';
import { showRequiredFieldsError, launchModel } from '../util/requestPanelClient';
import { AVConstants } from './avconstants';
/** Local constants */
const viewType: string = AVConstants.endpointLaunchViewType;
const responsePanelTitle: string = AVConstants.responsePanelTitle;

/**
 * Class that caters to webviewpanel objects for request and response.
 * It also provides for disposing behavior and receives communications from webviewpanel HTML.
 */
export class AvaWebView {
	static reqPanel?: vscode.WebviewPanel;
	static resPanel?: vscode.WebviewPanel;
	static modelPanel?: vscode.WebviewPanel;
	static extensionContext: vscode.ExtensionContext;

	/**
	 * Returns a request webviewpanel instance. Creates one if one doesn't exist.
	 * @param title Title which is shown on the request's webviewpanel
	 * @returns `vscode.WebviewPanel` Request webviewpanel object
	 */
	public static getOrCreateRequestViewPanel = (title: string): vscode.WebviewPanel | undefined => {
		try {
			let panel: vscode.WebviewPanel | undefined = AvaWebView.reqPanel;
			if (!panel) {
				panel = createWebView(title);
			} else {
				const panelTitle: string = panel.title;
				const columnToShowIn = vscode.ViewColumn.One;
				if (
					panelTitle.split(' ')[0].toLowerCase() === title.split(' ')[0].toLowerCase() &&
					panelTitle.split(' ')[1].toLowerCase() === title.split(' ')[1].toLowerCase()
				) {
					if (!panel.visible) {
						panel.reveal(columnToShowIn); // vscode.ViewColumn.One
					}
				} else {
					panel.title = title;
					panel.reveal(columnToShowIn);
				}
			}
			// Check if the response panel exists. Create if doesn't exist.
			if (!AvaWebView.resPanel) {
				AvaWebView.resPanel = createWebView(responsePanelTitle);
				AvaWebView.resPanel.reveal(vscode.ViewColumn.Eight);
			}
			panel.reveal(vscode.ViewColumn.One);
			return panel;
		} catch (err) {
			console.error(err);
			vscode.window.showErrorMessage(err);
		}
	};

	/**
	 * Returns a response webviewpanel instance. Creates one if one doesn't exist.
	 * @returns {vscode.WebviewPanel} Response webviewpanel object
	 */
	public static getOrCreateResponseViewPanel(): vscode.WebviewPanel {
		let panel: vscode.WebviewPanel | undefined = AvaWebView.resPanel;
		if (panel) {
			panel.reveal(vscode.ViewColumn.Eight);
		} else {
			panel = createWebView(responsePanelTitle);
		}
		return panel;
	}

	/**
	 * Returns a model webviewpanel instance.
	 * @returns {vscode.WebviewPanel} Model webviewpanel object
	 */
	public static createModelViewPanel(title: string): vscode.WebviewPanel {
		let panel: vscode.WebviewPanel | undefined = AvaWebView.modelPanel;

		const columnToShowIn = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
			: vscode.ViewColumn.One;

		panel = vscode.window.createWebviewPanel(
			viewType,
			title,
			{
				viewColumn: columnToShowIn,
				preserveFocus: true
			},
			{
				enableCommandUris: true,
				enableScripts: true,
				enableFindWidget: true
			}
		);

		return panel;
	}

	/**
	 * Returns a Generic webviewpanel instance.
	 * @returns {vscode.WebviewPanel} Generic webviewpanel object
	 */
	public static createGenericViewPanel(title: string): vscode.WebviewPanel {
		let panel: vscode.WebviewPanel | undefined;
		const columnToShowIn = vscode.ViewColumn.One;
		panel = vscode.window.createWebviewPanel(
			viewType,
			title,
			{
				viewColumn: columnToShowIn,
				preserveFocus: true
			},
			{
				enableCommandUris: true,
				enableScripts: true,
				enableFindWidget: true
			}
		);
		return panel;
	}
}

/**
 * Creates a webviewpanel with provided title.
 * Also attaches onDidDispose and onDidReceiveMessage events.A
 * @param title Title shown on the webviewpanel window
 */
const createWebView = (title: string): vscode.WebviewPanel => {
	const columnToShowIn = vscode.window.activeTextEditor
		? vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
		: vscode.ViewColumn.One;
	const webViewPanel = vscode.window.createWebviewPanel(
		viewType,
		title,
		{
			viewColumn: title === responsePanelTitle ? vscode.ViewColumn.Eight : columnToShowIn,
			preserveFocus: true
		},
		{
			enableCommandUris: true,
			enableScripts: true,
			enableFindWidget: title === responsePanelTitle,
			retainContextWhenHidden: title !== responsePanelTitle
		}
	);
	// When the webviewpanels are disposed, mark corresponding objects undefined.
	webViewPanel.onDidDispose(() => {
		switch (title) {
			case responsePanelTitle:
				AvaWebView.resPanel = undefined;
				break;

			default:
				AvaWebView.reqPanel = undefined;
				break;
		}
	});

	webViewPanel.webview.onDidReceiveMessage((message) => {
		const action = message.action || '';
		if (!!action) {
			switch (action) {
				case 'send':
					makeRequest(message.data);
					break;
				case 'launchmodel':
					launchModel(true, message.data, true);
					break;
				case 'generatecodesnippet':
					generateSnippet();
					break;
				case 'copy':
					copyResponseBody();
					break;
				case 'save':
					saveResponseBody();
					break;
				case 'requiredfields':
					showRequiredFieldsError();
					break;
				default:
					break;
			}
		}
	});

	if (title === responsePanelTitle) {
		AvaWebView.resPanel = webViewPanel;
	} else {
		AvaWebView.reqPanel = webViewPanel;
	}

	return webViewPanel;
};
