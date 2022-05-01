var DarwinTools = require('qbs.DarwinTools')
var File = require('qbs.File')
var FileInfo = require('qbs.FileInfo')
var TextFile = require('qbs.TextFile')
var Utilities = require('qbs.Utilities')

function listFiles(dir, recurse) {
	recurse = recurse || false

	var files = File.directoryEntries(dir, File.Files).map(function (file) {
		return FileInfo.joinPaths(dir, file);
	});

	if (recurse) {
		files = files.concat(
			File.directoryEntries(dir, File.Dirs | File.NoDotAndDotDot).reduce(function (acc, innerDir) {
				return acc.concat(listFiles(FileInfo.joinPaths(dir, innerDir), recurse))
			}, [])
		)
	}

	return files;
}

function buildArguments(input, props, command) {
	function combineList(params) {
		return params.join(',')
	}

	function asArray(value) {
		return value instanceof Array? value : [value]
	}

	function cmdSwitch(key, params) {
		return '--' + key + '=' + combineList(asArray(params))
	}

	function prop(name) {
		return input.sketch[name] //|| props[name]
	}

	var args = []

	args.push(command)
	if (command === 'export') {
		args.push(prop('exportMode'))

		if (prop('formats').length > 0) {
			args.push(cmdSwitch('formats', prop('formats')))
		}

		if (prop('scales').length > 0) {
			args.push(cmdSwitch('scales', prop('scales')))
		}

		if (prop('assetsOutputDir')) {
			args.push(cmdSwitch('output', prop('assetsOutputDir')))
		}
	}

	args.push(input.filePath)

	return args
}

function prepareExport(product, inputs) {
	return inputs.sketch.map(function (inputFile) {
		var cmd = new Command()
		cmd.program = product.sketch.sketchtoolPath
		cmd.arguments = buildArguments(inputFile, product.sketch, 'export')
		cmd.workingDirectory = product.sketch.workingDir
		cmd.description = 'exporting assets from ' + inputFile.fileName
		cmd.highlight = 'filegen'
		cmd.stdoutFilterFunction = function (_) { return '' }
		return cmd
	})
}

function prepareMetadata(product, input, output) {
	var cmd = new Command()
	cmd.program = product.sketch.sketchtoolPath
	cmd.arguments = buildArguments(input, product.sketch, 'metadata')
	cmd.description = 'extracting metadata from ' + input.fileName
	cmd.highlight = 'codegen'
	cmd.stdoutFilePath = FileInfo.joinPaths(product.buildDirectory, output.fileName)
	return cmd
}

function exportedFiles(filePath) {
	try {
		var f = new TextFile(filePath)
		return f.readAll().split('\n')
	} finally {
		if (f) f.close()
	}
}
