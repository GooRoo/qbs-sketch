import qbs

import '../ExportModuleBase.qbs' as ExportModuleBase

ExportModuleBase {
	property bool numericSuffixes: false
	PropertyOptions {
		name: 'numericSuffixes'
		description:
			'Add numeric suffix when an export with the same name exists ' +
			'already. By default, it is false.'
	}
}
