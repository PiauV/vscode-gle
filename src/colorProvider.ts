import * as vscode from 'vscode';
import { colors } from './colors';

/** Provide color decorator in the GLE script */
// Triggered after 'color' and 'fill' keywords.
// Supports named colors (blue, red, ...), hex-values color (0xffffff) and rgb/rgba/rgb255/rgba255 functions.
// Can provide error (diagnostics) in some cases (e.g., unknown color name).
export class GLEColorProvider implements vscode.DocumentColorProvider {

    colorDiagnostics = vscode.languages.createDiagnosticCollection("color");

    public provideDocumentColors(document: vscode.TextDocument): vscode.ColorInformation[] {
        /** Generate color decorator + color picker */
        // console.log("provideDocumentColors");

        const output: vscode.ColorInformation[] = []; // initialize list of colors
        const diagnostics: vscode.Diagnostic[] = []; // initialize list of errors

        const pattern_color = /\b(m?color|fill|background|side)\b/g;
        const pattern_rgb = "(rgba?(?:255)?)\\((\\s*\\d+(?:\\.\\d*)?\\s*(?:,\\s*\\d+(?:\\.\\d*)?\\s*){2,3})\\)";
        const pattern_hex = "(#[0-9a-fA-F]{6})";
        const pattern_name = "\\b([a-z]+)(?!\\()\\b";

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex).text;
            const found_color = line.match(pattern_color);
            if (found_color == null) continue;
            if (isInComment(line, line.indexOf(found_color[0]))) continue;
            if (isInString(line, line.indexOf(found_color[0]))) continue;
            // in principe, a color is expected at the current line
            const is_bar_cmd = (line.match(/^\s*bar/) != null);
            for (let colorIndex = 0; colorIndex < found_color.length; colorIndex++){
                const colorCmd = found_color[colorIndex];
                const pos = line.indexOf(colorCmd) + colorCmd.length;
                const next = colorIndex+1 < found_color.length ? line.indexOf(found_color[colorIndex+1]) : line.length;
                let pattern_prefix = "(?<=\\b" + colorCmd + "\\b\\s+)";
                if (is_bar_cmd) pattern_prefix = "(?<=\\b" + colorCmd + "\\b\\s+|,\\s*)"; // bar command : color list
                let found = false;
                const matches_hex = line.matchAll(RegExp(pattern_prefix + pattern_hex,"g"));
                for (const match of matches_hex) {
                    const expr = match[0];
                    const mpos = match.index;
                    if (mpos < pos || mpos > next) continue; // not a valid match
                    if (isInComment(line, mpos)) continue;
                    if (isInString(line, mpos)) continue;
                    //console.log(expr);
                    const range = new vscode.Range(
                        new vscode.Position(lineIndex, mpos),
                        new vscode.Position(lineIndex, mpos + expr.length)
                    );
                    const rgb : number[] = [0.,0.,0.];
                    for (let i=0; i<3; i++) rgb[i] = parseInt('0x' +expr.slice(1+i*2,3+i*2),16) / 255.;
                    const color = new vscode.Color(rgb[0], rgb[1], rgb[2], 1.);
                    output.push(new vscode.ColorInformation(range, color));
                    found = true;
                }
                if (found && !is_bar_cmd) continue;
                const matches_colorname = line.matchAll(RegExp(pattern_prefix + pattern_name,"g"));
                for (const match of matches_colorname) {
                    const colorname = match[0];
                    const mpos = match.index;
                    if (mpos < pos || mpos > next) continue; // not a valid match
                    if (isInComment(line, mpos)) continue;
                    if (isInString(line, mpos)) continue;
                    //console.log(colorname);                    
                    const range = new vscode.Range(
                        new vscode.Position(lineIndex, line.indexOf(colorname,pos)),
                        new vscode.Position(lineIndex, line.indexOf(colorname,pos) + colorname.length)
                    );
                    const rgb = colors[colorname];
                    if (rgb) {
                        const color = new vscode.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1);
                        output.push(new vscode.ColorInformation(range, color));
                    }
                    else {
                        diagnostics.push(new vscode.Diagnostic(range, "Unknown color name", vscode.DiagnosticSeverity.Warning));
                    }
                    found = true;
                }
                if (found && !is_bar_cmd) continue;
                const matches_rgb = line.matchAll(RegExp(pattern_prefix + pattern_rgb,"g"));
                for (const match of matches_rgb) {
                    const expr = match[0];
                    const mpos = match.index;
                    if (mpos < pos || mpos > next) continue; // not a valid match
                    if (isInComment(line, mpos)) continue;
                    if (isInString(line, mpos)) continue;
                    //console.log(expr);
                    const range = new vscode.Range(
                        new vscode.Position(lineIndex, mpos),
                        new vscode.Position(lineIndex, mpos + expr.length)
                    );
                    const func = match[1]; // function name
                    let divisor = 1.;
                    if (func.endsWith("255")) divisor = 255.; // rgb255 / rgba255
                    const rgba = match[2].split(',').map((x) => +x / divisor); // parameters
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
            }
        }
        this.colorDiagnostics.set(document.uri, diagnostics);
        return output;
    }

    public provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }): vscode.ColorPresentation[] {
        /** Updates color after changing it with the color picker */
        const colString = context.document.getText(context.range);

        if (colString.startsWith("rgb255(") || colString.startsWith("rgba255(") || colString.startsWith('#')) {
            // rgb255/rgba255 functions -> RGB(A) values are integers in the range [0,255]
            // hex-value -> 6-digits format with hexadecimal RGB values in the range [00,ff]
            const r = Math.round(color.red * 255);
            const g = Math.round(color.green * 255);
            const b = Math.round(color.blue * 255);
            const a = Math.round(color.alpha * 255);
            return [
                new vscode.ColorPresentation(`rgb255(${r}, ${g}, ${b})`),
                new vscode.ColorPresentation(`rgba255(${r}, ${g}, ${b}, ${a})`),
                new vscode.ColorPresentation('#'
                    +Number(r).toString(16).padStart(2,'0')
                    +Number(g).toString(16).padStart(2,'0')
                    +Number(b).toString(16).padStart(2,'0')
                ),
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

/* Check if the given position belongs to a comment */
function isInComment(linestr : string, pos : number) {
    if (pos == -1) return false;
    let pc = linestr.indexOf('!');
    while (isInString(linestr, pc)) pc = linestr.indexOf('!', pc + 1);
    if (pc == -1) return false;
    else if (pc < pos) return true;
    return false;
}

/* Check if the given position belongs to a string */
function isInString(linestr : string, pos : number) {
    if (pos == -1) return false;
    let open = linestr.indexOf('"');
    while (open > 0){
        const close = linestr.indexOf('"',open+1);
        if (pos > open && pos < close) return true;
        open = linestr.indexOf('"', close+1);
    }
    return false
}
