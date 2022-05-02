import qbs
import qbs.File
import qbs.FileInfo
import qbs.TextFile

import '../SketchtoolProbe.qbs' as SketchtoolProbe
import '../ExportModuleBase.qbs' as ExportModuleBase

import '../sketch.js' as sk4

ExportModuleBase {
	Depends { name: 'Sketch.layers' }
	Depends { name: 'Sketch.artboards' }
	Depends { name: 'Sketch.pages' }
	Depends { name: 'Sketch.preview' }

	SketchtoolProbe {
		id: probe
	}

	FileTagger {
        patterns: ['*.sketch']
        fileTags: ['sketch']
    }

	property path sketchtoolPath: probe.filePath
	PropertyOptions {
		name: 'sketchtoolPath'
		description:
			'The path to the sketchtool that will be used for exporting. By default, ' +
			'the binary from the first found Sketch.app installed in your system is used.'
	}

	property bool cleanBeforeExport: true
	PropertyOptions {
		name: 'cleanBeforeExport'
		description: 'Specifies whether to clean the output folder before each new export. By default, it is true.'
	}

	property stringList mode
	PropertyOptions {
		name: 'mode'
		allowedValues: ['layers', 'artboards', 'pages', 'preview']
		description:
			'Allows to choose what to export. By default, "layers" are exported ' +
			'but it also can be "artboards", "pages", or document "preview".'
	}

	readonly property string workingDir: FileInfo.joinPaths(product.buildDirectory, 'sketch.dir')

	condition: qbs.targetOS.contains('macos')
	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		validator.setRequiredProperty('sketchtoolPath', sketchtoolPath)
		validator.setRequiredProperty('mode', mode)
		validator.addEnumValidator('formats', formats, ['png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg'], true)
		validator.addEnumValidator('mode', mode, ['layers', 'artboards', 'pages', 'preview'], true)
		validator.validate();
	}

	Rule {
		multiplex: true
		inputs: ['sketch']

		Artifact {
			filePath: 'sketch-export.list'
			fileTags: ['sketch.export-list']
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var mkdir = new JavaScriptCommand()
			mkdir.silent = true
			mkdir.sourceCode = function () {
				var outDir = product.Sketch['export'].workingDir
				if (product.Sketch['export'].cleanBeforeExport) {
					File.remove(outDir)
				}
				File.makePath(outDir)
			}

			// The rule is 'multiplex' because it collects the list of exported
			// assets only once. Although it's possible to run export of several
			// sketch-files with a single command, here I create a separate
			// command for each input file in order to be able to control their
			// export properties separately even within one product (using Groups)
			var cmds = sk4.prepareExport(product, inputs)

			var listFiles = new JavaScriptCommand()
			listFiles.silent = true
			listFiles.sourceCode = function () {
				var files = sk4.listFiles(product.Sketch['export'].workingDir, true)
				if (files.length > 0) {
					var exportFile = new TextFile(output.filePath, TextFile.WriteOnly)
					exportFile.write(files.join('\n'))
					exportFile.close()
				}
			}

			var cmdList = []
			cmdList.push(mkdir)
			cmdList = cmdList.concat(cmds)
			cmdList.push(listFiles)

			return cmdList
		}
	}

	Scanner {
		inputs: ['sketch.export-list']
		scan: /* (project, product, input, filePath) => */ sk4.exportedFiles(filePath)
	}

	Rule {
		inputs: ['sketch.export-list']
		outputFileTags: [
			'sketch.export',
			'png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg',
		]
		outputArtifacts: {
			var exportedFiles = sk4.exportedFiles(FileInfo.joinPaths(product.buildDirectory, 'sketch-export.list'))
			return exportedFiles.map(function (ef) {
				return {
					filePath: ef,
					fileTags: ['sketch.export', FileInfo.suffix(ef)]
				}
			})
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var cmd = new JavaScriptCommand()
			cmd.silent = true
			return cmd
		}
	}
}
