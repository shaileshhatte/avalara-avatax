"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ModelDefinitionTreeItem extends vscode.TreeItem {
    constructor(definitionModel) {
        super(definitionModel.name, vscode.TreeItemCollapsibleState.None);
        this.definitionModel = definitionModel;
        this.contextValue = 'defiitionmodel';
        this.command = {
            command: 'endpoint.launch',
            title: 'Launch',
            arguments: [definitionModel]
        };
    }
    get tooltip() {
        return this.definitionModel.description || ``;
    }
}
class ModelProvider {
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=modelsProvider.js.map