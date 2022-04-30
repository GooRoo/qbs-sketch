import qbs
import qbs.File
import qbs.FileInfo
import qbs.ModUtils
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

	property stringList formats: [] // ['png', 'jpg', 'pdf', 'eps', 'svg', 'tiff']

	property bool exportAssets: true

	property string exportMode: 'layers' // 'artboards', 'pages', 'preview'

	property varList scales: [] // [1, 2]

	property bool exportMetadata: false

	readonly property string workingDir: FileInfo.joinPaths(product.buildDirectory, 'sketch.dir')

	condition: qbs.targetOS.contains('macos')
	// validate:

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

			var cmd = sk4.prepareExport(product, inputs)

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

			return [mkdir, cmd, listFiles]
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
