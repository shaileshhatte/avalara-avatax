import { window, workspace } from 'vscode';
import { getConfiguration } from './configurationProvider';
import * as keytar from 'keytar';
// import { testConnectionToAvatax } from '../service/requestor';

const keytarServiceName: string = `avalara.vscode.ext`;
const avataxConfiguration: any = getConfiguration();

export async function setupAvataxCredentials() {
	try {
		// const storedAccountId: string = avataxConfiguration[`avataxaccountnumber`];

		const storedAccountId: string = workspace.getConfiguration('avalara').get('avataxaccountnumber') || '';

		let avataxKey: string | undefined;
		const enteredAccountId = await window.showInputBox({
			value: storedAccountId || '',
			prompt: `Your AvaTax Account ID or Username`,
			ignoreFocusOut: true,
			placeHolder: `Account ID or Username`
		});

		if (enteredAccountId) {
			avataxKey = await window.showInputBox({
				password: true,
				prompt: `License Key or Account password`,
				ignoreFocusOut: true,
				placeHolder: `Enter your AvaTax License Key or Account password.`
			});

			if (avataxKey) {
				// await testConnection(enteredAccountId, avataxKey);
				await setCredentials(enteredAccountId, avataxKey);
				// await workspace.getConfiguration('avalara').update('avataxaccountnumber', enteredAccountId, true);
				const res = await window.showInformationMessage(`AvaTax credentials stored successfully!`, {
					title: `Test Connection to AvaTax (Recommended)`,
					id: `yes`
				});
			}

			// Remove existing account credentials if not the same
			if (enteredAccountId !== storedAccountId) {
				deleteCredentials(storedAccountId);
			}
		}
	} catch (err) {
		console.error(err);
		window.showErrorMessage(err);
	}
}

/**
 * Save the key for servicename `avatax`, and Account ID provided, to the system keychain using `keytar`.
 * Adds a new entry if necessary, or updates an existing entry if one exists.
 * @param accountid Account ID or user name
 * @param key License key or password
 */
async function setCredentials(accountid: string, key: string): Promise<void> {
	try {
		return await keytar.setPassword(keytarServiceName, accountid, key);
	} catch (err) {
		console.error(err);
		window.showErrorMessage(
			`Credentials could not be stored. You may opt to store it in extension settings under Settings > Extensions > Avalara.`
		);
	}
}

/**
 * Retrives the password from the system keychain for a given account ID.
 * @param accountid Account ID or user name
 */
export async function getCredentials(accountid: string): Promise<string | null> {
	let storedAvataxKey: string | null = null;
	try {
		storedAvataxKey = await keytar.getPassword(keytarServiceName, accountid);
	} catch (err) {
		console.error(err);
		window.showErrorMessage(
			`Credentials could not be retrieved from the keychain/vault. You may opt to store it in extension settings under Settings > Extensions > Avalara.`
		);
	}

	return storedAvataxKey;
}

/**
 * Delete the stored password for the service and provided account ID.
 * @param accountid Account ID or user name
 */
export async function deleteCredentials(accountId?: string) {
	let deletePromise = null;
	let accountToRemove;
	if (accountId) {
		accountToRemove = accountId;
	} else {
		accountToRemove = avataxConfiguration[`avataxaccountnumber`];
	}

	try {
		deletePromise = await keytar.deletePassword(keytarServiceName, accountToRemove);
		// window.showInformationMessage(`Credentials for AvaTax account '${accountToRemove}' have been removed successfully.`);
	} catch (err) {
		console.error(err);
		window.showErrorMessage(`Couldn't remove the AvaTax credentials: ${accountToRemove}. Error: ${err}`);
	}
	return deletePromise;
}
