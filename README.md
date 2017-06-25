# linter-refmt ![build status badge](https://api.travis-ci.org/jsdf/atom-linter-refmt.svg?branch=master)

_Use [refmt] to display syntax error messages for your Reason code in Atom._


## Features

* Report syntax errors on the fly with [linter] or [nuclide]'s linter


## Usage

Just install and enable the package


## Installation

This package requires [language-reason] and the latest version of the [reason-cli] tools.

Other recommended packages:

- [ocaml-merlin] For autocompletion, type error info
- [reason-refmt] For Reason code formatting on save

With nuclide
```sh
apm install language-reason linter-refmt
```

Without nuclide
```sh
apm install language-reason linter-refmt linter
```

[refmt]: https://facebook.github.io/reason/tools.html#refmt
[linter]: https://atom.io/packages/linter
[nuclide]: https://atom.io/packages/nuclide
[language-reason]: https://atom.io/packages/language-reason
[reason-cli]: https://github.com/reasonml/reason-cli#1-install-reason-cli-globally
[ocaml-merlin]: https://atom.io/packages/ocaml-merlin
[reason-refmt]: https://atom.io/packages/reason-refmt
