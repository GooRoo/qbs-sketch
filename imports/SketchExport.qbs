import qbs

Product {
	Depends {
		name: 'Sketch'
		submodules: [
			'artboards',
			'export',
			'layers',
			'metadata',
			'pages',
			'preview',
		]
	}
	Sketch.export.mode: 'layers'
	type: ['sketch.export', 'sketch.metadata']
}
