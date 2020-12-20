# Avalara AvaTax API Explorer

Author: Shailesh Hatte (shaileshhatte@gmail.com) <br/><br/>
Avalara AvaTax REST v2 API explorer is an extension that makes it easier and convinient to test AvaTax tax and address APIs right from the VS Code.

## Features

Here's how this extension makes it easier to test AvaTax APIs.

<b>1. Launch API requests </b> <br/>

 <ul>
  <li>
      Click on an API endpoint. This will open two panels side by side each one for Request details and Response content.
  </li>
 </ul>
  <br/>

 <image src="./media/gifs/API-request.gif" alt="Launch API request"/>
 <br/>

<b> 2. API Request Section Features </b> <br/>

<ul>
Features:
    <li>Request section makes it easier to see what request model is being used.</li>
    <li>All mandatory fields are marked as such, without which the request cannot be launched.</li>
    <li>Request body can be copied, prettified, and reset with original example.</li>
</ul>

   <image src="./media/gifs/Request-features.gif" alt="API Request section Features"/>
    <br/>

<b> 3. Service Response section Features </b> <br/>

<ul>
Features:
    <li>Resppnse section makes it easier to view all details about response such as header information, response content etc.</li>
    <li>Response content can be copied, saved on disk as JSON or XML as applicable.</li>
    <li>Generate request code snippets for current request in popular languages.</li>
</ul>

   <image src="./media/gifs/Response-features.gif" alt="Service Response section Features"/>
   <br/>

<b> 4. VS Code Commands </b> <br/>

<ul>
    <li>Launch address or tax API right from within your project using commands.</li>
</ul>

   <image src="./media/gifs/VS-Code-Commands.gif" alt="VS Code Commands"/>
   <br/>

<b> 5. Model Definitions </b> <br/>

<ul>
    <li>View example of a request model and also a entire model definition with type definitions of all attributes.</li>
</ul>

   <image src="./media/gifs/Model-definitions.gif" alt="Model Definitions"/>
   <br/>

<b> 6. Generate TypeScript Interfaces </b> <br/>

<ul>
    <li>Generate TypeScript interfaces from a model.</li>
</ul>

   <image src="./media/gifs/Generate-TypeScript-Interface.gif" alt="Generate TypeScript Interfaces"/>
   <br/>

<b> 6. Setup AvaTax Credentials </b> <br/>

<ul>
    <li>Setup AvaTax credentials via command.</li>
</ul>

   <image src="./media/gifs/Setup-Credentials.gif" alt="Setup AvaTax Credentials"/>
   <br/>

> Note: The credentials are safely stored your system Keychain (MacOS) or Vault (Windows/Linux).

## Extension Settings

AvaTax environment (Sandbox/Production) can be selected in the extension Settings section.

<image src="./media/Extension Settings.png">

<br/>

## Known Issues

Sometimes you may face issues generating TypeScript interfaces from models.

## Release Notes

### 1.0.0

Initial release of Avalara AvaTax REST API Explorer.

---
