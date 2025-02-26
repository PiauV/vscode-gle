import * as vscode from 'vscode';

export function launchQGLE(uri: vscode.Uri) {
    const full_path = vscode.workspace.getConfiguration('gle').get<string>("pathToQGLE");
    const command = full_path ? full_path : "qgle";
    const filename = uri.fsPath;
    if (filename.endsWith(".gle")) {
        vscode.window.createTerminal({
            name: "QGLE",
            shellPath: command,
            shellArgs: filename,
            hideFromUser: true
        });
    }
    else {
        vscode.window.showErrorMessage("This is not a GLE script");
    }
}
