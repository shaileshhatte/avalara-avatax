/****************************************************************************
 * This module is responsible for handling AvaTax authentication operations.
 * Responsibilities include:
 * ... Setting up new credentials
 * ... Retrieving existing credentials
 * ... Delete credentials
 ****************************************************************************/

import { window } from 'vscode';
import { updateATConfiguration, getATConfiguration } from './configurationProvider';
import * as keytar from 'keytar';
import { launchTestConnectionEndpoint } from '../helpers/requestLauncher';
import { AVConstants } from './avconstants';

/** Local constants */
const CREDENTIALS_ACCOUNT_INPUT_PROMPT: string = `Your AvaTax Account ID or Username`;
const CREDENTIALS_ACCOUNT_INPUT_PLACEHOLDER: string = `Account ID or Username`;
const CREDENTIALS_LKEY_INPUT_PROMPT: string = `License Key or Account password`;
const CREDENTIALS_LKEY_INPUT_PLACEHOLDER: string = `Enter your AvaTax License Key or Account password.`;
const PING_AVATAX_PROMPT: string = `AvaTax account credentials stored successfully!`;
const PING_AVATAX_BUTTON_TITLE: string = `Ping AvaTax (Recommended)`;
const PING_AVATAX_INFO: string = `Click 'Send Request' to ping AvaTax API.`;
const PROBLEM_STORING_CREDENTIALS: string = `AvaTax credentials could not be stored in the system keychain/vault.`;
const CREDENTIALS_NOT_AVAILABLE: string = `AvaTax account not set up. Please set it up using command 'Setup AvaTax Credentials'`;
const CREDENTIALS_NOT_FOUND: string = `AvaTax account not set up. Do you want to set it up now? It can also be set up later using command 'Setup AvaTax Credentials'.`;
const SETUP_CREDENTIALS: string = `Setup Credentials`;

/**
 * Sets up AvaTax credentials via command.
 * Replaces the existing account with the newly entered credentials.
 * @returns Promise that resolves when the credentials are stored successfully.
 */
export async function setupAvataxCredentials(): Promise<void> {
   try {
      const storedAccountId = getATConfiguration(AVConstants.avataxAccountNumberConfigName) || ``; // Retrive existing account no., if any.
      let avataxKey: string | undefined;
      const enteredAccountId = await window.showInputBox({
         value: (storedAccountId as string) || '',
         prompt: CREDENTIALS_ACCOUNT_INPUT_PROMPT,
         ignoreFocusOut: true,
         placeHolder: CREDENTIALS_ACCOUNT_INPUT_PLACEHOLDER
      });

      if (enteredAccountId) {
         avataxKey = await window.showInputBox({
            password: true,
            prompt: CREDENTIALS_LKEY_INPUT_PROMPT,
            ignoreFocusOut: true,
            placeHolder: CREDENTIALS_LKEY_INPUT_PLACEHOLDER
         });
         if (avataxKey) {
            await setCredentials(enteredAccountId, avataxKey);
            await updateATConfiguration(AVConstants.avataxAccountNumberConfigName, enteredAccountId); // Update account no. in ext settings
            // Offer to ping AvaTax service
            const res = await window.showInformationMessage(PING_AVATAX_PROMPT, {
               title: PING_AVATAX_BUTTON_TITLE,
               id: `yes`
            });
            if (res?.id === `yes`) {
               await launchTestConnectionEndpoint();
               await window.showInformationMessage(PING_AVATAX_INFO);
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
      return await keytar.setPassword(AVConstants.keytarServiceName, accountid, key);
   } catch (err) {
      console.error(err);
      window.showErrorMessage(PROBLEM_STORING_CREDENTIALS);
   }
}

/**
 * Retrives the password from the system keychain for a given account ID.
 * @param accountid Account ID or user name
 */
export async function getCredentials(accountid: string): Promise<string | null> {
   let storedAvataxKey: string | null = null;
   try {
      if (accountid) {
         storedAvataxKey = await keytar.getPassword(AVConstants.keytarServiceName, accountid);
         if (!storedAvataxKey) {
            window.showErrorMessage(CREDENTIALS_NOT_AVAILABLE);

            //return Promise.resolve('');
            // Do not reject promise in case credentials are not setup
            // Request will not be sent. And, this will skip test case – what is the response if credentials are not setup.
         }
      } else {
         verifyIfCredentialsExist();
      }
   } catch (err) {
      console.error(err);
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
      accountToRemove = getATConfiguration(AVConstants.avataxAccountNumberConfigName);
   }
   try {
      if (accountToRemove) {
         deletePromise = await keytar.deletePassword(AVConstants.keytarServiceName, accountToRemove as string);
      }
   } catch (err) {
      console.error(err);
      window.showErrorMessage(`Couldn't remove the AvaTax credentials: ${accountToRemove}. Error: ${err}`);
   }
   return deletePromise;
}

/**
 * Verifies if any AvaTax account exists on the machine.
 * If not, offer to configure one.
 */
export async function verifyIfCredentialsExist() {
   try {
      const storedAccountId = getATConfiguration(AVConstants.avataxAccountNumberConfigName) || ``; // Retrive existing account no., if any.
      const accounts = await keytar.findCredentials(AVConstants.keytarServiceName);
      if (accounts.length > 0) {
         const persistedAccountId = accounts[0].account.toString() || ``;

         if (storedAccountId !== persistedAccountId) {
            await updateATConfiguration(AVConstants.avataxAccountNumberConfigName, persistedAccountId); // Update account no. in ext settings
         }
      } else {
         const res = await window.showInformationMessage(CREDENTIALS_NOT_FOUND, {
            title: SETUP_CREDENTIALS,
            id: `yes`
         });
         if (res?.id === `yes`) {
            await setupAvataxCredentials();
         }
      }
   } catch (error) {
      console.error(error);
      window.showErrorMessage(error);
   }
}
