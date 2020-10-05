import { window } from 'vscode';
import { readSwaggerJson } from '../util/swagger';
// import * as swaggerJson from '../data/swagger.json';
const swaggerJson: any = readSwaggerJson();

const definitions: any = swaggerJson.definitions;

/**
 * Returns/converts schema to JSON string
 * @param model Model to be converted to JSON example
 * @param generateFullModelExample If set to true, full model example is returned
 * @param onlyModel If set to true, only model definition is returned
 */
export function convertSchemaToJson(model: string, generateFullModelExample?: boolean, onlyModel?: boolean): any {
    const schemaModel = definitions[model];

    if (onlyModel) {
        return schemaModel;
    }

    let jsonObject: any = {};

    try {
        if (!!schemaModel.example && !generateFullModelExample) {
            return schemaModel.example;
        }

        const propertiesObject: any = schemaModel.properties || null;
        if (propertiesObject !== null) {
            const props: string[] = Object.keys(propertiesObject);
            props.forEach((propKey) => {
                const propObject: any = propertiesObject[propKey];

                if (!!propObject.example) {
                    jsonObject[propKey] = propObject.example;
                } else if (!!propObject.type) {
                    switch (propObject.type) {
                        case 'string':
                            if (!!propObject.enum) {
                                let possibleValues = propObject.enum;
                                jsonObject[propKey] = possibleValues[getRandomArbitraryNumber(0, possibleValues.length)];
                            } else {
                                jsonObject[propKey] = generateRandomString(15);
                            }

                            break;

                        case 'number':
                            jsonObject[propKey] = getRandomArbitraryNumber(1, 10);
                            break;

                        case 'array':
                            let refArr = propObject.items['$ref'].split('/');
                            let innerModel = refArr[refArr.length - 1];
                            let items: any[] = [];
                            items.push(convertSchemaToJson(innerModel), generateFullModelExample);
                            jsonObject[propKey] = items;
                            break;

                        case 'boolean':
                            jsonObject[propKey] = false;
                            break;

                        case 'null':
                            jsonObject[propKey] = null;
                            break;

                        case 'object':
                            jsonObject[propKey] = {};
                            break;

                        default:
                            jsonObject[propKey] = {};
                            break;
                    }
                } else if (propObject['$ref']) {
                    let refArr = propObject['$ref'].split('/');
                    let innerModel = refArr[refArr.length - 1];

                    jsonObject[propKey] = convertSchemaToJson(innerModel, generateFullModelExample);
                }
            });
        }
    } catch (err) {
        console.error(err);
        window.showErrorMessage(err);
    }

    return jsonObject;
}

/**
 * Generates a random alphanumeric string of given length.
 * @param length Length of the string
 */
function generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Returns a random number between min (inclusive) and max (exclusive).
 * @param min Range minimum (inclusive)
 * @param max range maximum (exclusive)
 */
function getRandomArbitraryNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}
