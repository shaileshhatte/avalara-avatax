"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointMethod = void 0;
class EndpointMethod {
    constructor(urlLabel, method, tag, summary, description, operationId, consumes, produces, parameters, responses, security) {
        this.urlLabel = urlLabel;
        this.method = method;
        this.tag = tag;
        this.summary = summary;
        this.description = description;
        this.operationId = operationId;
        this.consumes = consumes;
        this.produces = produces;
        this.parameters = parameters;
        this.responses = responses;
        this.security = security;
    }
}
exports.EndpointMethod = EndpointMethod;
//# sourceMappingURL=EndpointMethod.js.map