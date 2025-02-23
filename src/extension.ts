import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider('gle', new LinkToFilesProvider())
	);
	// console.log('The extension is now active');
}


export class LinkToFilesProvider implements vscode.DocumentLinkProvider {
	/**
	 * Provide links to files referenced in the GLE script.
	 * These files can be include files containing subroutines, or data files.
	 * The path to these files is supposed to be relative to the GLE script's folder.
	 * If a file cannot be found, an error is issued ('diagnostic').
	 */

	fileDiagnostics = vscode.languages.createDiagnosticCollection("files"); // file(s) not found

	public async provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.DocumentLink[]> {
		// console.log("provideDocumentLinks");

		let output: vscode.DocumentLink[] = []; // initialize list of file links
		const diagnostics: vscode.Diagnostic[] = []; // initialize list of errors

		const doc_uri = document.uri; // path of the GLE script
		for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) { // parse the whole document
			const line = document.lineAt(lineIndex);
			// find name of external files : include/data/colormap "filename"
			let found = line.text.match("(?<=^\\s*(data|include|colormap)\\s+\")(\\w+\.[a-zA-Z0-9]+)(?=\")");
			if (found != null) {
				let filename = found[0];
				// console.log(filename);
				let range = new vscode.Range(
					new vscode.Position(lineIndex, line.text.indexOf(filename)),
					new vscode.Position(lineIndex, line.text.indexOf(filename) + filename.length)
				);
				let file = vscode.Uri.joinPath(doc_uri, '../' + filename); // path relative to the folder containing the document
				// console.log(file.path);
				try {
					await vscode.workspace.fs.stat(file);
					output.push(new vscode.DocumentLink(range, file)); // found file
				} catch {
					// file not found
					diagnostics.push(new vscode.Diagnostic(range, `File ${filename} not found`, vscode.DiagnosticSeverity.Error));
				}
			}
		}
		this.fileDiagnostics.set(doc_uri, diagnostics);
		return output;
	}
}