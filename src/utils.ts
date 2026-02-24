import * as vscode from 'vscode';
import * as process from 'process';
import * as os from 'os'

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
    const options = vscode.workspace.getConfiguration('gle').get<string[]>("argsGLE");
    return options ? options : [];
}

/**
 * Get the include path(s) defined in the GLE_USRLIB environment variable
 * @returns Array of paths
 */
export function GLEinclude(): vscode.Uri[] {
    // console.log(process.env.GLE_USRLIB);
    // console.log(os.type());
    const gle_usrlib = process.env.GLE_USRLIB; // string or undefined
    let gle_usr_folders : string[];
    const paths : vscode.Uri[] = [];
    if (gle_usrlib){
        // GLE_USRLIB can be a single path, or a list of paths (separated by ';' on Windows / ':' on unix)
        if (os.type() == "Linux" || os.type() == "Darwin"){
            gle_usr_folders = gle_usrlib.split(':');
        }
        else{
            gle_usr_folders = gle_usrlib.split(';');
        }
        for (const folder of gle_usr_folders){
            paths.push(vscode.Uri.file(folder));
        }
    }
    return paths;
}
