export class PropertyModel {
	constructor(
		public readonly name: string,
		public readonly description: string,
		public readonly type: string,
		public readonly readOnly: boolean,
		public readonly example: any
	) {}
}
