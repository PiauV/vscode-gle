import * as vscode from 'vscode';
import { GLEinclude } from './utils';

/** Provide links to files referenced in the GLE script */
// These files can be include files containing subroutines, or data files.
// The path to these files is supposed to be relative to the GLE script's folder.
// If a file cannot be found, an error is issued ('diagnostic').
export class LinkToFilesProvider implements vscode.DocumentLinkProvider {
	private usr_include_paths: vscode.Uri[]; // include paths from GLE_USRLIB

	public constructor() {
		this.usr_include_paths = GLEinclude();
	}

	fileDiagnostics = vscode.languages.createDiagnosticCollection("files"); // file(s) not found

	public async provideDocumentLinks(document: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
		// console.log("provideDocumentLinks");

		const output: vscode.DocumentLink[] = []; // initialize list of file links
		const diagnostics: vscode.Diagnostic[] = []; // initialize list of errors

		const pattern = "^\\s*(include|data|colormap)\\s+\"((?:.+\\/)*\\w+\\.[a-zA-Z0-9]+)(?=\")";
		const doc_uri = document.uri; // path of the GLE script
		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) { // parse the whole document
			const line = document.lineAt(lineIndex);
			// find name of external files : include/data/colormap "filename"
			const found = line.text.match(pattern);
			if (found != null) {
				const filename = found[2];
				// console.log(filename);
				const range = new vscode.Range(
					new vscode.Position(lineIndex, line.text.indexOf(filename)),
					new vscode.Position(lineIndex, line.text.indexOf(filename) + filename.length)
				);
				const file = vscode.Uri.joinPath(doc_uri, '../' + filename); // path relative to the folder containing the document
				// console.log(file.path);
				let found_file = false;
				if (await fileExists(file)){
					output.push(new vscode.DocumentLink(range, file));
					found_file = true;
				}
				else if (found[1] == "include"){
					// include file : there might be additional directory to explore
					const include_path = vscode.workspace.getConfiguration('gle').get<string>("includePath");
					if (include_path){
						// first, look for this file in gleinc folder (standard subroutine directory)
						const file2 = vscode.Uri.joinPath(vscode.Uri.file(include_path), filename); // path
						// console.log(file2);
						if (await fileExists(file2)){
							output.push(new vscode.DocumentLink(range, file2));
							found_file = true;
						}
					}
					if (!found_file){
						// look for this file in additional folders (user-defined directories from GLE_USRLIB)
						for (const path of this.usr_include_paths){
							const file2 = vscode.Uri.joinPath(path, filename);
							// console.log(file2);
							if (await fileExists(file2)){
								output.push(new vscode.DocumentLink(range, file2));
								found_file = true;
								break;
							}
						}
					}
					// failed to find the file in other directories
					if (!found_file)
						diagnostics.push(new vscode.Diagnostic(range, `Include file ${filename} not found - try to set the include path (gleinc) in settings.json`, vscode.DiagnosticSeverity.Error));
				}
				else
					diagnostics.push(new vscode.Diagnostic(range, `Data file ${filename} not found`, vscode.DiagnosticSeverity.Error));
			}
		}
		this.fileDiagnostics.set(doc_uri, diagnostics);
		return output;
	}
}

/** Check if the given file exists */
async function fileExists(filepath : vscode.Uri) {
  try {
    await vscode.workspace.fs.stat(filepath);
    return true;
  } catch {
    return false;
  }
}