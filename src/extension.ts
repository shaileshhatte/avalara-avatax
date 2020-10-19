/**
 * @author Shailesh Hatte
 */
import * as vscode from 'vscode';
import { addToFavourites, EndPointsProvider } from './providers/endpointsProvider';
import { launchEndpoint, launchTaxCalculationEndpoint, launchAddressCalculationEndpoint } from './helpers/requestLauncher';
import { DefinitionsProvider } from './providers/definitionsProvider';
import { launchModel } from './util/requestPanelClient';
import { AvaWebView } from './util/basewebview';
import { setupAvataxCredentials, deleteCredentials, verifyIfCredentialsExist } from './util/authenticator';
import { FavouriteEndPointsProvider, removeFromFavourites } from './providers/favouritesProvider';
import { generateTypeScriptModel } from './helpers/definitionsHelper';

/**
 * A function that's invoked when the extension is activated.
 * @param context VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
   // API Endpoints provider
   const endPointsProvider = new EndPointsProvider();
   const apiEndpointsProviderDisposable = vscode.window.registerTreeDataProvider('api-endpoints', endPointsProvider);
   vscode.window.createTreeView('api-endpoints', {
      treeDataProvider: endPointsProvider
   });

   const favouriteEndpointsProvider = new FavouriteEndPointsProvider();
   const favouriteEndpointsProviderDisposable = vscode.window.registerTreeDataProvider(`favourite-endpoints`, favouriteEndpointsProvider);
   vscode.window.createTreeView('favourite-endpoints', {
      treeDataProvider: favouriteEndpointsProvider
   });

   // Request model definition provider
   const definitionsProvider = new DefinitionsProvider();
   const definitionsProviderDisposable = vscode.window.registerTreeDataProvider('definition-models', definitionsProvider);
   vscode.window.createTreeView('definition-models', {
      treeDataProvider: definitionsProvider
   });

   // Share the Extension context so its accessible for using static resources
   AvaWebView.extensionContext = context;

   // Command - Setup AvaTax credentials
   const setupCredentialsDisposable = vscode.commands.registerCommand('avatax.setup', setupAvataxCredentials);
   // Command - Launch endpoint command
   const epLaunchDisposable = vscode.commands.registerCommand('endpoint.launch', launchEndpoint);
   // const epSearchDisposable = vscode.commands.registerCommand('avalara.endpoints.search', launchEndpoint);
   const epAddToFavouritesDisposable = vscode.commands.registerCommand('endpoint.addtofavourites', addToFavourites);
   const epRemoveFromFavouritesDisposable = vscode.commands.registerCommand('endpoint.removefromfavourites', removeFromFavourites);

   const refreshFavouritesTreeViewDisposable = vscode.commands.registerCommand('favouriteendpointsview.refresh', (args) => {
      console.log(args);
      favouriteEndpointsProvider.refresh(args);
   });
   const modelLaunchDisposable = vscode.commands.registerCommand('model.launch', launchModel);
   const modelExampleGenerateDisposable = vscode.commands.registerCommand('model.example.launch', launchModel);
   const tsModelGenerateDisposable = vscode.commands.registerCommand('model.generate.tsmodel', generateTypeScriptModel);

   // Command - tax calculation
   const epTaxLaunchDisposable = vscode.commands.registerCommand('taxendpoint.launch', launchTaxCalculationEndpoint);
   // Command - Launch address validation
   const epAddressLaunchDisposable = vscode.commands.registerCommand('addressendpoint.launch', launchAddressCalculationEndpoint);

   // Verify if credentials exist
   verifyIfCredentialsExist();

   context.subscriptions.push(
      apiEndpointsProviderDisposable,
      favouriteEndpointsProviderDisposable,
      epAddToFavouritesDisposable,
      epRemoveFromFavouritesDisposable,
      refreshFavouritesTreeViewDisposable,
      definitionsProviderDisposable,
      setupCredentialsDisposable,
      epLaunchDisposable,
      modelLaunchDisposable,
      modelExampleGenerateDisposable,
      epTaxLaunchDisposable,
      epAddressLaunchDisposable
   );
}

// this method is called when the extension is deactivated
export function deactivate() {}
