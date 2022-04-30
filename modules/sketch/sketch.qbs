import qbs
import qbs.File
import qbs.FileInfo
import qbs.ModUtils
import qbs.TextFile
import 'sketch.js' as sk4

Module {
	SketchtoolProbe {
		id: probe
	}

	FileTagger {
        patterns: ['*.sketch']
        fileTags: ['sketch']
    }

	property path sketchtoolPath: probe.filePath

	property string outputPrefix

	property stringList formats: [] // ['png', 'jpg', 'pdf', 'eps', 'svg', 'tiff']

	property string exportMode: 'layers' // 'artboards', 'pages', 'preview'

	property varList scales: [] // [1, 2]

	property bool exportMeta: false

	readonly property string workingDir: FileInfo.joinPaths(product.buildDirectory, 'sketch.dir')

	condition: qbs.targetOS.contains('macos')
	// validate:

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
				File.makePath(product.sketch.workingDir)
			}

			var cmd = sk4.prepareExport(product, inputs)

			var listFiles = new JavaScriptCommand()
			listFiles.silent = true
			listFiles.sourceCode = function () {
				var filePath = FileInfo.joinPaths(product.buildDirectory, 'sketch-export.list')

				var files = sk4.listFiles(product.sketch.workingDir, true)
				var exportFile = new TextFile(filePath, TextFile.WriteOnly)
				exportFile.write(files.join('\n'))
				exportFile.close()
			}

			return [mkdir, cmd, listFiles]
		}
	}

	Scanner {
		inputs: ['sketch.export-list']
		scan: /* (project, product, input, filePath) => */ {
			var f = new TextFile(filePath)
			try {
				return f.readAll().split('\n')
			} finally {
				f.close()
			}
		}
	}

	Rule {
		inputs: ['sketch.export-list']
		outputFileTags: [
			'sketch.export',
			'png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg',
		]
		outputArtifacts: {
			var f = new TextFile(FileInfo.joinPaths(product.buildDirectory, 'sketch-export.list'))
			try {
				var exportedFiles = f.readAll().split('\n')
			} finally {
				f.close()
			}

			return exportedFiles.map(function (ef) {
				var r = {
					filePath: ef,
					fileTags: ['sketch.export', FileInfo.suffix(ef)]
				}
				console.warn(JSON.stringify(r))
				return r
			})
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var cmd = new JavaScriptCommand()
			cmd.silent = true
			return cmd
		}
	}
}
