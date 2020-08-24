"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndPointsProvider = void 0;
const vscode = require("vscode");
const swaggerJson = require("../swagger.json");
const EndpointMethod_1 = require("../models/EndpointMethod");
class EndpointTreeItem extends vscode.TreeItem {
    constructor(endpoint) {
        super(endpoint.urlLabel, vscode.TreeItemCollapsibleState.None);
        this.endpoint = endpoint;
        this.contextValue = 'endpoint';
        this.command = {
            command: 'endpoint.launch',
            title: 'Launch',
            arguments: [endpoint]
        };
    }
    get tooltip() {
        let tooltip = `Method: ${this.endpoint.method.toUpperCase()}\nOperation: ${this.endpoint.operationId}\n\n${this.endpoint.summary}`;
        return tooltip;
    }
    get description() {
        return this.endpoint.method ? this.endpoint.method.toUpperCase() : '';
    }
}
class ApiCategory extends vscode.TreeItem {
    constructor(label, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
    }
}
class EndPointsProvider {
    constructor() {
        this.tags = [];
        this.endpoints = new Map();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element instanceof ApiCategory) {
            // console.log();
            return Promise.resolve(this.generateApiEndpointTreeItems(element.label));
        }
        else {
            return Promise.resolve(this.generateTags());
        }
    }
    generateTags() {
        const apiCategories = [];
        const paths = swaggerJson.paths;
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
                        let tempEndpoints = [];
                        tempEndpoints = this.endpoints.get(tag) || [];
                        tempEndpoints === null || tempEndpoints === void 0 ? void 0 : tempEndpoints.push(this.createEndpointMethod(url, method, tag, m));
                        this.endpoints.set(tag, tempEndpoints);
                    }
                    else {
                        let tempEndpoints = [];
                        tempEndpoints.push(this.createEndpointMethod(url, method, tag, m));
                        this.endpoints.set(tag, tempEndpoints);
                    }
                }
            });
        });
        this.tags.forEach((tag) => {
            const apiCategory = new ApiCategory(tag, vscode.TreeItemCollapsibleState.Collapsed);
            apiCategories.push(apiCategory);
        });
        return apiCategories;
    }
    createEndpointMethod(url, method, tag, ep) {
        return new EndpointMethod_1.EndpointMethod(url, method, tag, ep.summary, ep.description, ep.operationId, ep.consumes, ep.produces, ep.parameters, ep.responses, ep.security);
    }
    generateApiEndpointTreeItems(tag) {
        const endpointMethods = this.endpoints.get(tag) || [];
        const endpointTreeItems = [];
        endpointMethods.forEach((em) => {
            let et = new EndpointTreeItem(em);
            endpointTreeItems.push(et);
        });
        return endpointTreeItems;
    }
}
exports.EndPointsProvider = EndPointsProvider;
//# sourceMappingURL=endpointsProvider.js.map