import qbs

import '../sketch.js' as sk4

Module {
	property string outputDir
	PropertyOptions {
		name: 'outputDir'
		description: 'The specified dir is prepended to each exported asset path.'
	}

	property string outputFileName
	PropertyOptions {
		name: 'outputFileName'
		description:
			'Filename for saving a preview image. By default, it is the ' +
			'original filename with .preview.png suffix.'
	}

	property bool overwrite: false
	PropertyOptions {
		name: 'overwrite'
		description:
			'Set this to true to allow to overwrite existing files ' +
			'with newly generated once. By default, it is false.'
	}

	property int maxSize
	PropertyOptions {
		name: 'maxSize'
		description:
			'Maximum width/height of exported preview image. By default, ' +
			'it is undefined which means no maximum is set.'
	}

	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		if (maxSize) {
			validator.addRangeValidator('maxSize', maxSize, 1)
		}
		validator.validate();
	}
}
