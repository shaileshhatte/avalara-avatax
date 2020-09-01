import * as vscode from 'vscode';
import * as swaggerJson from '../data/swagger.json';
import { EndpointMethod } from '../models/EndpointMethod';

let tags: string[] = [];
let endpoints: Map<string, EndpointMethod[]> = new Map();

/**
 * Endpoint item in the API endpoints treeview
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

	get tooltip(): string {
		let tooltip = `Method: ${this.endpoint.method.toUpperCase()}\nOperation: ${this.endpoint.operationId}\n\n${this.endpoint.summary}`;
		return tooltip;
	}

	get description(): string {
		return this.endpoint.method ? this.endpoint.method.toUpperCase() : '';
	}
}

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
 * A generic class to create quick pick item
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
 */
function generateApiCategories(): ApiCategory[] {
	const apiCategories: ApiCategory[] = [];

	const paths: any = swaggerJson.paths;

	Object.keys(paths).forEach((url) => {
		const methods = Object.keys(paths[url]);
		methods.forEach((method) => {
			const m = paths[url][method];
			const tagsArray = m.tags;
			for (let i = 0; i < tagsArray.length; i++) {
				let tag = tagsArray[i];
				if (!tags.includes(tag)) {
					tags.push(tag);
				}
				if (endpoints.has(tag)) {
					let tempEndpoints: EndpointMethod[] = [];
					tempEndpoints = endpoints.get(tag) || [];
					tempEndpoints?.push(createEndpointMethod(url, method, tag, m));
					endpoints.set(tag, tempEndpoints);
				} else {
					let tempEndpoints: EndpointMethod[] = [];
					tempEndpoints.push(createEndpointMethod(url, method, tag, m));
					endpoints.set(tag, tempEndpoints);
				}
			}
		});
	});

	tags.forEach((tag) => {
		const apiCategory: ApiCategory = new ApiCategory(tag, vscode.TreeItemCollapsibleState.Collapsed);
		apiCategories.push(apiCategory);
	});

	return apiCategories;
}

/**
 * Creates an endpoint of of type 'EndpointMethod' with given parameters.
 * @param url URL of an endpoint
 * @param method Method (e.g. GET, POST) of the endpoint
 * @param tag API category this endpoint belongs to
 * @param ep Endpoint object from the API specification file (Swagger.json)
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
 */
export function generateApiCategoryQuickPickItems(): ApiCategoryQuickPickItem[] {
	let quickPickItems: ApiCategoryQuickPickItem[] = [];
	try {
		console.log(`generateApiCategoryQuickPickItems --> ${generateApiCategories().length}`);
		const apiCategories: ApiCategory[] = generateApiCategories();

		apiCategories.forEach((apiCategory) => {
			const qpItem: ApiCategoryQuickPickItem = new ApiCategoryQuickPickItem(apiCategory.label, apiCategory.label, apiCategory.label);
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
 * @param apiCategory API category to fetch API endpoints for
 */
export function generateApiEndpointQuickPickItems(apiCategory: string): EndpointQuickPickItem[] {
	let quickPickItems: EndpointQuickPickItem[] = [];
	try {
		console.log(`generateApiEndpointsQuickPickItems --> ${generateApiEndpointTreeItems(apiCategory).length}`);
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

export function getTaxCalculationEndpoint(): EndpointMethod | undefined {
	let taxCalcEndpoint: EndpointMethod | undefined;
	const paths: any = swaggerJson.paths;
	try {
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

export function getAddressValidationEndpoint(): EndpointMethod | undefined {
	let addressValidationEndpoint: EndpointMethod | undefined;

	const paths: any = swaggerJson.paths;

	try {
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
