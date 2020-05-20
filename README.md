# common-typo-detector
[![MIT licensed](https://img.shields.io/badge/license-ISC-blue.svg)]()
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg)]()


CLI tool to detect common misspellings in text/code files. Uses a blacklist of common
typos for detection (the opposite way a normal spell checker would) so
that it can work with minimum false positives when analyzing code. Therefore
this tool merely tries to detect some really obvious mistakes.

Comes with some preset lists of common misspellings, but allows specifying
an external file as a source.

## Install

Install it globally with with NPM:
`npm install -g common-typo-detector`

## Usage

`common-typo-detector <files...>`

Use `--preset pt` to use the Portuguese preset.

Use `--typos <json file>` to specify an external list of typos. The english
preset is used by default.

Both `--preset` and `--typos` can be used in the same command to merge both
lists.

## Development

[![js-semistandard-style](https://cdn.rawgit.com/flet/semistandard/master/badge.svg)](https://github.com/Flet/semistandard)

This tool was created to solve a problem I was personally having, but I'm
open to ideas and pull requests.

The current presets were initially taken from Wikipedia, but will probably be
shorten in the future since the idea is to avoid false positives as much as
possible even when analyzing code.

### Code of Conduct

Note that this project is released with a Contributor Code of Conduct.
By participating in this project you agree to abide by its terms.

## TODO

* add parameter to only check lines that are comments (start with //,*,#, etc)

* Organize functions into a lib.js file

* unit tests

* implement excludes patterns for files as a CLI parameter

## License

ISC

## References

https://chromium.googlesource.com/android_tools/+/master/sdk/tools/support

https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings/For_machines

https://pt.wikipedia.org/wiki/Wikip%C3%A9dia:Lista_de_erros_comuns/M%C3%A1quinas
