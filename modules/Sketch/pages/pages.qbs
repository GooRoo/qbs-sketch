import qbs

import '../ExportModuleBase.qbs' as ExportModuleBase

import '../sketch.js' as sk4

ExportModuleBase {
	property var bounds
	PropertyOptions {
		name: 'bounds'
		description:
			'Bounds of the slice to export specified as JS-object with x, y, ' +
			'width, and height properties. By default, it is undefined.'
	}

	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		validator.addRectangleValidator('bounds', bounds)
		validator.validate();
	}
}
