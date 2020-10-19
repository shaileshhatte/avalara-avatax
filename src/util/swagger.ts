import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';

// Import swagger.json so that it is parsed and is available in out folder
import * as swaggerFile from '../data/swagger.json';

export function readSwaggerJson() {
    try {
        const sw = swaggerFile;
        const swaggerJson: any = fs.readFileSync(path.join(__dirname, `../data/swagger.json`), {
            encoding: `utf-8`
        });

        return JSON.parse(swaggerJson);
    } catch (error) {
        console.error(error);
        window.showErrorMessage(error);
    }
}
