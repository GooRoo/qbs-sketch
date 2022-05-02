var File = require('qbs.File')
var FileInfo = require('qbs.FileInfo')
var ModUtils = require('qbs.ModUtils')
var TextFile = require('qbs.TextFile')

require('polyfills.js')

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

function buildArguments(input, command, mode) {
	function combineList(params) {
		return params.join(',')
	}

	function asArray(value) {
		if (!value) {
			return []
		} else {
			return value instanceof Array? value : [value]
		}
	}

	function cmdSwitch(key, param) {
		return '--' + key + '=' + param
	}

	function cmdSwitchBool(key, param) {
		return cmdSwitch(key, (param? 'YES' : 'NO'))
	}

	function cmdSwitchList(key, params) {
		return cmdSwitch(key, combineList(asArray(params)))
	}

	function cmdSwitchRect(key, param) {
		return cmdSwitchList(key, [param.x, param.y, param.width, param.height])
	}

	function prop(key) {
		return input.Sketch[mode][key] || input.Sketch['export'][key]
	}

	function eligible(mode, key) {
		var commonKeys = [
			'outputDir',
			'formats',
			'items',
			'scales',
			'saveForWeb',
			'overwrite',
			'trimmed',
			'background',
			'groupContentsOnly',
			'useIdForName'
		]
		var cmdModeToKey = {
			'layers': commonKeys.concat(['numericSuffixes']),
			'artboards': commonKeys.concat(['includeSymbols', 'exportPageAsFallback', 'singleCore']),
			'pages': commonKeys.concat(['bounds']),
			'preview': ['outputDir', 'outputFileName', 'overwrite', 'maxSize']
		}

		return cmdModeToKey[mode].contains(key)
	}

	var props = input.Sketch[command]

	var args = []

	args.push(command)
	if (command === 'export') {
		args.push(mode)

		args.push(cmdSwitchBool('overwriting', prop('overwrite')))

		if (prop('outputDir')) {
			args.push(cmdSwitch('output', prop('outputDir')))
		}

		if (eligible(mode, 'formats') && prop('formats').length > 0) {
			args.push(cmdSwitchList('formats', prop('formats')))
		}

		if (eligible(mode, 'items') && prop('items').length > 0) {
			args.push(cmdSwitchList('items', prop('items')))
		}

		if (eligible(mode, 'scales') && prop('scales').length > 0) {
			args.push(cmdSwitchList('scales', prop('scales')))
		}

		if (eligible(mode, 'saveForWeb')) {
			args.push(cmdSwitchBool('save-for-web', prop('saveForWeb')))
		}

		if (eligible(mode, 'trimmed')) {
			args.push(cmdSwitchBool('trimmed', prop('trimmed')))
		}

		if (eligible(mode, 'background') && prop('background')) {
			args.push(cmdSwitch('background', prop('background')))
		}

		if (eligible(mode, 'groupContentsOnly')) {
			args.push(cmdSwitchBool('group-contents-only', prop('groupContentsOnly')))
		}

		if (eligible(mode, 'useIdForName')) {
			args.push(cmdSwitchBool('use-id-for-name', prop('useIdForName')))
		}

		if (eligible(mode, 'numericSuffixes')) {
			args.push(cmdSwitchBool('suffixing', prop('numericSuffixes')))
		}

		if (eligible(mode, 'includeSymbols')) {
			args.push(cmdSwitchBool('include-symbols', prop('includeSymbols')))
		}

		if (eligible(mode, 'exportPageAsFallback')) {
			args.push(cmdSwitchBool('export-page-as-fallback', prop('exportPageAsFallback')))
		}

		if (eligible(mode, 'singleCore')) {
			args.push(cmdSwitchBool('serial', prop('singleCore')))
		}

		if (eligible(mode, 'bounds') && prop('bounds')) {
			args.push(cmdSwitchRect('bounds', prop('bounds')))
		}

		if (eligible(mode, 'outputFileName')) {
			var previewFileName = (prop('outputFileName') || input.baseName) + '.preview.png'
			args.push(cmdSwitch('filename', previewFileName))
		}

		if (eligible(mode, 'maxSize') && prop('maxSize') !== -1) {
			args.push(cmdSwitch('max-size', prop('maxSize')))
		}
	}

	args.push(input.filePath)
	return args
}

function prepareExport(product, inputs) {
	// I defined this class only because I thought it would help me to avoid the crash
	// but it didn't (see below)
	var MkPreviewDir = (function () {
		function MkPreviewDir(dir) {
			this.dir = dir
			this.silent = true
			// this.sourceCode = this.makeDir   // this just doesn't work
			this.sourceCode = function () {     // and this crashes Qbs
				File.makePath(this.dir)
			}
		}

		MkPreviewDir.prototype = Object.create(JavaScriptCommand.prototype)
		MkPreviewDir.prototype.constructor = MkPreviewDir

		MkPreviewDir.prototype.makeDir = function () {
			File.makePath(this.dir)
		}

		return MkPreviewDir
	})()

	return inputs.sketch.flatMap(function (inputFile) {
		return inputFile.Sketch['export'].mode.flatMap(function (m) {
			var cmds = []
			if (m === 'preview') {
				var previewDir = FileInfo.joinPaths(
					product.Sketch['export'].workingDir,
					inputFile.Sketch.preview.outputDir
				)

				// cmds.push(new MkPreviewDir(previewDir))

				// FIXME: This is some Qbs bug. I tried to use JavaScriptCommand here, but
				// it crashes Qbs with segmentation fault. Had to fallback to regular Command
				var md = new Command('mkdir', ['-p', previewDir])
				md.silent = true
				cmds.push(md)
			}
			var cmd = new Command()
			cmd.program = product.Sketch['export'].sketchtoolPath
			cmd.arguments = buildArguments(inputFile, 'export', m)
			cmd.workingDirectory = product.Sketch['export'].workingDir
			cmd.description = 'exporting ' + m + ' from ' + inputFile.fileName
			cmd.highlight = 'filegen'
			cmd.stdoutFilterFunction = function (_) { return '' }
			cmds.push(cmd)
			return cmds
		})
	})
}

function prepareMetadata(product, input, output) {
	var cmd = new Command()
	cmd.program = product.Sketch.metadata.sketchtoolPath
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

	PropertyValidatorEx.allOf = function (collection, predicate) {
		for (var key in collection) {
			if (!predicate(collection[key])) {
				return false
			}
		}
		return true
	}

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
			return PropertyValidatorEx.allOf(value, function (elem) {
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

	PropertyValidatorEx.prototype.addColorValidator = function (propertyName, propertyValue) {
		var message = [
			'must be a valid SVG color name or a literal in one of the following formats: ' +
			'#RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(red, green, blue), rgba(red, green, blue, alpha), ' +
			'hsl(hue, saturation, lightness), or hsla(hue, saturation, lightness, alpha). ',
			'For more information, please, look at CSS specification.'
		]

		this.addCustomValidator(propertyName, propertyValue, function (value) {
			var validColorNames = [
				'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black',
				'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse',
				'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue',
				'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta',
				'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
				'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink',
				'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen',
				'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow',
				'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
				'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
				'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
				'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
				'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
				'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
				'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream',
				'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange',
				'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred',
				'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'red', 'rosybrown',
				'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver',
				'skyblue', 'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue', 'tan',
				'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow',
				'yellowgreen'
			]

			if (!value) {  // well, yes, my colors are nullable
				return true
			} else if (value.startsWith('#')) {
				var hexColor = /^#[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8}$/
				return hexColor.test(value)
			} else {
				var funcColor = /^(rgb|hsl)a?\(\s*\d+(deg|%)?\s*(,\s*\d+%?\s*){2}(,\s*\d+(\.\d+)?)?\)$/
				if (funcColor.test(value)) {
					return true
				} else {
					return validColorNames.contains(value)
				}
			}
		}, message.join('You provided: ' + propertyValue + '\n'))
	}

	PropertyValidatorEx.prototype.addRectangleValidator = function (propertyName, propertyValue) {
		var message =
			'must be a valid rectangle represented by an object ' +
			'with "x", "y", "width", and "height" properties. All ' +
			'properties are numbers. Width and height must be greater ' +
			'than 0. You provided: ' + JSON.stringify(propertyValue)

		this.addCustomValidator(propertyName, propertyValue, function (value) {
			var requiredProps = ['x', 'y', 'width', 'height']
			if (typeof value === 'undefined') {
				return true
			} else if (typeof value !== 'object') {
				return false
			} else if (!Object.keys(value).containsAll(requiredProps)) {
				return false
			} else if (!PropertyValidatorEx.allOf(requiredProps, function (p) { return typeof value[p] === 'number' })) {
				return false
			} else if (value.width <= 0 || value.height <= 0) {
				return false
			} else {
				return true
			}
		}, message)
	}

	return PropertyValidatorEx
})()
