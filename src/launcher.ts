import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { GLEcmd, QGLEcmd } from "./utils";

export class GLElauncher {
    public runQGLE(uri: vscode.Uri) {
        /**
         * Start QGLE previewer
         */
        const filename = uri.fsPath;
        if (filename.endsWith(".gle")) {
            const cmd = QGLEcmd();
            // asynchronous process
            const qgle = cp.spawn(cmd, [filename], { cwd: path.dirname(filename) });
            qgle.on('error', (err) => {
                vscode.window.showErrorMessage("Failed to start QGLE");
                console.log(err.message);
                console.log(`Path to QGLE: ${cmd}`);
            });
        }
        else {
            vscode.window.showErrorMessage("This file is not a GLE script");
        }
    }
}
