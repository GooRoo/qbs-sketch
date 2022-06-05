import qbs

Group {
	property string installPrefix
	property string installDir

	fileTagsFilter: ['sketch.export']
	qbs.install: true
	qbs.installPrefix: installPrefix
	qbs.installDir: installDir
	qbs.installSourceBase: Sketch['export'].workingDir
}
