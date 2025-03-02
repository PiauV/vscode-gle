import * as vscode from 'vscode';

export function QGLEcmd(): string {
    const path_from_settings = vscode.workspace.getConfiguration('gle').get<string>("pathToQGLE");
    const cmd = path_from_settings ? path_from_settings : "qgle";
    return cmd;
}
