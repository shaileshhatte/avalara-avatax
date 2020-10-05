import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { EndpointMethod } from '../models/EndpointMethod';

import * as favouriteEndpointsJson from '../data/favouriteEndpoints.json';
import { readSwaggerJson } from '../util/swagger';

const swaggerJson: any = readSwaggerJson();

let tags: string[] = [];
let endpoints: Map<string, EndpointMethod[]> = new Map();

/**
 * Class that facilitates endpoint items to show under the API endpoints treeview
 */
class EndpointTreeItem extends vscode.TreeItem {
    constructor(public readonly endpoint: EndpointMethod) {
        super(endpoint.urlLabel, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'favouriteEndpoint';
        this.command = {
            command: 'endpoint.launch',
            title: 'Launch',
            arguments: [endpoint]
        };
    }

    tooltip = `${this.endpoint.urlLabel}\n\nMethod: ${this.endpoint.method.toUpperCase()}\nOperation: ${this.endpoint.operationId}\n\n${this.endpoint.summary}`;
    description = this.endpoint.method ? this.endpoint.method.toString().toUpperCase() : '';
}

/**
 * Class that provides tree item for API category under Endpoints treeview.
 */
class ApiCategory extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }
}

/**
 * Tree data provider that provides tree data for API Endpoints view
 */
export class FavouriteEndPointsProvider implements vscode.TreeDataProvider<EndpointTreeItem | ApiCategory> {
    getTreeItem(element: EndpointTreeItem | ApiCategory): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ApiCategory | EndpointTreeItem): Thenable<EndpointTreeItem[] | ApiCategory[]> {
        if (element instanceof ApiCategory) {
            // console.log();
            return Promise.resolve(generateApiEndpointTreeItems(element.label));
        } else {
            return Promise.resolve(generateApiCategories());
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<EndpointTreeItem | ApiCategory | undefined> = new vscode.EventEmitter<EndpointTreeItem | ApiCategory | undefined>();
    readonly onDidChangeTreeData: vscode.Event<EndpointTreeItem | ApiCategory | undefined> = this._onDidChangeTreeData.event;

    refresh(element?: any): void {
        console.log(`refreshed`);

        if (element) {
            const tag = element.tag;
            const endpointsWithTag = favouriteEndpointsJson.endpoints.filter((ep: any) => {
                return ep.tag === tag;
            });
            if (!endpointsWithTag.length) {
                tags.splice(tags.indexOf(tag), 1);
                this.refresh();
            } else {
                this.refresh();
            }
        }

        this._onDidChangeTreeData.fire(element || undefined);
    }
}

/**
 * Generates API categories from API specification file (Swagger.json)
 * @returns Array of `ApiCategory` items
 */
function generateApiCategories(): ApiCategory[] {
    const apiCategories: ApiCategory[] = [];
    endpoints = new Map();

    try {
        const favouriteEndpoints: any = favouriteEndpointsJson.endpoints || [];
        const paths: any = swaggerJson.paths;

        if (favouriteEndpoints) {
            favouriteEndpoints.forEach((endpoint: any) => {
                const methodObj = paths[endpoint.label][endpoint.method];
                const tag = endpoint.tag;

                if (!tags.includes(tag)) {
                    tags.push(tag);
                }

                let tempEndpoints: EndpointMethod[] = [];

                if (endpoints.has(tag)) {
                    tempEndpoints = endpoints.get(tag) || [];
                    tempEndpoints?.push(createEndpointMethod(endpoint.label, endpoint.method, tag, methodObj));
                    endpoints.set(tag, tempEndpoints);
                } else {
                    tempEndpoints.push(createEndpointMethod(endpoint.label, endpoint.method, tag, methodObj));
                    endpoints.set(tag, tempEndpoints);
                }
            });
        }

        tags.sort().forEach((tag) => {
            const apiCategory: ApiCategory = new ApiCategory(tag, vscode.TreeItemCollapsibleState.Collapsed);
            apiCategories.push(apiCategory);
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }

    return apiCategories;
}

/**
 * Creates an endpoint of of type 'EndpointMethod' with given parameters.
 * @param url URL of an endpoint
 * @param method Method (e.g. `GET`, `POST`) of the endpoint
 * @param tag API category this endpoint belongs to
 * @param ep Endpoint object from the API specification file (Swagger.json)
 * @returns `EndpointMethod` object
 */
function createEndpointMethod(url: string, method: string, tag: string, ep: any): EndpointMethod {
    return new EndpointMethod(url, method, tag, ep.summary, ep.description, ep.operationId, ep.consumes, ep.produces, ep.parameters, ep.responses, ep.security);
}

/**
 * Generates API endpoints for a given API category
 * @param tag An API category (e.g. accounts, transactions etc.)
 * @returns Array of `EndpointTreeItem` items
 */
function generateApiEndpointTreeItems(tag: string): EndpointTreeItem[] {
    const endpointMethods: EndpointMethod[] = endpoints.get(tag) || [];
    const endpointTreeItems: EndpointTreeItem[] = [];
    try {
        endpointMethods.forEach((em) => {
            let et = new EndpointTreeItem(em);
            endpointTreeItems.push(et);
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }

    return endpointTreeItems;
}

export function removeFromFavourites() {
    //  console.log(arguments);

    if (!arguments) {
        return;
    }

    try {
        let jsonContent: any = favouriteEndpointsJson;
        let endpoints: any[] = favouriteEndpointsJson.endpoints || [];
        const index = endpoints.findIndex((ep) => {
            return ep.label === arguments[0].label && ep.method == arguments[0].endpoint.method && ep.tag === arguments[0].endpoint.tag;
        });
        if (index >= 0) {
            const deletedElements = endpoints.splice(index, 1);
            if (deletedElements) {
                jsonContent = { endpoints: endpoints };
                fs.writeFile(path.join(__dirname, `../data/`, `favouriteEndpoints.json`), JSON.stringify(jsonContent), (err) => {
                    if (!err) {
                        vscode.commands.executeCommand(`favouriteendpointsview.refresh`, deletedElements[0]);
                        // vscode.window.showInformationMessage(`Endpoint removed from Favourites.\n${deletedElements[0].method.toString().toUpperCase()} - ${deletedElements[0].label}`);
                        return;
                    }
                    vscode.window.showErrorMessage(err.message);
                });
            }
        }
    } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage(error);
    }
}
