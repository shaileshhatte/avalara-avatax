import * as vscode from 'vscode';
import * as swaggerJson from '../data/swagger.json';
import { EndpointMethod } from '../models/EndpointMethod';

let tags: string[] = [];
let endpoints: Map<string, EndpointMethod[]> = new Map();

/**
 * Class that facilitates endpoint items to show under the API endpoints treeview
 */
class EndpointTreeItem extends vscode.TreeItem {
    constructor(public readonly endpoint: EndpointMethod) {
        super(endpoint.urlLabel, vscode.TreeItemCollapsibleState.None);
        this.contextValue = 'endpoint';
        this.command = {
            command: 'endpoint.launch',
            title: 'Launch',
            arguments: [endpoint]
        };
    }

    tooltip = `${this.endpoint.urlLabel}\n\nMethod: ${this.endpoint.method.toUpperCase()}\nOperation: ${this.endpoint.operationId}\n\n${
        this.endpoint.summary
    }`;
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
export class EndPointsProvider implements vscode.TreeDataProvider<EndpointTreeItem | ApiCategory> {
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
}

/**
 * A generic class that creates quick pick item
 */
export class EndpointQuickPickItem implements vscode.QuickPickItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    endpoint: EndpointMethod;

    constructor(label: string, description: string, detail: string, ep: EndpointMethod) {
        this.label = label;
        this.description = description;
        this.detail = detail;
        this.endpoint = ep;
    }
}

/**
 * A generic class to create quick pick item
 */
export class ApiCategoryQuickPickItem implements vscode.QuickPickItem {
    label: string;
    description?: string | undefined;
    detail?: string | undefined;

    constructor(label: string, description: string, detail: string) {
        this.label = label;
        this.description = description;
        this.detail = detail;
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
        const paths: any = swaggerJson.paths;
        Object.keys(paths).forEach((url) => {
            const methods = Object.keys(paths[url]);
            methods.forEach((method) => {
                const methodObj = paths[url][method];
                const tagsArray = methodObj.tags;
                // Iterate over tags and add a tag to tags list if doesn't exist.
                // Also, if the tag already exists, add the endpoints against it.
                tagsArray.forEach((tag: string) => {
                    if (!tags.includes(tag)) {
                        tags.push(tag);
                    }

                    let tempEndpoints: EndpointMethod[] = [];
                    if (endpoints.has(tag)) {
                        tempEndpoints = endpoints.get(tag) || [];
                        tempEndpoints?.push(createEndpointMethod(url, method, tag, methodObj));
                        endpoints.set(tag, tempEndpoints);
                    } else {
                        tempEndpoints.push(createEndpointMethod(url, method, tag, methodObj));
                        endpoints.set(tag, tempEndpoints);
                    }
                });
            });
        });

        tags.forEach((tag) => {
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
 * @param method Method (e.g. GET, POST) of the endpoint
 * @param tag API category this endpoint belongs to
 * @param ep Endpoint object from the API specification file (Swagger.json)
 * @returns `EndpointMethod` object
 */
function createEndpointMethod(url: string, method: string, tag: string, ep: any): EndpointMethod {
    return new EndpointMethod(
        url,
        method,
        tag,
        ep.summary,
        ep.description,
        ep.operationId,
        ep.consumes,
        ep.produces,
        ep.parameters,
        ep.responses,
        ep.security
    );
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

/**
 * Generates all available API categories from API specification
 * @returns Array of `ApiCategoryQuickPickItem`
 */
export function generateApiCategoryQuickPickItems(): ApiCategoryQuickPickItem[] {
    let quickPickItems: ApiCategoryQuickPickItem[] = [];
    try {
        const apiCategories: ApiCategory[] = generateApiCategories();
        apiCategories.forEach((apiCategory) => {
            const qpItem: ApiCategoryQuickPickItem = new ApiCategoryQuickPickItem(apiCategory.label, ``, ``);
            quickPickItems.push(qpItem);
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return quickPickItems;
}

/**
 * Generates API endpoints for provided API category
 * @param apiCategory API category to fetch API endpoints for.
 * @returns Array of `EndpointQuickPickItem`
 */
export function generateApiEndpointQuickPickItems(apiCategory: string): EndpointQuickPickItem[] {
    let quickPickItems: EndpointQuickPickItem[] = [];
    try {
        const apiEndpoints: EndpointTreeItem[] = generateApiEndpointTreeItems(apiCategory);
        apiEndpoints.forEach((ep) => {
            const qpItem: EndpointQuickPickItem = new EndpointQuickPickItem(
                ep.label || ep.endpoint.urlLabel,
                ep.description,
                ep.endpoint.description,
                ep.endpoint
            );
            quickPickItems.push(qpItem);
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return quickPickItems;
}

/**
 * Provides an endpoint for tax calculation cammand
 * @returns `EndpointMethod` object or `undefined`
 */
export function getTaxCalculationEndpoint(): EndpointMethod | undefined {
    let taxCalcEndpoint: EndpointMethod | undefined;
    try {
        const paths: any = swaggerJson.paths;
        Object.keys(paths).forEach((url) => {
            if (url === `/api/v2/transactions/create`) {
                const method = 'post';
                const methodObj = paths[url][method];
                taxCalcEndpoint = createEndpointMethod(url, method, 'Transactions', methodObj);
            }
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return taxCalcEndpoint;
}

/**
 * Provides an endpoint for address validation command
 * @returns `EndpointMethod` object or `undefined`
 */
export function getAddressValidationEndpoint(): EndpointMethod | undefined {
    let addressValidationEndpoint: EndpointMethod | undefined;
    try {
        const paths: any = swaggerJson.paths;
        Object.keys(paths).forEach((url) => {
            if (url === `/api/v2/addresses/resolve`) {
                const method = 'post';
                const methodObj = paths[url][method];
                addressValidationEndpoint = createEndpointMethod(url, method, 'addresses', methodObj);
            }
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }
    return addressValidationEndpoint;
}

/**
 * Provides an endpoint for test connection command
 * @returns `EndpointMethod` object or `undefined`
 */
export function getTestConnectionEndpoint(): EndpointMethod | undefined {
    let testConnectionEndpoint: EndpointMethod | undefined;
    try {
        const paths: any = swaggerJson.paths;
        Object.keys(paths).forEach((url) => {
            if (url === `/api/v2/utilities/ping`) {
                const method = 'get';
                const methodObj = paths[url][method];
                testConnectionEndpoint = createEndpointMethod(url, method, 'Utilities', methodObj);
            }
        });
    } catch (err) {
        console.error(err);
        vscode.window.showErrorMessage(err);
    }

    return testConnectionEndpoint;
}
