import * as vscode from 'vscode';

export class LinkToFilesProvider implements vscode.DocumentLinkProvider {
	/**
	 * Provide links to files referenced in the GLE script.
	 * These files can be include files containing subroutines, or data files.
	 * The path to these files is supposed to be relative to the GLE script's folder.
	 * If a file cannot be found, an error is issued ('diagnostic').
	 */

	fileDiagnostics = vscode.languages.createDiagnosticCollection("files"); // file(s) not found

	public async provideDocumentLinks(document: vscode.TextDocument): Promise<vscode.DocumentLink[]> {
		// console.log("provideDocumentLinks");

		const output: vscode.DocumentLink[] = []; // initialize list of file links
		const diagnostics: vscode.Diagnostic[] = []; // initialize list of errors

		const pattern = "^\\s*(include|data|colormap)\\s+\"(\\w+\\.[a-zA-Z0-9]+)(?=\")";
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
				try {
					await vscode.workspace.fs.stat(file);
					output.push(new vscode.DocumentLink(range, file)); // found file
				} catch {
					// file not found
					try {
						if (found[1] == "include") {
							const include_path = vscode.workspace.getConfiguration('gle').get<string>("includePath");
							// console.log(include_path);
							if (include_path) {
								const file2 = vscode.Uri.joinPath(vscode.Uri.file(include_path), filename); // path
								await vscode.workspace.fs.stat(file2);
								output.push(new vscode.DocumentLink(range, file2)); // found file
							}
							else {
								diagnostics.push(new vscode.Diagnostic(range, `File ${filename} not found - try to set the include path (gleinc) in settings.json`, vscode.DiagnosticSeverity.Warning));
							}
						}
						else {
							throw "not found";
						}
					}
					catch {
						diagnostics.push(new vscode.Diagnostic(range, `File ${filename} not found`, vscode.DiagnosticSeverity.Error));
					}
				}
			}
		}
		this.fileDiagnostics.set(doc_uri, diagnostics);
		return output;
	}
}