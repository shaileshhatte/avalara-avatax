import { PropertyModel } from './PropertyModel';

/**
 * A class that provides for definition model template
 */
export class DefinitionModel {
	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly requiredProperties: string[],
		public readonly propertyType: string,
		public readonly properties: PropertyModel[],
		public readonly example: any
	) {}
}
