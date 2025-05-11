import * as vscode from 'vscode';
import { LinkToFilesProvider } from './linkProvider';
import { GLEColorProvider } from './colorProvider';
import { Logger } from './logger';
import { GLElauncher } from './launcher';
import { GLEcmd } from "./utils";
import * as cp from 'child_process';

let statusBarItemGLE: vscode.StatusBarItem;
let statusBarItemQGLE: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

	const logger = new Logger;
	context.subscriptions.push(logger);

	console.log(`GLE extension is now active\nCurrent path to GLE: ${GLEcmd()}`);
	const gle = cp.spawnSync(GLEcmd());
	if (gle.error) {
		console.error("Did not find GLE");
		logger.message("WARNING - Did not find GLE (see 'gle.pathToGLE' setting)");
	}
	else {
		const output_gle = gle.stderr.toString();
		const l1 = output_gle.indexOf('\n');
		logger.message("Found GLE - " + output_gle.substring(0, l1));
	}
	logger.show();

	// Link provider
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'gle' }, new LinkToFilesProvider())
	);

	// Color decorator
	context.subscriptions.push(
		vscode.languages.registerColorProvider('gle', new GLEColorProvider())
	);

	// Commands
	const launcher = new GLElauncher(logger);
	const commandGLE = 'gle.drawGLE';
	const commandQGLE = 'gle.previewQGLE';
	context.subscriptions.push(
		vscode.commands.registerCommand(commandGLE, launcher.runGLE),
		vscode.commands.registerCommand(commandQGLE, launcher.runQGLE)
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