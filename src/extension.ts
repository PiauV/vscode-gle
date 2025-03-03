import * as vscode from 'vscode';
import { LinkToFilesProvider } from './linkProvider';
import { GLEColorProvider } from './colorProvider';
import { GLElauncher } from './launcher'

let statusBarItemGLE: vscode.StatusBarItem;
let statusBarItemQGLE: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	// Link provider
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider('gle', new LinkToFilesProvider())
	);

	// Color decorator
	context.subscriptions.push(
		vscode.languages.registerColorProvider('gle', new GLEColorProvider())
	);

	// Commands
	let launcher = new GLElauncher();
	const commandGLE = 'gle.drawGLE';
	const commandQGLE = 'gle.previewQGLE';
	context.subscriptions.push(
		vscode.commands.registerCommand(commandGLE, launcher.runGLE),
		vscode.commands.registerCommand(commandQGLE, launcher.runQGLE)
	);
	context.subscriptions.push(
		launcher.getLogger()
	);

	// Status bar
	statusBarItemGLE = vscode.window.createStatusBarItem('item_gle', vscode.StatusBarAlignment.Left);
	statusBarItemGLE.text = `$(run) Run GLE`
	statusBarItemGLE.command = commandGLE;
	statusBarItemGLE.tooltip = "Draw current script with GLE";

	statusBarItemQGLE = vscode.window.createStatusBarItem('item_qgle', vscode.StatusBarAlignment.Left);
	statusBarItemQGLE.text = `$(link-external) QGLE previewer`
	statusBarItemQGLE.command = commandQGLE;
	statusBarItemQGLE.tooltip = "Open preview with QGLE (external window)";

	context.subscriptions.push(
		statusBarItemGLE,
		statusBarItemQGLE
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItems)
	);

	updateStatusBarItems();

	// console.log('The extension is now active');
}

function updateStatusBarItems(): void {
	/**
	 * Show/hide GLE and QGLE items in the status bar
	 */
	const documentFileType = vscode.window.activeTextEditor?.document.languageId;
	if (documentFileType == "gle") {
		// this is a GLE script
		statusBarItemGLE.show();
		if (vscode.workspace.getConfiguration('gle').get<boolean>("activateQGLE")) {
			statusBarItemQGLE.show();
		}
		else {
			// do not show QGLE item if QGLE is deactivated
			statusBarItemQGLE.hide();
		}
	}
	else {
		// this is not a GLE script -> hide items
		statusBarItemGLE.hide();
		statusBarItemQGLE.hide();
	}
}