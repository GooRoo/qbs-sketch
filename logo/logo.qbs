import qbs

SketchExport {
	name: 'logo'

	files: '*.sketch'

	Group {
		fileTagsFilter: ['sketch.export']
		qbs.install: true
		qbs.installPrefix: 'docs'
		qbs.installDir: 'assets'
	}
}
