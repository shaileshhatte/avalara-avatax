/**
 * Class that provides strings for global constants
 */
export abstract class AVConstants {
	/** AvaTax Settings */
	static readonly sandboxBaseUrl: string = `https://sandbox-rest.avatax.com`;
	static readonly productionBaseUrl: string = `https://rest.avatax.com`;

	/** Keytar */
	static readonly keytarServiceName: string = `avalara.vscode.ext`;

	/** AvaTax config constants */
	static readonly configurationSectionName: string = `avalara`;
	static readonly avataxAccountNumberConfigName: string = `avataxaccountnumber`;
	static readonly environmentConfigName: string = `environment`;
	static readonly requestTimeOutConfigName: string = `requesttimeout`;

	/** View Types */
	static readonly endpointLaunchViewType: string = `endpoint.launch`;
	static readonly responsePanelTitle: string = `Response`;
}
