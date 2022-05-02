import qbs

import 'sketch.js' as sk4

Module {
	property string outputDir
	PropertyOptions {
		name: 'outputDir'
		description: 'The specified dir is prepended to each exported asset path.'
	}

	property stringList formats: []
	PropertyOptions {
		name: 'formats'
		allowedValues: ['png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg']
		description:
			'The format in which assets are generated. ' +
			'By default it is PNG, but can also be JPG, TIFF, WebP, PDF, EPS, or SVG. ' +
			'You can also provide a list of formats to export in all of them.'
	}

	property stringList items: []
	PropertyOptions {
		name: 'items'
		description:
			'List of artboard/slice names or IDs to export. The default is to export ' +
			'all artboards/slices. If you specify this value, it will override ' +
			'the export presets defined in the document.'
	}

	property varList scales: []
	PropertyOptions {
		name: 'scales'
		description:
			'List of scales to be used for export of assets. By default, all assets are exported ' +
			'according to the presets defined in the document. You can override this by defining ' +
			'another scale or list of scales. It is also possible to scale down by providing a ' +
			'scale 0 < value <= 1.'
	}

	property bool saveForWeb: false
	PropertyOptions {
		name: 'saveForWeb'
		description:
			'Export web-ready images. Setting this option to true strips ' +
			'out additional file data from some images, such as EXIF metadata ' +
			'and color profiles. By default, it is false.'
	}

	property bool overwrite: false
	PropertyOptions {
		name: 'overwrite'
		description:
			'Set this to true to allow to overwrite existing files ' +
			'with newly generated once. By default, it is false.'
	}

	property bool trimmed: false
	PropertyOptions {
		name: 'trimmed'
		description: 'Export images trimmed. By default, it is false.'
	}

	property string background
	PropertyOptions {
		name: 'background'
		description:
			'Background color to use when exporting slices. ' +
			'Replaces any background specified in the document.'
	}

	property bool groupContentsOnly: false
	PropertyOptions {
		name: 'groupContentsOnly'
		description:
			'Export only layers that are contained within the group. ' +
			'By default, it is false.'
	}

	property bool useIdForName: false
	PropertyOptions {
		name: 'useIdForName'
		description:
			'Name exported images using their ID rather than their name. ' +
			'By default, it is false.'
	}

	validate: {
		var validator = new sk4.PropertyValidatorEx('sketch')
		validator.addEnumValidator('formats', formats, ['png', 'jpg', 'tiff', 'webp', 'pdf', 'eps', 'svg'], true)
		validator.addNumberListValidator('scales', scales, 0, undefined, true, false)
		validator.addColorValidator('background', background)
		validator.validate();
	}
}
