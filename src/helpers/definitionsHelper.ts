import * as refParser from 'json-schema-ref-parser';
import { Uri, window, workspace } from 'vscode';
const compile = require('json-schema-to-typescript').compile;
import { generateDefinitionQuickPickItems } from '../providers/definitionsProvider';
import * as fs from 'fs';
import * as path from 'path';
import { readSwaggerJson } from '../util/swagger';

export async function generateTypeScriptModel() {
    // console.log(arguments[0]);
    let modelName: string = ``;
    try {
        if (arguments && arguments[0]) {
            modelName = arguments[0].label.trim();
        } else {
            const definitionQuickPickItems = generateDefinitionQuickPickItems();
            const pickedItem = await window.showQuickPick(definitionQuickPickItems, {
                placeHolder: `Select a model to generate a class or interface`
            });
            if (pickedItem) {
                modelName = pickedItem?.label;
            }
        }

        console.log(modelName);
        // Generate a TypeScript interface
        if (modelName) {
            const tsCompiled = await compileTSModel(modelName);
            if (tsCompiled) {
                // Ask where to save the file
                // fs.writeFileSync(path.join(__dirname, `../../temp/${modelName}.ts`), tsCompiled);
                const filename: string = `${modelName}.ts` || `untitled.ts`;

                const uri = await window.showSaveDialog({ defaultUri: Uri.file(filename) });
                if (uri) {
                    const filePath = uri.fsPath;
                    fs.writeFile(filePath, tsCompiled, async () => {
                        const val = await window.showInformationMessage(`File saved to: ${filePath}.`, { title: `Open` });
                        if (val?.title) {
                            const tsDocument = await workspace.openTextDocument(filePath);
                            await window.showTextDocument(tsDocument);
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error(error);
        window.showErrorMessage(error);
    }
}

async function compileTSModel(modelName: string) {
    try {
        console.log(`compileTSModel: ${modelName}`);

        const dereferencedSchema = await dereferenceSwaggerScehema();
        if (dereferencedSchema && dereferencedSchema.definitions) {
            const tsCompiled = await compile(dereferencedSchema.definitions[modelName], modelName, {
                bannerComment: `/*** Generated with Avalara AvaTax VS Code extension ***/`
            });

            if (tsCompiled) {
                return tsCompiled;
            }

            window.showErrorMessage(`sjk`);
        }
    } catch (error) {
        if (error.code === `EMISSINGPOINTER`) {
            window.showWarningMessage(`Class or Interface for this model can not be created. Details: ${error.message}`);
        }

        console.error(error);
    }
}

async function dereferenceSwaggerScehema() {
    // Reading swagger.json using fs module instead of importing like in other files.
    // Because dereferences schema was being loaded globally wherever swagger.json is imported.
    const swaggerJson: any = readSwaggerJson();

    const definitions: any = swaggerJson.definitions;
    try {
        let swaggerSchema: any = {
            definitions: definitions
        };
        const dereferencedSchema = await refParser.dereference(swaggerSchema, {
            dereference: {
                circular: 'ignore'
            }
        });
        return dereferencedSchema;
    } catch (error) {
        window.showErrorMessage(error);
        // console.error(error);
    }
}
