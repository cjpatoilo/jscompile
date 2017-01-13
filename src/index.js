'use strict'
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')

function error (value) {
	value = value || undefined
	console.error(`[error] ${value}`)
	process.exit(1)
}

function resolveInput (value) {
	if (!fs.existsSync(value)) error('Input not exist.')
	if (fs.lstatSync(value).isFile()) error('Input should be a folder.')
	let dirname = value
	value = fs
		.readdirSync(value)
		.filter(file => path.parse(file).ext === '.js')
	return value[0] ? path.resolve(dirname, `**/*${path.parse(value[0]).ext}`) : error('File not found.')
}

function resolveOutput (input, output) {
	if (!output) return path.dirname(path.dirname(input)) + '/compile'
	return path.resolve(output)
}

function jscompile (input, output) {
	input = resolveInput(input)
	output = resolveOutput(input, output)

	return new Promise((resolve, reject) => {
		try {
			let compile
			switch (path.parse(input).ext) {
				case '.js':
					compile = babel
					break
				default:
					error('Input not supported.')
			}
			gulp
				.src(input)
				.pipe(compile({ presets: ['latest'] }))
				.pipe(concat('main.js'))
				.pipe(uglify())
				.pipe(gulp.dest(output))
			console.info(`[info] Rendering Complete, saving .js file...`)
			console.info(`[info] Wrote JS to ${output}`)
			resolve(output)
		} catch (err) {
			reject(err)
		}
	})
}

module.exports = jscompile
