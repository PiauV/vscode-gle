import * as vscode from 'vscode';
import { colors } from './colors';

export class GLEColorProvider implements vscode.DocumentColorProvider {
    /**
     * Provide color decorator in the GLE script.
     * Triggered after 'color' and 'fill' keywords.
     * Supports named colors (blue, red, ...) and rgb/rgba/rgb255/rgba255 functions.
     * Can provide error (diagnostics) in some cases (e.g., unknown color name).
     */

    colorDiagnostics = vscode.languages.createDiagnosticCollection("color");

    public provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
        /** Generate color decorator + color picker */
        // console.log("provideDocumentColors");

        const output: vscode.ColorInformation[] = []; // initialize list of colors
        const diagnostics: vscode.Diagnostic[] = []; // initialize list of errors

        const pattern_rgb = "(?<=\\b(?:color|fill|background)\\b\\s+)(rgba?(?:255)?)\\((\\s*\\d+(?:\\.\\d*)?\\s*(?:,\\s*\\d+(?:\\.\\d*)?\\s*){2,3})\\)";
        const pattern_name = "(?<=\\b(?:color|fill|background)\\b\\s+)\\b(\\w+)\\b";
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const found_rgb_code = line.text.match(pattern_rgb);
            if (found_rgb_code != null) {
                const expr = found_rgb_code[0];
                // console.log(expr);
                const range = new vscode.Range(
                    new vscode.Position(lineIndex, line.text.indexOf(expr)),
                    new vscode.Position(lineIndex, line.text.indexOf(expr) + expr.length)
                );
                const func = found_rgb_code[1]; // function name
                let divisor = 1.;
                if (func.endsWith("255")) divisor = 255.; // rgb255 / rgba255
                const rgba = found_rgb_code[2].split(',').map((x) => +x / divisor); // parameters
                if (func.indexOf('a') > 0) {
                    // rgba / rgba255 ==> we expect 4 parameters (r,g,b,a)
                    if (rgba.length !== 4) {
                        diagnostics.push(new vscode.Diagnostic(range, "This color function needs 4 parameters", vscode.DiagnosticSeverity.Error));
                        continue;
                    }
                }
                else {
                    // rgb / rgb255 ==> we expect 3 parameters (r,g,b)
                    if (rgba.length !== 3) {
                        diagnostics.push(new vscode.Diagnostic(range, "This color function only takes 3 parameters", vscode.DiagnosticSeverity.Error));
                        continue;
                    }
                    rgba.push(1.); // opacity set to 1
                }
                // console.log("rgba: %d %d %d %d", rgba[0], rgba[1], rgba[2], rgba[3]);
                const color = new vscode.Color(rgba[0], rgba[1], rgba[2], rgba[3]);
                output.push(new vscode.ColorInformation(range, color));
            }
            else {
                const found_colorname = line.text.match(pattern_name);
                if (found_colorname != null) {
                    const colorname = found_colorname[0];
                    // console.log(colorname);
                    const range = new vscode.Range(
                        new vscode.Position(lineIndex, line.text.indexOf(colorname)),
                        new vscode.Position(lineIndex, line.text.indexOf(colorname) + colorname.length)
                    );
                    const rgb = colors[colorname];
                    if (rgb) {
                        const color = new vscode.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1);
                        output.push(new vscode.ColorInformation(range, color));
                    }
                    else {
                        diagnostics.push(new vscode.Diagnostic(range, "Unknown color name", vscode.DiagnosticSeverity.Warning));
                    }
                }
            }
        }
        this.colorDiagnostics.set(document.uri, diagnostics);
        return output;
    }

    public provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }): vscode.ColorPresentation[] {
        /** Updates color after changing it with the color picker */
        const colString = context.document.getText(context.range);

        if (colString.startsWith("rgb255(") || colString.startsWith("rgba255(")) {
            // rgb255/rgba255 functions -> RGB(A) values are integers in the range [0,255]
            const r = Math.round(color.red * 255);
            const g = Math.round(color.green * 255);
            const b = Math.round(color.blue * 255);
            const a = Math.round(color.alpha * 255);
            return [
                new vscode.ColorPresentation(`rgb255(${r}, ${g}, ${b})`),
                new vscode.ColorPresentation(`rgba255(${r}, ${g}, ${b}, ${a})`),
            ];
        }
        else {
            // default is rgb/rgba functions -> RGB(A) values are floats in the range [0,1]
            // the floating point precision is set to 2
            const r = color.red.toFixed(2);
            const g = color.green.toFixed(2);
            const b = color.blue.toFixed(2);
            const a = color.alpha.toFixed(2);
            return [
                new vscode.ColorPresentation(`rgb(${r}, ${g}, ${b})`),
                new vscode.ColorPresentation(`rgba(${r}, ${g}, ${b}, ${a})`)
            ];
        }
    }
}
