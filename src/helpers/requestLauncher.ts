// VSCode imports
import * as vscode from 'vscode';
import { AvaWebView } from '../util/basewebview';
import { EndpointMethod } from '../models/EndpointMethod';
import * as requestGenerator from './requestGenerator';
import * as requestWebviewClient from '../util/requestPanelClient';
import * as nonceutil from '../util/nonceutil';
import { generateApiCategoryQuickPickItems, generateApiEndpointQuickPickItems, getTaxCalculationEndpoint, getAddressValidationEndpoint, getTestConnectionEndpoint } from '../providers/endpointsProvider';

/** Local Constants */
const SOMETHING_WENT_WRONG: string = `Something went wrong. Please try again.`;
const CHOOSE_ENDPOINT: string = `Choose an API endpoint to launch`;

/**
 * Launches a request webviewpanel for an endpoint
 * provided by extension context arguments.
 * Also launches a empty response webviewpanel on next viewcolumn.
 * @returns void
 */
export function launchEndpoint(): void {
    let endpoint: EndpointMethod | undefined;
    try {
        if (arguments[0]) {
            endpoint = arguments[0];
            if (!endpoint) {
                vscode.window.showErrorMessage(SOMETHING_WENT_WRONG);
                return;
            }
            launchEndpointView(endpoint);
        } else {
            launchEndpointViaCommand();
        }
    } catch (err) {
        console.error(err);
        vscode.window.showInformationMessage(err);
    }
}

/**
 * Lancuhes a tax calculation endpoint
 */
export function launchTaxCalculationEndpoint() {
    let taxCalculationEndpoint: EndpointMethod | undefined;
    try {
        taxCalculationEndpoint = getTaxCalculationEndpoint();
        if (taxCalculationEndpoint) {
            launchEndpointView(taxCalculationEndpoint);
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Launches an address validation endpoint
 */
export function launchAddressCalculationEndpoint() {
    let addressValidationEndpoint: EndpointMethod | undefined;
    try {
        addressValidationEndpoint = getAddressValidationEndpoint();
        if (addressValidationEndpoint) {
            launchEndpointView(addressValidationEndpoint);
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Launches a test connection endpoint
 */
export function launchTestConnectionEndpoint() {
    let testConnectionEndpoint: EndpointMethod | undefined;
    try {
        testConnectionEndpoint = getTestConnectionEndpoint();
        if (testConnectionEndpoint) {
            launchEndpointView(testConnectionEndpoint);
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Launches a request viewpanel for the provided endpoint method.
 * @param endpoint EndpointMethod to launch view for
 */
function launchEndpointView(endpoint: EndpointMethod) {
    try {
        if (endpoint) {
            const requestPanelTitle: string = `${endpoint.method.toUpperCase()} ${endpoint.operationId}`;
            const panel: vscode.WebviewPanel | undefined = AvaWebView.getOrCreateRequestViewPanel(requestPanelTitle);
            if (panel) {
                panel.webview.html = generateRequestWebviewContent(endpoint);
            }
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}

/**
 * Generates HTML page for request web view panel.
 * Inserts head, style, script content into it.
 * @param endpoint - Endpoint (of type EndpointMethod) for launching its request webview panel.
 * @returns HTML content for rendering on request webview panel
 */
function generateRequestWebviewContent(endpoint: EndpointMethod): string {
    const nonce = nonceutil.getNonce();

    const bodyContent = requestGenerator.getRequestContentHtml(endpoint);
    const headTagContent = requestWebviewClient.getHeadContent(nonce);
    const scriptTagContent = requestWebviewClient.getScriptContent(nonce);

    const htmlContent = `<html> 
				${headTagContent}
				<body>
					<div id='main' data-method='${endpoint.method}' data-url='${endpoint.urlLabel}'>
						${bodyContent}
						${scriptTagContent} 
					</div>
				</body>
			</html>
		`;

    return htmlContent;
}

/**
 * Launches an endpoint via command
 */
async function launchEndpointViaCommand() {
    try {
        const pickedItem = await vscode.window.showQuickPick(generateApiCategoryQuickPickItems(), {
            matchOnDescription: true,
            placeHolder: `Select an API category to launch an endpoint`,
            matchOnDetail: true
        });

        if (pickedItem?.label) {
            const epItem = await vscode.window.showQuickPick(generateApiEndpointQuickPickItems(pickedItem.label), {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: CHOOSE_ENDPOINT
            });
            if (epItem) {
                if (epItem) {
                    launchEndpointView(epItem.endpoint);
                }
            }
        }
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
}
