#!/usr/bin/env node
'use strict'
const jscompile = require('./')
const pkg = require('./package.json')

function cli (argv) {
  const args = argv.slice(2)

  if (args.indexOf('--version') !== -1 || args.indexOf('-v') !== -1) {
    console.log(pkg.version)
    process.exit(0)
  }

  if (args.indexOf('--help') !== -1 || args.indexOf('-h') !== -1) {
    console.log(`
  Usage:

    $ jscompile <input> [<output>] [<options>]

  Options:

    -h, --help              Display help information
    -v, --version           Output version

  Examples:

    $ jscompile src
    $ jscompile src dist
`)
    process.exit(0)
  }

  return jscompile(args[0], args[1])
}

if (require.main === module) {
  cli(process.argv)
}

module.exports = cli
