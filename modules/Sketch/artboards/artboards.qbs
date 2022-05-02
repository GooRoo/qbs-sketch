import qbs

import '../ExportModuleBase.qbs' as ExportModuleBase

ExportModuleBase {
	property bool includeSymbols: false
	PropertyOptions {
		name: 'includeSymbols'
		description:
			'When exporting artboards, include the ones that represent ' +
			'symbols. By default, it is false.'
	}

	property bool exportPageAsFallback: false
	PropertyOptions {
		name: 'exportPageAsFallback'
		description:
			'If a page contains no artboards, export that page instead. ' +
			'By default, it is false.'
	}

	property bool singleCore: false
	PropertyOptions {
		name: 'singleCore'
		description:
			'By default, sketchtool utilises all cores available on the ' +
			'system to get the exports done as soon as possible, but this ' +
			'can be overriden with this property. By default, it is false.'
	}
}
