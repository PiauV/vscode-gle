import * as vscode from 'vscode';

export function QGLEcmd(): string {
    const path_from_settings = vscode.workspace.getConfiguration('gle').get<string>("pathToQGLE");
    const cmd = path_from_settings ? path_from_settings : "qgle";
    return cmd;
}

export function GLEcmd(): string {
    const path_from_settings = vscode.workspace.getConfiguration('gle').get<string>("pathToGLE");
    const cmd = path_from_settings ? path_from_settings : "gle";
    return cmd;
}

export function GLEoptions(): string[] {
    let options = vscode.workspace.getConfiguration('gle').get<string[]>("argsGLE");
    return options ? options : [];
}