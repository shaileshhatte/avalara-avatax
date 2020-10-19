import { window } from 'vscode';
import { EndpointMethod } from '../models/EndpointMethod';
import { Parameter } from '../models/Parameter';
import * as requestJsonGenerator from './requestJsonGenerator';

/**
 * Local constants
 * */
let endpoint: EndpointMethod | undefined = undefined;

/**
 * Generates HTML body for request webviewpanel
 * @param endpoint Endpoint (of type EndpointMethod) for which request body is to be generated
 */
export function getRequestContentHtml(ept: EndpointMethod): string {
    endpoint = ept;
    let requestContentHtml: string = '';
    try {
        requestContentHtml += generateTitleButtonsHtml() + generateEndpointDescription() + '<table>' + generateRequestContent() + '</table>';
    } catch (err) {
        console.error(err);
    }
    return requestContentHtml;
}

/**
 * Generates HTML content for button and request URL Label section on request panel.
 */
function generateTitleButtonsHtml(): string {
    let htmlContent: string = '';
    try {
        if (!endpoint) {
            return '';
        }
        const urlLabelClipped = endpoint.urlLabel.length >= 60 ? endpoint.urlLabel.substr(0, 60) + '...' : endpoint.urlLabel;
        const endpointLabelClipped = `${endpoint.method.toUpperCase()} ${urlLabelClipped}`;
        htmlContent += `<div>
							<span class='endpoint-label' title='${endpoint.urlLabel}'>${endpointLabelClipped || ''}</span>
							<input id='btn-send' class='btn-send' type='button' value='Send Request' data-accepts='${endpoint.produces}'/>
						</div>
					`;
    } catch (err) {
        console.error(err);
    }

    return htmlContent;
}
/**
 * Generates an HTML for description of the endpoint
 */
function generateEndpointDescription(): string {
    let htmlContent: string = '';

    htmlContent += `	<br>
						<div class='description-section'>
							<p><a href='javascript:void(0)' title='Show/Hide Endpoint Description' id='description-show-link' class='description-show-link'>Show Description</a></p>
							<div id='description-div' class='description-div'>
								<p class='bold-text'>DESCRIPTION</p>
								<div id='endpoint-description' class='endpoint-description'>
									${endpoint?.description || '<i>Description unavailable.</i>'}
								</div>
							</div>
						</div>
					`;
    return htmlContent;
}

/**
 * Generates HTML content for request body - including for editable parameters section and request body
 */
function generateRequestContent(): string {
    let requestHtmlContent: string = '';

    if (!endpoint) {
        return '';
    }

    try {
        const parameters: Parameter[] = endpoint.parameters;
        let pathHasSchema: boolean = false;
        const editableParametersMap: Map<string, Parameter[]> = new Map(); // A map of inLocation and an array of parameters

        let schemaRef: any = '';
        let model = '';
        let isModelArrayOfItems: boolean = false;
        let isModelBodyRequired: boolean = false;

        parameters.forEach((param: any) => {
            let paramModel = new Parameter(param.name || '', param.in || '', param.description || '', param.required || false, param.type || '', param.schema, param.format, param.default);
            if (!!paramModel.schema && paramModel.inLocation === 'body') {
                pathHasSchema = !pathHasSchema;
                schemaRef = paramModel.schema['$ref'] || paramModel.schema[`items`][`$ref`];

                isModelArrayOfItems = paramModel.schema[`type`] && paramModel.schema[`type`] === `array`;

                return true;
            } else {
                const tempParameters = editableParametersMap.get(paramModel.inLocation) || [];
                tempParameters.push(paramModel);
                editableParametersMap.set(paramModel.inLocation, tempParameters);
            }

            isModelBodyRequired = param.required || false;
        });

        if (!!schemaRef) {
            let temp = schemaRef.split('/');
            model = temp[temp.length - 1];
        }

        const editableParametersSection = getEditableParametersContent(editableParametersMap);
        requestHtmlContent = editableParametersSection;
        if (model) {
            const requestBodyHtml = getRequestBodyHtml(model, isModelArrayOfItems, isModelBodyRequired);
            requestHtmlContent = editableParametersSection + requestBodyHtml;
        }
    } catch (err) {
        console.error(err);
    }

    return requestHtmlContent;
}

/**
 * Generates HTML content for editable parameters section on request panel.
 * @param editableParametersMap A map of parameter type (Path/Header/Query) and an array of respective parameters
 */
function getEditableParametersContent(editableParametersMap: Map<string, Parameter[]>): string {
    let htmlContent: string = '';

    try {
        editableParametersMap.forEach((parametersArray, location) => {
            htmlContent += `<tr class='heading'>
							<td colspan='2'>	
								<span class='bold-text'>${location.toUpperCase()}</span>
							</td>
						</tr>
						`;
            parametersArray.forEach((param: Parameter) => {
                let inputType: string = 'text';

                const paramName: string = param.name || ``;
                const paramDescription: string = param.description || ``;
                let paramValue: any = param.defaultValue || '';
                const isParamRequired: boolean = !!param.required;
                const paramInlocation: string = param.inLocation;
                const headerDisabledForXAvalaraClient: boolean = paramName === `X-Avalara-Client` && paramInlocation === `header`;

                let acceptedInputFileExtensions = '';

                switch (param.type) {
                    case 'string':
                        if (param.format === 'date-time') {
                            paramValue = `2020-06-01T08:30Z`;
                        }
                        inputType = `text`;
                        break;
                    case 'integer':
                        inputType = 'number';
                        break;
                    case 'date-time':
                        // inputType = 'datetime-local';
                        inputType = `text`;
                        paramValue = `2020-06-01T08:30Z`;
                        break;
                    case 'file':
                        inputType = 'file';
                        acceptedInputFileExtensions = `accept='.pdf, .jpeg, .tiff, .png'`;
                        break;
                    default:
                        inputType = 'text';
                        break;
                }

                htmlContent += `<tr>
									<td>
										<span class='param-name monospace cursor-help' title='${paramDescription}'>${paramName} ${isParamRequired ? '<span class="required-flag">(Required)' : ''}</span>
									</td>
									<td class='input-background'>
										<input ${acceptedInputFileExtensions} ${
                    !!headerDisabledForXAvalaraClient ? 'disabled' : ''
                } data-type='${location}' data-paramname='${paramName}' class='input-${isParamRequired.toString()} input-${paramInlocation} input-rounded-border monospace input-box' type='${inputType}' required=${isParamRequired} placeholder='${inputType}' value='${
                    paramValue || ''
                }'>
									</td>
							</tr>
							`;
            });
        });
    } catch (err) {
        console.error(err);
        window.showErrorMessage(err);
    }

    return htmlContent;
}

/**
 * Generates a request body HTML based on provided model
 * @param model Model for generating an example request body
 */
function getRequestBodyHtml(model: string, isModelArrayOfItems: boolean, isModelBodyRequired: boolean): string {
    let htmlContent: string = '';
    try {
        const requestBodyJson = isModelArrayOfItems ? '[' + requestBodyAsJson(model) + ']' : requestBodyAsJson(model);
        htmlContent += `<tr class='heading'>
							<td colspan='2'><span class='heading'>
								<div>
									<span class='bold-text' title='Request Body'>BODY ${isModelBodyRequired ? '<span class="required-flag"> (Required)</span>' : ''}</span>
									<span class='model-label'>{ <a href='javascript:void(0)' id='model-link' title='View model definition'>${model || ''}</a> }</span>
								</div>
							</td>
                        </tr>
                        <tr class=''>
							<td colspan='2' class=''>
                                <div class='body-action-links'>
                                    <span class='body-action-label cursor-help'><a href='javascript:void(0)' id='copy-body' title='Copies request body to clipboard'>Copy &nbsp;</a></span>
                                    <span class='body-action-label cursor-help'><a href='javascript:void(0)' id='reset-body' title='Resets request body example'>Reset &nbsp;</a></span>
                                    <span class='body-action-label cursor-help'><a href='javascript:void(0)' id='prettify-body' title='Formats request body'>Prettify</a></span>
                                </div>
							</td>
						</tr>
						<tr class='textarea-tr'>
							<td colspan='2' class='request-body td-center'>
								<textarea id='request-body' class='monospace' rows='40' cols='100' data-isModelArrayOfItems='${isModelArrayOfItems}' data-model='${model}'>${requestBodyJson}</textarea>
							</td>
						</tr>
					`;
    } catch (err) {
        console.error(err);
        window.showErrorMessage(err);
    }

    return htmlContent;
}

/**
 * Generates a JSON example request body based on gived model
 * @param model Model for which JSON example body is to be generated
 */
export function requestBodyAsJson(model: string): string {
    let requestContent: string = '';
    let formattedJson: string = '';

    try {
        requestContent = requestJsonGenerator.convertSchemaToJson(model);
        formattedJson = JSON.stringify(requestContent, null, 2).trim();
    } catch (err) {
        console.error(err);
    }

    return formattedJson;
}
