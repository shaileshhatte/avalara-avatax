import { PropertyModel } from './PropertyModel';

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
