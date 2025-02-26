import * as vscode from 'vscode';
import { LinkToFilesProvider } from './linkProvider';
import { GLEColorProvider } from './colorProvider';
import { launchQGLE } from './utils';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider('gle', new LinkToFilesProvider())
	);

	context.subscriptions.push(
		vscode.languages.registerColorProvider('gle', new GLEColorProvider())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.launchQGLE', launchQGLE)
	);

	// console.log('The extension is now active');
}
