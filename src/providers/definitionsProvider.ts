import * as vscode from 'vscode';
import * as swaggerJson from '../data/swagger.json';

/**
 * Class that facilitates a tree item for model definition under model definitions tree view
 */
class ModelDefinitionTreeItem extends vscode.TreeItem {
    constructor(public readonly definitionName: string, public readonly definitionDescription: string) {
        super(definitionName, vscode.TreeItemCollapsibleState.None);

        this.contextValue = 'definitionmodel';
        this.command = {
            command: 'model.launch',
            title: 'Launch Model',
            arguments: [definitionName]
        };
    }
    tooltip = this.definitionDescription;
}

/**
 * Data provider for model definitions tree view
 */
export class DefinitionsProvider implements vscode.TreeDataProvider<ModelDefinitionTreeItem> {
    onDidChangeTreeData?: vscode.Event<void | ModelDefinitionTreeItem | null | undefined> | undefined;

    getTreeItem(element: ModelDefinitionTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(_element?: ModelDefinitionTreeItem | undefined): vscode.ProviderResult<ModelDefinitionTreeItem[]> {
        return Promise.resolve(this.generateDefinitionItems());
    }

    generateDefinitionItems = (): ModelDefinitionTreeItem[] => {
        const modelDefinitions: ModelDefinitionTreeItem[] = [];
        const definitions: any = swaggerJson.definitions;
        Object.keys(definitions)
            .sort()
            .forEach((definition) => {
                const definitionDescription: string = definitions[definition][`description`];

                let defTreeItem: ModelDefinitionTreeItem = new ModelDefinitionTreeItem(definition, definitionDescription);
                modelDefinitions.push(defTreeItem);
            });

        return modelDefinitions;
    };
}
