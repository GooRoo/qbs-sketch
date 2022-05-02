import qbs
import qbs.File
import qbs.FileInfo
import qbs.TextFile

import '../SketchtoolProbe.qbs' as SketchtoolProbe

import '../sketch.js' as sk4

Module {
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

	readonly property string workingDir: FileInfo.joinPaths(product.buildDirectory, 'sketch.dir')

	condition: qbs.targetOS.contains('macos')
	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		validator.setRequiredProperty('sketchtoolPath', sketchtoolPath)
		validator.validate();
	}

	Rule {
		inputs: ['sketch']

		Artifact {
			filePath: FileInfo.completeBaseName(input.filePath) + '.meta.json'
			fileTags: ['sketch.metadata']
		}

		prepare: /* (project, product, inputs, outputs, input, output, explicitlyDependsOn) => */ {
			var cmd = sk4.prepareMetadata(product, input, output)
			return [cmd]
		}
	}
}
