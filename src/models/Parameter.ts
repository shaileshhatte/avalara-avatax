/**
 * A class that provides for request parameter template
 */
export class Parameter {
    constructor(
        public name: string,
        public inLocation: string,
        public description: string,
        public required: boolean,
        public schema: any | undefined,
        public format: string | undefined,
        public defaultValue: string | undefined
    ) {}
}
