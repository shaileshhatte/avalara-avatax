"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parameter = void 0;
class Parameter {
    constructor(name, inLocation, description, required, schema, format, defaultValue) {
        this.name = name;
        this.inLocation = inLocation;
        this.description = description;
        this.required = required;
        this.schema = schema;
        this.format = format;
        this.defaultValue = defaultValue;
    }
}
exports.Parameter = Parameter;
//# sourceMappingURL=Parameter.js.map