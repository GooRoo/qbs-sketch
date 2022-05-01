import qbs
import qbs.File
import qbs.FileInfo
import qbs.TextFile

import 'sketch.js' as sk4

Module {
	id: root

	SketchtoolProbe {
		id: probe
	}

	FileTagger {
        patterns: ['*.sketch']
        fileTags: ['sketch']
    }

	property path sketchtoolPath: probe.filePath

	property string assetsOutputDir

	property bool cleanBeforeExport: true

	property stringList formats: []

	property bool exportAssets: true

	property string exportMode: 'layers'

	property varList scales: []

	property bool exportMetadata: false

	readonly property string workingDir: FileInfo.joinPaths(product.buildDirectory, 'sketch.dir')

	condition: qbs.targetOS.contains('macos')
	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		validator.setRequiredProperty('sketchtoolPath', sketchtoolPath)
		validator.addEnumValidator('formats', formats, ['png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg'], true)
		validator.addEnumValidator('exportMode', exportMode, ['layers', 'artboards', 'pages', 'preview'])
		validator.addNumberListValidator('scales', scales, 0, undefined, true, false)
		validator.validate();
	}

	Rule {
		multiplex: true
		inputs: ['sketch']

		condition: root.exportAssets

		Artifact {
			filePath: 'sketch-export.list'
			fileTags: ['sketch.export-list']
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var mkdir = new JavaScriptCommand()
			mkdir.silent = true
			mkdir.sourceCode = function () {
				var outDir = product.sketch.workingDir
				if (product.sketch.cleanBeforeExport && File.exists(outDir)) {
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
				var files = sk4.listFiles(product.sketch.workingDir, true)
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

	Rule {
		inputs: ['sketch']

		condition: root.exportMetadata

		Artifact {
			filePath: FileInfo.completeBaseName(input.filePath) + '.meta.json'
			fileTags: ['sketch.metadata']
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var cmd = sk4.prepareMetadata(product, input, output)
			return [cmd]
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
