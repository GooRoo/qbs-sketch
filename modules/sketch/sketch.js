var DarwinTools = require('qbs.DarwinTools')
var File = require('qbs.File')
var FileInfo = require('qbs.FileInfo')
var ModUtils = require('qbs.ModUtils')
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

function buildArguments(input, command) {
	function combineList(params) {
		return params.join(',')
	}

	function asArray(value) {
		return value instanceof Array? value : [value]
	}

	function cmdSwitch(key, params) {
		return '--' + key + '=' + combineList(asArray(params))
	}

	var props = input.sketch

	var args = []

	args.push(command)
	if (command === 'export') {
		args.push(props.exportMode)

		if (asArray(props.formats).length > 0) {
			args.push(cmdSwitch('formats', props.formats))
		}

		if (asArray(props.scales).length > 0) {
			args.push(cmdSwitch('scales', props.scales))
		}

		if (props.assetsOutputDir) {
			args.push(cmdSwitch('output', props.assetsOutputDir))
		}
	}

	args.push(input.filePath)

	return args
}

function prepareExport(product, inputs) {
	return inputs.sketch.map(function (inputFile) {
		var cmd = new Command()
		cmd.program = product.sketch.sketchtoolPath
		cmd.arguments = buildArguments(inputFile, 'export')
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
	cmd.arguments = buildArguments(input, 'metadata')
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

var PropertyValidatorEx = (function () {
	function PropertyValidatorEx(moduleName) {
		ModUtils.PropertyValidator.call(this, moduleName)
	}

	PropertyValidatorEx.prototype = Object.create(ModUtils.PropertyValidator.prototype)
	PropertyValidatorEx.prototype.constructor = PropertyValidatorEx

	PropertyValidatorEx.prototype.addEnumValidator = function (propertyName, propertyValue, allowedValues, treatAsList) {
		treatAsList = treatAsList === true

		if (!(allowedValues instanceof Array)) {
			throw 'allowedValues must be a list'
		}

		var message =
			(treatAsList? 'must contain only' : 'must be one of') +
			' the following values: ' + allowedValues.join(', ') +
			'. You provided: ' + propertyValue

		this.addCustomValidator(propertyName, propertyValue, function (value) {
			if (treatAsList) {
				var v = value instanceof Array? value : [value]
				return allowedValues.containsAll(v)
			} else {
				return allowedValues.contains(value)
			}
		}, message)
	}

	PropertyValidatorEx.prototype.addNumberListValidator = function (propertyName, propertyValue, min, max, allowFloats, includeBoundaries) {
		includeBoundaries = typeof includeBoundaries !== 'undefined'? includeBoundaries : true;

		var equal = includeBoundaries? '=' : ''
		var conditions = []
		if (min !== undefined) {
			conditions.push('>' + equal + ' ' + min)
		}
		if (max !== undefined) {
			conditions.push('<' + equal + ' ' + max)
		}

		var message =
			'must contain only' + (!allowFloats ? ' integers ' : ' numbers ') +
			'that are ' + conditions.join(' and ') +
			'. You provided: ' + propertyValue

		this.addCustomValidator(propertyName, propertyValue, function (value) {
			function allOf(collection, predicate) {
				for (var key in collection) {
					if (!predicate(collection[key])) {
						return false
					}
				}
				return true
			}

			return allOf(value, function (elem) {
				if (typeof elem !== 'number') {
					return false
				} else if (!allowFloats && elem % 1 !== 0) {
					return false
				} else if (min !== undefined && includeBoundaries && elem < min) {
					return false
				} else if (max !== undefined && includeBoundaries && elem > max) {
					return false
				} else if (min !== undefined && !includeBoundaries && elem <= min) {
					return false
				} else if (max !== undefined && !includeBoundaries && elem >= max) {
					return false
				} else {
					return true
				}
			})
		}, message)
	}

	return PropertyValidatorEx
})()
