"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionsProvider = void 0;
const vscode = require("vscode");
const swaggerJson = require("../swagger.json");
class ModelDefinitionTreeItem extends vscode.TreeItem {
    constructor(definitionName, definitionDescription) {
        super(definitionName, vscode.TreeItemCollapsibleState.None);
        this.definitionName = definitionName;
        this.definitionDescription = definitionDescription;
        this.contextValue = 'definitionmodel';
        this.command = {
            command: 'model.launch',
            title: 'Launch Model',
            arguments: [definitionName]
        };
    }
    get tooltip() {
        return this.definitionDescription || ``;
    }
    get description() {
        return ``;
    }
}
class DefinitionsProvider {
    constructor() {
        this.generateDefinitionItems = () => {
            const modelDefinitions = [];
            const definitions = swaggerJson.definitions;
            Object.keys(definitions)
                .sort()
                .forEach((definition) => {
                const definitionDescription = definitions[definition][`description`];
                let defTreeItem = new ModelDefinitionTreeItem(definition, definitionDescription);
                modelDefinitions.push(defTreeItem);
            });
            return modelDefinitions;
        };
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(_element) {
        return Promise.resolve(this.generateDefinitionItems());
    }
}
exports.DefinitionsProvider = DefinitionsProvider;
//# sourceMappingURL=definitionsProvider.js.map