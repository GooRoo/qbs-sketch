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

function buildArguments(inputs, props, command) {
	function combineList(params) {
		return params.join(',')
	}

	function cmdSwitch(key, params) {
		return '--' + key + '=' + combineList(params)
	}

	function asArray(value) {
		return value instanceof Array? value : [value]
	}

	console.warn('inputs: ' + inputs)
	console.warn('props: ' + props)
	console.warn('command: ' + command)

	var args = []

	args.push(command)
	if (command === 'export') {
		args.push(props.exportMode)
	}

	if (props.formats.length > 0) {
		args.push(cmdSwitch('formats', asArray(props.formats)))
	}

	if (props.scales.length > 0) {
		args.push(cmdSwitch('scales', asArray(props.scales)))
	}

	if (props.outputPrefix) {
		args.push('--output=' + props.outputPrefix)
	}

	for (var inn in inputs)
		console.warn(inputs[inn].filePath)

	args = args.concat(inputs.map(function (i) { return i.filePath }))

	return args
}

function prepareExport(product, inputs) {
	var cmd = new Command()
	cmd.program = product.sketch.sketchtoolPath
	cmd.arguments = buildArguments(inputs['sketch'], product.sketch, 'export')
	console.warn(cmd.arguments)
	cmd.workingDirectory = product.sketch.workingDir
	cmd.description = inputs.sketch.map(function (input) {
		return 'exporting from ' + input.fileName
	}).join(' [' + product.name + ']\n')
	cmd.highlight = 'filegen'
	cmd.stdoutFilterFunction = function (_) { return '' }

	return cmd
}
