# Usage in Qbs

## Exporting assets and metadata

### Using `SketchExport` product

The easiest way to start exporting your Sketch designs in Qbs is to use the provided by me item [`SketchExport`][sketchexport-item].

```qml
import qbs

SketchExport {
	name: 'sketch-assets'
	files: '*.sketch'
}
```

This will automatically export everything that is marked as [exportable](https://www.sketch.com/docs/importing-and-exporting/) in your Sketch documents (`layers` [mode][export-mode]) + the metadata.

### Using custom product

If you want to have more fine-grained control over the pipeline, you might decide to create a custom product.

Qbs won't build anything you haven't asked for. So if you want it to generate something from you `sketch`-files, you need to tell it that you need a certain type of [artifacts](https://doc.qt.io/qbs/qml-qbslanguageitems-artifact.html). For that, you either need an active rule that waits for that type of artifacts as input or (a much simpler option) you can add corresponding file tags to your product type. Let's proceed with the latter option. Here is a sample check-list for you:

- [x] Add file tags as output types of your product
	- `sketch.export` for exporting assets
	- `sketch.metadata` for extracting metadata
	```qml
	Product {
		type: ['sketch.export', 'sketch.metadata']
	}
	```
- [x] Add dependencies
	- [`Sketch.export`][export] for exporting assets
	- [`Sketch.metadata`][metadata] for extracting metadata
	- If you want to have a full control over what you are exporting, you can also use the following auxiliary modules:
		- [`Sketch.layers`][layers]
		- [`Sketch.artboards`][artboards]
		- [`Sketch.pages`][pages]
		- [`Sketch.preview`][preview]
- [x] Choose the [exporting mode][export-mode].

??? info "Difference to `SketchExport`"

	Well, there is no difference. Essentially this is exactly what [`SketchExport`](#using-sketchexport-product) does:
	```qbs
	---8<--- "imports/SketchExport.qbs"
	```
	However, if your product generates also other types of artifacts, it still may be beneficial to control everything manually.

## Installing generated files

### Assets

[`Sketch.export`][export] marks all the generated files with `sketch.export` tag. Additionally, every file gets a tag accordingly to its file-type (determined by extension). These could be: `png`, `jpg`, `tiff`, `webp`, `pdf`, `eps`, `svg`.

So, in order to install all these files, you need a [`Group`](https://doc.qt.io/qbs/qml-qbslanguageitems-group.html) with [`qbs.install:`](https://doc.qt.io/qbs/installing-files.html)`true`. The [`Group`](https://doc.qt.io/qbs/qml-qbslanguageitems-group.html) will allow to skip the generated metadata from installation while the [`qbs.install`](https://doc.qt.io/qbs/installing-files.html) property will tell Qbs to copy all files to your installation folder with planar structure (potentially overwriting the files with the same names from different folders).

If you want to keep the folder structure though, you can use [`qbs.installSourceBase`](https://doc.qt.io/qbs/qml-qbsmodules-qbs.html#installSourceBase-prop) as below:

```qml
import qbs

SketchExport {
	name: 'sketch-assets'
	files: '*.sketch'

	Group {
		fileTagsFilter: ['sketch.export']
		qbs.install: true

		// to keep the folder structure:
		qbs.installSourceBase: Sketch['export'].workingDir
	}
}
```

??? warning "`Sketch.export` vs. `Sketch['export']`"

	Note that if you want to attach some module properties to your product, you can use the following syntax:
	```qml
	SketchExport {
		Sketch.export.formats: ['png', 'svg']
	}
	```
	However, in the example above, it was clearly seen that I used it differently:
	```qml
	SketchExport {
		qbs.installSourceBase: Sketch['export'].workingDir
	}
	```
	Although in JavaScript and QML (and thus in Qbs that inherits their syntax) there is no difference between those two variants, the following will trigger the error:
	```qml hl_lines="2"
	SketchExport {
		qbs.installSourceBase: Sketch.export.workingDir  // ⇒ SyntaxError: Parse error
	}
	```
	That happens because **`export`** is a reserved word in JavaScript. If it is met in _Qbs context_ (on the left side of a property assignment), there is no problem, but when the parser encounters it in _JavaScript context_ (on the rigth side of a property assignment), it fails.

Since installing files as above is a quite common case, the module provides an additional item [`SketchExportGroup`][sketchexportgroup-item] for your convenience. With it, the code becomes even shorter:

```qml hl_lines="7"
import qbs

SketchExport {
	name: 'sketch-assets'
	files: '*.sketch'

	SketchExportGroup {}  // installs everything preserving the folder structure
}
```

[export]: ../reference/index.md
[metadata]: ../reference/metadata.md
[layers]: ../reference/layers.md
[artboards]: ../reference/artboards.md
[pages]: ../reference/pages.md
[preview]: ../reference/preview.md
[sketchexport-item]: ../reference/sketch-export.md
[sketchexportgroup-item]: ../reference/sketch-export-group.md

[export-mode]: ../reference/index.md#mode
