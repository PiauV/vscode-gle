import * as vscode from 'vscode';
import { LinkToFilesProvider } from './linkProvider';
import { GLEColorProvider } from './colorProvider';
import { GLElauncher } from './launcher'

export function activate(context: vscode.ExtensionContext) {
	let launcher = new GLElauncher();

	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider('gle', new LinkToFilesProvider())
	);

	context.subscriptions.push(
		vscode.languages.registerColorProvider('gle', new GLEColorProvider())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gle.previewQGLE', launcher.runQGLE),
		vscode.commands.registerCommand('gle.drawGLE', launcher.runGLE)
	);

	// console.log('The extension is now active');
}
