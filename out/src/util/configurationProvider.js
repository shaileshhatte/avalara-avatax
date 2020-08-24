"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfiguration = void 0;
const vscode = require("vscode");
function getConfiguration() {
    try {
        const configurationObject = vscode.workspace.getConfiguration();
        const config = configurationObject['avalara'];
        return config;
    }
    catch (err) {
        vscode.window.showErrorMessage(`Configurations are not available. ${err}`);
    }
}
exports.getConfiguration = getConfiguration;
//# sourceMappingURL=configurationProvider.js.map