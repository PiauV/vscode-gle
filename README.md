# vscode-gle: A VS Code extension for the GLE language

[GLE (Graphics Layout Engine)](https://glx.sourceforge.io/) is an application used to generate high-quality plots, figures and diagrams.

This extension provides language support for the GLE scripting language to [Visual Studio Code](https://code.visualstudio.com/).

## Features

### Declarative language features for GLE

 - **Syntax highlighting** 
    + based on TextMate grammar file for GLE\
      <img src="media/key.png" alt="key" width="45%"/>
    + 2 built-in themes (light and dark) based on standard vscode themes
 - **Folding** and **auto-indentation**
 - **Snippets**
    + `for` loop, `if` statement
    + `set` commands
    + subroutines
    + `begin` ... `end` blocks\
      <img src="media/snippet.png" alt="snippet" width="45%"/>

### Programmatic language features for GLE

#### Document link 

<img src="media/link.gif" alt="Link provider" width="35%"/>

Open external files called in the GLE script
 - include files (`include <filename>`)
 - data files (`data <filename> ...` or `colormap <filename> ...`)

#### Color decorator

<img src="media/colors.gif" alt="Color decorator" width="25%"/>

 - add a color decorator in front of color functions
   + `color rgb(r,g,b)`
   + `color rgba(r,g,b,a)`
   + `color <colorname>`
 - the color can be changed from vscode color picker

### (Q)GLE from the vscode editor


<img src="media/runner.png" alt="Status bar" width="25%"/>

The GLE script can be built from directly from vscode, using `Run GLE` button, or using right-click in the editor.\
The following command will be executed: `gle [options] <this_script.gle>`.\
Build options can be set in the `gle.argsGLE` [setting](#extension-settings).

It is also possible to preview the script with QGLE (GLE GUI), using `QGLE previewer` button, or using right-click in the editor or explorer.


## Extension Settings

This extension contributes the following settings:

 - General settings
    + `gle.includePath`: Set the absolute include path for GLE scripts (i.e., gleinc folder).
 - GLE settings
    + `gle.pathToGLE`: Set the path to the GLE application.
    + `gle.argsGLE`: Set the command-line options for running GLE (e.g., `["-d jpg", "-r 200"]`)
 - QGLE settings
    + `gle.activateQGLE`: Enable/disable call to QGLE previewer (disable it if QGLE is not installed).
    + `gle.pathToQGLE`: Set the path to the QGLE previewer.

Regarding the color decorators, you can use the following editor settings:

 - `editor.colorDecorators`: Enable/disable color decorators
 - `editor.colorDecoratorsActivatedOn`: Condition to make a color picker appear from a color decorator (click and/or hover)


## Issues

Please report issues and feature requests on the [GitHub page](https://github.com/PiauV/vscode-gle/issues).

## Release Notes

See the CHANGELOG for a complete list of changes.

### 0.3.0 [preview]

Initial release of vscode-gle extension

