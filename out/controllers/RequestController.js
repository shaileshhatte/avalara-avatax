"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRequest = void 0;
const vscode = require("vscode");
const requestor_1 = require("../service/requestor");
/**
 * Hands over valid data to service caller to make a service call
 * @param data Request data including model
 */
function makeRequest(data) {
    if (data) {
        try {
            if (data.reqbody !== 'NA') {
                JSON.parse(data.reqbody);
            }
            requestor_1.fireRequest(data);
        }
        catch (err) {
            vscode.window.showErrorMessage('Invalid Request Body.');
            console.error(err);
        }
    }
    else {
        vscode.window.showErrorMessage(`Missing request content.`);
    }
}
exports.makeRequest = makeRequest;
//# sourceMappingURL=RequestController.js.map