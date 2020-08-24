"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvaWebView = void 0;
const vscode = require("vscode");
const RequestController_1 = require("../controllers/RequestController");
const responseHelper_1 = require("../helpers/responseHelper");
const requestHelper_1 = require("../helpers/requestHelper");
const viewType = 'endpoint.launch';
/**
 * Class that caters to webviewpanel objects for request and response.
 * It also provides for disposing behavior and receives communications from webviewpanel HTML.
 */
class AvaWebView {
    /**
     * Returns a response webviewpanel instance. Creates one if one doesn't exist.
     * @returns {vscode.WebviewPanel} Response webviewpanel object
     */
    static getOrCreateResponseViewPanel() {
        let panel = AvaWebView.resPanel;
        if (panel) {
            // AvaWebView.resPanel?.dispose();
            // panel = createWebView('Response');
            panel.reveal(vscode.ViewColumn.Eight);
            //return panel;
        }
        else {
            panel = createWebView('Response');
        }
        return panel;
    }
    /**
     * Returns a model webviewpanel instance.
     * @returns {vscode.WebviewPanel} Model webviewpanel object
     */
    static createModelViewPanel(title) {
        let panel = AvaWebView.modelPanel;
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
            : vscode.ViewColumn.One;
        panel = vscode.window.createWebviewPanel(viewType, title, {
            viewColumn: columnToShowIn,
            preserveFocus: true
        }, {
            enableCommandUris: true,
            enableScripts: true,
            enableFindWidget: true
        });
        return panel;
    }
    /**
     * Returns a Generic webviewpanel instance.
     * @returns {vscode.WebviewPanel} Generic webviewpanel object
     */
    static createGenericViewPanel(title) {
        let panel;
        const columnToShowIn = vscode.ViewColumn.One;
        panel = vscode.window.createWebviewPanel(viewType, title, {
            viewColumn: columnToShowIn,
            preserveFocus: true
        }, {
            enableCommandUris: true,
            enableScripts: true,
            enableFindWidget: true
        });
        return panel;
    }
}
exports.AvaWebView = AvaWebView;
/**
 * Returns a request webviewpanel instance. Creates one if one doesn't exist.
 * @param title Title which is shown on the request's webviewpanel
 * @returns {vscode.WebviewPanel} Request webviewpanel object
 */
AvaWebView.getOrCreateRequestViewPanel = (title) => {
    try {
        let panel = AvaWebView.reqPanel;
        if (!panel) {
            panel = createWebView(title);
        }
        else {
            const panelTitle = panel.title;
            const columnToShowIn = vscode.ViewColumn.One;
            if (panelTitle.split(' ')[0].toLowerCase() === title.split(' ')[0].toLowerCase() &&
                panelTitle.split(' ')[1].toLowerCase() === title.split(' ')[1].toLowerCase()) {
                if (!panel.visible) {
                    panel.reveal(columnToShowIn); // vscode.ViewColumn.One
                    //panel.webview.html = panel.webview.html;
                }
            }
            else {
                panel.title = title;
                panel.reveal(columnToShowIn);
            }
        }
        // Check if the response panel exists. Create if doesn't exist.
        if (!AvaWebView.resPanel) {
            AvaWebView.resPanel = createWebView(`Response`);
            AvaWebView.resPanel.reveal(vscode.ViewColumn.Eight);
        }
        panel.reveal(vscode.ViewColumn.One);
        return panel;
    }
    catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
};
/**
 * Creates a webviewpanel with provided title.
 * Also attaches onDidDispose and onDidReceiveMessage events.A
 * @param title Title shown on the webviewpanel window
 */
const createWebView = (title) => {
    const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn || vscode.ViewColumn.One
        : vscode.ViewColumn.One;
    const webViewPanel = vscode.window.createWebviewPanel(viewType, title, {
        viewColumn: title === 'Response' ? vscode.ViewColumn.Eight : columnToShowIn,
        preserveFocus: true
    }, {
        enableCommandUris: true,
        enableScripts: true,
        enableFindWidget: title === 'Response',
        retainContextWhenHidden: title !== 'Response'
    });
    // When the webviewpanels are disposed, mark corresponding objects undefined.
    webViewPanel.onDidDispose(() => {
        switch (title) {
            case 'Response':
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
                    RequestController_1.makeRequest(message.data);
                    break;
                case 'launchmodel':
                    requestHelper_1.launchModel(true, message.data, true);
                    break;
                case 'generatecodesnippet':
                    responseHelper_1.generateSnippet();
                    break;
                case 'copy':
                    responseHelper_1.copyResponseBody();
                    break;
                case 'save':
                    responseHelper_1.saveResponseBody();
                    break;
                case 'requiredfields':
                    requestHelper_1.showRequiredFieldsError();
                    break;
                default:
                    break;
            }
        }
        // vscode.window.showInformationMessage(message.text);
    });
    if (title === 'Response') {
        AvaWebView.resPanel = webViewPanel;
    }
    else {
        AvaWebView.reqPanel = webViewPanel;
    }
    return webViewPanel;
};
//# sourceMappingURL=basewebview.js.map