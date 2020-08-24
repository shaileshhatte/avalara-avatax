"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestContentHtml = void 0;
const Parameter_1 = require("../models/Parameter");
const requestJsonGenerator = require("./requestJsonGenerator");
let endpoint = undefined;
/**
 * Generates HTML body for request webviewpanel
 * @param endpoint Endpoint (of type EndpointMethod) for which request body is to be generated
 */
function getRequestContentHtml(ept) {
    endpoint = ept;
    let requestContentHtml = '';
    try {
        requestContentHtml +=
            generateTitleButtonsHtml() + generateEndpointDescription() + '<table>' + generateRequestContent() + '</table>';
    }
    catch (err) {
        console.error(err);
    }
    return requestContentHtml;
}
exports.getRequestContentHtml = getRequestContentHtml;
/**
 * Generates HTML content for button and request URL Label section on request panel.
 */
function generateTitleButtonsHtml() {
    let htmlContent = '';
    try {
        if (!endpoint) {
            return '';
        }
        const urlLabelClipped = endpoint.urlLabel.length >= 80 ? endpoint.urlLabel.substr(0, 75) + '...' : endpoint.urlLabel;
        const endpointLabelClipped = `${endpoint.method.toUpperCase()} ${urlLabelClipped}`;
        htmlContent += `<div>
							<span class='endpoint-label' title='${endpoint.urlLabel}'>${endpointLabelClipped || ''}</span>
							<input id='btn-send' class='btn-send' type='button' value='Send Request'/>
						</div>
					`;
    }
    catch (err) {
        console.error(err);
    }
    return htmlContent;
}
function generateEndpointDescription() {
    let htmlContent = '';
    htmlContent += `	<br>
						<div class='description-section'>
							<p><a href='#' title='Show/Hide Endpoint Description' id='description-show-link' class='description-show-link'>Show Description</a></p>
							<div id='description-div' class='description-div'>
								<p class='bold-text'>DESCRIPTION</p>
								<div id='endpoint-description' class='endpoint-description'>
									${(endpoint === null || endpoint === void 0 ? void 0 : endpoint.description) || 'Description not available'}
								</div>
							</div>
						</div>
					`;
    // htmlContent += `
    // 					<tr class='heading'>
    // 						<td colspan='2'><span class='bold-text'>DESCRIPTION</span></td>
    // 					</tr>
    // 					<tr class='endpoint-description'>
    // 						<td colspan='2'>${endpoint?.description}</td>
    // 					</tr>
    // 				`;
    return htmlContent;
}
/**
 * Generates HTML content for request body - including for editable parameters section and request body
 */
function generateRequestContent() {
    let requestHtmlContent = '';
    if (!endpoint) {
        return '';
    }
    try {
        const parameters = endpoint.parameters;
        let pathHasSchema = false;
        const editableParametersMap = new Map(); // A map of inLocation and an array of parameters
        let schemaRef = '';
        let model = '';
        parameters.forEach((param) => {
            let paramModel = new Parameter_1.Parameter(param.name || '', param.in || '', param.description || '', param.required || false, param.schema, param.format, param.default);
            if (!!paramModel.schema && paramModel.inLocation === 'body') {
                pathHasSchema = !pathHasSchema;
                schemaRef = paramModel.schema['$ref'];
                return true;
            }
            else {
                const tempParameters = editableParametersMap.get(paramModel.inLocation) || [];
                tempParameters.push(paramModel);
                editableParametersMap.set(paramModel.inLocation, tempParameters);
            }
        });
        if (!!schemaRef) {
            let temp = schemaRef.split('/');
            model = temp[temp.length - 1];
        }
        const editableParametersSection = getEditableParametersContent(editableParametersMap);
        requestHtmlContent = editableParametersSection;
        if (!!model) {
            const requestBodyHtml = getRequestBodyHtml(model);
            requestHtmlContent = editableParametersSection + requestBodyHtml;
        }
    }
    catch (err) {
        console.error(err);
    }
    return requestHtmlContent;
}
/**
 * Generates HTML content for editable parameters section on request panel.
 * @param editableParametersMap A map of parameter type (Path/Header/Query) and an array of respective parameters
 */
function getEditableParametersContent(editableParametersMap) {
    let htmlContent = '';
    try {
        editableParametersMap.forEach((parametersArray, location) => {
            htmlContent += `<tr class='heading'>
							<td colspan='2'>	
								<span class='bold-text'>${location.toUpperCase()}</span>
							</td>
						</tr>
						`;
            parametersArray.forEach((param) => {
                let inputType = '';
                switch (param.format) {
                    case 'string':
                        inputType = 'text';
                        break;
                    case 'int32':
                        inputType = 'number';
                        break;
                    case 'date-time':
                        inputType = 'datetime';
                        break;
                    default:
                        inputType = 'text';
                        break;
                }
                htmlContent += `<tr>
									<td>
										<span class='param-name monospace' title='${param.description}'>${param.name} ${param.required ? '<span class="required-flag">(Required)' : ''}</span>
									</td>
									<td class='input-background'>
										<input data-type='${location}' data-paramname='${param.name}' class='input-${param.required.toString()} input-${param.inLocation} input-rounded-border monospace input-box' type='${inputType}' required=${param.required} placeholder='${param.defaultValue || inputType}' value='${param.defaultValue || ''}'>
									</td>
							</tr>
							`;
            });
        });
    }
    catch (err) {
        console.error(err);
    }
    return htmlContent;
}
/**
 * Generates a request body HTML based on provided model
 * @param model Model for generating an example request body
 */
function getRequestBodyHtml(model) {
    let htmlContent = '';
    try {
        const requestBodyJson = requestBodyAsJson(model);
        htmlContent += `<tr class='heading'>
							<td colspan='2'><span class='heading'>
								<div>
									<span class='bold-text'>BODY</span>
									<span class='model-label'><a href='#' id='model-link' title='Click to view this model'>${model || ''}</a></span>
								</div>
							</td>
						</tr>
						<tr class='textarea-tr'>
							<td colspan='2' class='request-body td-center'>
								<textarea id='request-body' class='monospace' rows='40' cols='100' data-model='${model}'> ${requestBodyJson} </textarea>
							</td>
						</tr>
					`;
    }
    catch (err) {
        console.error(err);
    }
    return htmlContent;
}
/**
 * Generates a JSON example request body based on gived model
 * @param model Model for which JSON example body is to be generated
 */
function requestBodyAsJson(model) {
    let requestContent = '';
    let formattedJson = '';
    try {
        requestContent = requestJsonGenerator.convertSchemaToJson(model);
        formattedJson = JSON.stringify(requestContent, null, 3).trim();
    }
    catch (err) {
        console.error(err);
    }
    return formattedJson;
}
//# sourceMappingURL=requestGenerator.js.map