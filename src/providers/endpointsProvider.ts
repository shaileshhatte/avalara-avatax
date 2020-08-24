import * as vscode from 'vscode';
import * as swaggerJson from '../data/swagger.json';
import { EndpointMethod } from '../models/EndpointMethod';

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

export class EndPointsProvider implements vscode.TreeDataProvider<EndpointTreeItem | ApiCategory> {
	public tags: string[] = [];
	public endpoints: Map<string, EndpointMethod[]> = new Map();

	getTreeItem(element: EndpointTreeItem | ApiCategory): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ApiCategory | EndpointTreeItem): Thenable<EndpointTreeItem[] | ApiCategory[]> {
		if (element instanceof ApiCategory) {
			// console.log();
			return Promise.resolve(this.generateApiEndpointTreeItems(element.label));
		} else {
			return Promise.resolve(this.generateTags());
		}
	}

	generateTags(): ApiCategory[] {
		const apiCategories: ApiCategory[] = [];

		const paths: any = swaggerJson.paths;

		Object.keys(paths).forEach((url) => {
			const methods = Object.keys(paths[url]);
			methods.forEach((method) => {
				const m = paths[url][method];
				const tagsArray = m.tags;
				for (let i = 0; i < tagsArray.length; i++) {
					let tag = tagsArray[i];
					if (!this.tags.includes(tag)) {
						this.tags.push(tag);
					}
					if (this.endpoints.has(tag)) {
						let tempEndpoints: EndpointMethod[] = [];
						tempEndpoints = this.endpoints.get(tag) || [];
						tempEndpoints?.push(this.createEndpointMethod(url, method, tag, m));
						this.endpoints.set(tag, tempEndpoints);
					} else {
						let tempEndpoints: EndpointMethod[] = [];
						tempEndpoints.push(this.createEndpointMethod(url, method, tag, m));
						this.endpoints.set(tag, tempEndpoints);
					}
				}
			});
		});

		this.tags.forEach((tag) => {
			const apiCategory: ApiCategory = new ApiCategory(tag, vscode.TreeItemCollapsibleState.Collapsed);
			apiCategories.push(apiCategory);
		});

		return apiCategories;
	}

	createEndpointMethod(url: string, method: string, tag: string, ep: any): EndpointMethod {
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

	generateApiEndpointTreeItems(tag: string): EndpointTreeItem[] {
		const endpointMethods: EndpointMethod[] = this.endpoints.get(tag) || [];
		const endpointTreeItems: EndpointTreeItem[] = [];

		endpointMethods.forEach((em) => {
			let et = new EndpointTreeItem(em);
			endpointTreeItems.push(et);
		});

		return endpointTreeItems;
	}
}
