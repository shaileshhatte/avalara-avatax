import { window } from 'vscode';
import { updateATConfiguration, getATConfiguration } from './configurationProvider';
import * as keytar from 'keytar';
import { error } from 'console';
import { testConnection } from '../controllers/RequestController';
// import { testConnectionToAvatax } from '../service/requestor';

const keytarServiceName: string = `avalara.vscode.ext`;
const avataxAccountNumberConfigName = `avataxaccountnumber`;

export async function setupAvataxCredentials() {
	try {
		const storedAccountId = getATConfiguration(avataxAccountNumberConfigName) || ``;
		let avataxKey: string | undefined;
		const enteredAccountId = await window.showInputBox({
			value: (storedAccountId as string) || '',
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
				await setCredentials(enteredAccountId, avataxKey);
				await updateATConfiguration(avataxAccountNumberConfigName, enteredAccountId); // Update account number in extension settings with the new one

				// Popup with an option to test connection
				const res = await window.showInformationMessage(`AvaTax credentials stored successfully!`, {
					title: `Test Connection (Recommended)`,
					id: `yes`
				});
				if (res?.id === `yes`) {
					await testConnection(enteredAccountId, avataxKey);
				}
			}

			// Remove existing account credentials if not the same
			if (enteredAccountId !== storedAccountId) {
				deleteCredentials(storedAccountId as string);
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
		window.showErrorMessage(`Credentials could not be stored in the system.`);
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
		if (!storedAvataxKey) {
			return Promise.reject(`AvaTax credentials may not be set up.`);
		}
	} catch (err) {
		console.error(err);
		window.showErrorMessage(err);
	}

	return Promise.resolve(storedAvataxKey);
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
		accountToRemove = getATConfiguration(avataxAccountNumberConfigName);
	}
	try {
		if (accountToRemove) {
			deletePromise = await keytar.deletePassword(keytarServiceName, accountToRemove as string);
		}
	} catch (err) {
		console.error(err);
		window.showErrorMessage(`Couldn't remove the AvaTax credentials: ${accountToRemove}. Error: ${err}`);
	}
	return deletePromise;
}
