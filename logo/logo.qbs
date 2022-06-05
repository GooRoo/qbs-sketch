import qbs

SketchExport {
	name: 'logo'

	files: '*.sketch'

	SketchExportGroup {
		installPrefix: 'docs'
		installDir: 'assets'
	}
}
