# JSCompile

> Compile, optimize and compress anything to JS.

[![Travis Status](https://travis-ci.org/cjpatoilo/jscompile.svg?branch=master)](https://travis-ci.org/cjpatoilo/jscompile?branch=master)
[![AppVeyor Status](https://ci.appveyor.com/api/projects/status/q2gmxde5tg31tc3r?svg=true)](https://ci.appveyor.com/project/cjpatoilo/jscompile)
[![Codacy Status](https://img.shields.io/codacy/grade/c4dc1b68803c486285c0ecef5bf275b5/master.svg)](https://www.codacy.com/app/cjpatoilo/jscompile/dashboard)
[![Dependencies Status](https://david-dm.org/cjpatoilo/jscompile.svg)](https://david-dm.org/cjpatoilo/jscompile)
[![Version Status](https://badge.fury.io/js/jscompile.svg)](https://www.npmjs.com/package/jscompile)
[![Download Status](https://img.shields.io/npm/dt/jscompile.svg)](https://www.npmjs.com/package/jscompile)
[![Gitter Chat](https://img.shields.io/badge/gitter-join_the_chat-4cc61e.svg)](https://gitter.im/cjpatoilo/jscompile)

## Why it's awesome

No spend several hours setting configuration files. **JSCompile** will compile, optimize and compress anything to JS. Set folder name where the source code is located and we'll take care of the rest for you. Just it!

_NOTE: For now only works with ES2017._

## Getting Started

**Install with npm**

```
$ npm install jscompile
```

**Install with Yarn**

```
$ yarn add jscompile
```

**Run with npx (without installing)**

```
$ npx install jscompile
```

**Usage**

```
$ jscompile src dist
```

_NOTE: Only the folder name is required._

## CLI

```
$ jscompile --help

  Usage:

    $ jscompile <input> [<output>] [<options>]

  Options:

    -h, --help              Display help information
    -v, --version           Output version

  Examples:

    $ jscompile src
    $ jscompile src dist
```

## Contributing

Want to contribute? Follow these [recommendations](https://github.com/cjpatoilo/jscompile/contribute).

## License

Designed with ♥ by [CJ Patoilo](https://twitter.com/cjpatoilo). Licensed under the [MIT License](https://cjpatoilo.com/license).
