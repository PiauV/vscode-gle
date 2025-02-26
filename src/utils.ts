import * as vscode from 'vscode';

export function launchQGLE() {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor) {
        const docUri = textEditor.document.uri;
        const filename = docUri.fsPath;
        if (filename.endsWith(".gle")) {
            vscode.window.createTerminal({
                name: "QGLE",
                shellPath: "qgle",
                shellArgs: filename,
                hideFromUser: true
            });
        }
        else {
            vscode.window.showErrorMessage("This is not a GLE script");
        }
    }
    else {
        vscode.window.showErrorMessage("No editor is open");
    }
}
