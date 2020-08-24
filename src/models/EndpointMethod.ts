import { Parameter } from './Parameter';

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
