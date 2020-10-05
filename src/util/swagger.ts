import * as fs from 'fs';
import * as path from 'path';
import { window } from 'vscode';

export function readSwaggerJson() {
    try {
        const swaggerJson: any = fs.readFileSync(path.join(__dirname, `../data/swagger.json`), {
            encoding: `utf-8`
        });

        return JSON.parse(swaggerJson);
    } catch (error) {
        console.error(error);
        window.showErrorMessage(error);
    }
}
