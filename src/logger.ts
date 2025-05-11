import * as vscode from 'vscode';

export class Logger {
    /**
     * Dedicated vscode Output channel to print GLE output
     */
    private logPanel: vscode.OutputChannel

    constructor() {
        this.logPanel = vscode.window.createOutputChannel('GLE')
    }

    message(message: string) {
        this.logPanel.append(`${message}`)
    }

    show() {
        this.logPanel.show(true)
    }

    RestartLog() {
        this.logPanel.clear();
        this.logPanel.show(true)
    }

    dispose() {
        this.logPanel.dispose();
    }
}