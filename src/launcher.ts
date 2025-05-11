import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { GLEcmd, GLEoptions, QGLEcmd } from './utils';
import { Logger } from './logger';

export class GLElauncher {
    private gle_logger: Logger; // GLE output channel

    public constructor(logger: Logger) {
        this.gle_logger = logger;
        this.runGLE = this.runGLE.bind(this);
    }

    public runQGLE(uri: vscode.Uri | undefined) {
        /**
         * Start QGLE previewer
         */
        // if this function is called from the status bar, uri is undefined. In that case, use filename from active document
        const filename = uri ? uri.fsPath : (vscode.window.activeTextEditor?.document.fileName ?? "");
        if (filename.endsWith(".gle")) {
            const cmd = QGLEcmd();
            // asynchronous process
            const qgle = cp.spawn(cmd, [filename], { cwd: path.dirname(filename) });
            qgle.on('error', (err) => {
                vscode.window.showErrorMessage("Failed to start QGLE (settings.json > gle.pathToQGLE)");
                console.log(err.message);
                console.log(`Path to QGLE: ${cmd}`);
            });
        }
        else {
            vscode.window.showErrorMessage("This file is not a GLE script");
        }
    }

    public runGLE() {
        /**
         * Build GLE script
         */
        const doc = vscode.window.activeTextEditor?.document;
        if (!doc) return;
        const filename = doc.fileName;
        // console.log(filename);
        if (filename.endsWith(".gle")) {
            //! for the following to work properly, runGLE() needs to be binded to 'this' (see constructor)
            doc.save().then(() => this.drawGLE(filename));
        }
        else {
            vscode.window.showErrorMessage("Current file is not a GLE script");
        }
    }

    private drawGLE(file: string) {
        /**
         * Run GLE and print output in vscode
         */
        this.gle_logger.RestartLog();
        const filename = vscode.workspace.asRelativePath(file);
        this.gle_logger.message(`-- [${new Date().toLocaleTimeString(undefined, { hour12: false })}] Drawing GLE script ${filename} --\n`);
        const cmd = GLEcmd();
        const args = GLEoptions();
        args.push(file);
        // synchronous process ==> pause the execution of the code until the spawned process exits (end of build or error)
        const gle_build = cp.spawnSync(cmd, args, { cwd: path.dirname(file), shell: true });
        if (gle_build.error) {
            vscode.window.showErrorMessage("Failed to start GLE (settings.json > gle.pathToGLE)");
            console.log(gle_build.error.message);
            console.log(`Path to GLE: ${cmd}`);
        }
        let output = "";
        // for some reason stdout is empty, all GLE output goes to stderr
        // but in case this behaviour changes, look at both streams
        if (gle_build.stdout.byteLength) {
            output += gle_build.stdout.toString();
            // console.log(gle_build.stdout.toString());
        }
        if (gle_build.stderr.byteLength) {
            output += gle_build.stderr.toString();
        }
        this.gle_logger.message(output);
        if (gle_build.status !== null && gle_build.status == 0) {
            vscode.window.showInformationMessage(`${this.parseOutput(output)} was built successfully from ${filename}`);
        }
        else {
            // console.log(`status: ${gle_build.status}`);
            const info = this.parseError(output);
            if (info) {
                this.gle_logger.message(`\n-- Jump to error: ${file}:${info[0]}:${info[1]}`);
                vscode.window.showErrorMessage(`Error found when running GLE (${filename})`);
            }
            else {
                vscode.window.showErrorMessage("Error found when running GLE (settings.json > gle.argsGLE)");
            }
        }
    }

    private parseError(msg: string): number[] | undefined {
        /**
         * Parse error message from GLE
         */
        const lines = msg.split('\n');
        const pattern = "^>>\\s+(\\w+.gle)\\s+\\((\\d+)\\)\\s+(\\|\\w).+\\|\\s+$"
        for (let i = 1; i < lines.length; i++) {
            const err = lines[i];
            if (err.length < 3) continue;
            const found = err.match(pattern);
            if (found) {
                // errblock[1] is the filename --> not used for now
                const line_number = +found[2];
                const start = err.indexOf(found[3]); // start of the line
                if (i + 1 < lines.length) {
                    const col_number = lines[i + 1].indexOf('^') - start;
                    return [line_number, col_number]
                }
                // TODO: diagnostics ? (main issue will be : how/when to clear them)
            }
            // else{
            //     // TODO: compare error with args from settings ?
            //     // TODO: diagnostics in settings.json ?
            // }
        }
    }

    private parseOutput(msg: string): string {
        /**
         * Parse GLE output string to extract the name of the output file
         */
        const pattern = "\\[(\\w+)\\](?:\\[(\\.[a-z]+)\\])+";
        const found = msg.match(pattern);
        if (found) {
            return found[1] + found[2];
        }
        return "";
    }
}
