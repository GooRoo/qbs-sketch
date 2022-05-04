# qbs-sketch

[![Made by Ukrainian](https://img.shields.io/static/v1?label=Made%20by&message=Ukrainian&labelColor=1f5fb2&color=fad247&style=flat-square)](https://github.com/GooRoo/ukrainian-shields)

This [Qbs][qbs] module integrates [Sketch][sketch] into your build process allowing you to automate the pipeline of assets delivery.

Since **Sketch** is available only on Apple **macOS**, the module works only on macOS as the [host system](https://doc.qt.io/qbs/qml-qbsmodules-qbs.html#hostOS-prop) too. It requires the **Sketch** application to be installed in your system.

## Example

```qml
import qbs

SketchExport {
	name: 'sketch-assets'

	Sketch.export.mode: [
		'layers',
		'pages',
	]

	Sketch.layers.outputDir: 'assets'
	Sketch.layers.scales: [1, 2]  // produces .png, @2x.png
	Sketch.layers.formats: 'png'

	Sketch.pages.outputDir: 'reference'
	Sketch.pages.formats: ['pdf', 'svg']
	Sketch.pages.items: [
		'Colors',
		'Typography'
	]

	files: '*.sketch'
}
```
This produces a folder structure similar to this (depending on the contents of your sketch-file of course, so this is just an example):
```
<build-folder>/
├─ assets/
│  ├─ button.png
│  ├─ button@2x.png
│  ├─ input-field.png
│  ├─ input-field@2x.png
│  └─ ...
└─ reference/
   ├─ Colors.pdf
   ├─ Colors.svg
   ├─ Typography.pdf
   └─ Typography.svg
```
All exported files are [tagged](https://doc.qt.io/qbs/language-introduction.html#file-tags-and-taggers) as `sketch.export` and can be used in further products as input.

### Fun fact

By the way, the logo for this microproject was also generated using this module. Just go to the project's root folder and type
```sh
qbs install --install-root .
```

## Documentation

To check the full reference, go to the [documentation](https://gooroo.github.io/qbs-sketch/).

[qbs]: https://doc.qt.io/qbs/
[sketch]: https://www.sketch.com
