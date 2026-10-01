# Change Log

All notable changes to the `vscode-gle` extension will be documented in this file.

## [0.3.6] - 2026-10-02

- Improvements of syntax highlighting (numbers in scientific notation, 'on/off' keywords, ...)
- Fixed : closing a file clears the associated diagnostics
- Fixed : remove spurious spaces inside rgb() functions

## [0.3.5] - 2026-02-24

- Improvements of color provider (handles comments & string, list of colors, multiple color definitions)

## [0.3.4] - 2026-01-29

- Minor fix in link provider : absolute path was not handled correctly

## [0.3.3] - 2025-09-09

- Color decorator : add support for hex-value color format
- Link provider update : add link include files located in a path defined by the GLE_USRLIB environment variable

## [0.3.2] - 2025-08-21

- Minor update in README and package.json
- GLE launcher fix : escape file path (mikez)

## [0.3.1] - 2025-05-11

- Link provider fix : add support for relative file paths
- Print GLE version

## [0.3.0] - 2025-03-20

- Initial release
- See the [README](https://github.com/PiauV/vscode-gle/blob/main/README.md) for more information about the extension
