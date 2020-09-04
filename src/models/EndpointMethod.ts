import { Parameter } from './Parameter';

/**
 * A class that provides for endpoint item template.
 */
export class EndpointMethod {
	constructor(
		public readonly urlLabel: string,
		public readonly method: string,
		public readonly tag: string,
		public readonly summary: string,
		public readonly description: string,
		public readonly operationId: string,
		public readonly consumes: string[],
		public readonly produces: string[],
		public readonly parameters: Parameter[],
		public readonly responses: {},
		public readonly security: [{}]
	) {}
}
