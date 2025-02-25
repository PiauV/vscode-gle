import * as vscode from 'vscode';
import { LinkToFilesProvider } from './linkProvider';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider('gle', new LinkToFilesProvider())
	);
	// console.log('The extension is now active');
}
