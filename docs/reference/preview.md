# Sketch.preview

This is an auxiliary module that allows to set or override some [export][export] settings specifically for the [`'preview'`](index.md#mode) mode. [More…](#detailed-description)

## Properties

??? info "Unique properties"

	_The properties unique for this exporting mode (non-existing in [`Sketch.export`][export]) are marked below with **bold** font._

- **[`maxSize`](#maxsize)**: `int`
- [`outputDir`](#outputdir): `string`
- **[`outputFileName`](#outputfilename)**: `string`
- [`overwrite`](#overwrite): `bool`

## Detailed Description

This module, as well as the rest of auxiliary modules such as [`Sketch.layers`][layers], [`Sketch.artboards`][artboards], and [`Sketch.pages`][pages], plays only a helping role. It allows to attach some properties to your products or groups that are later used by the rules defined in the main [`Sketch.export`][export] module.

!!! warning "Format"

	The output format for this exporting mode is always PNG.

## File Tags

This module doesn't set or use any tags.

## Property Documentation

#### `maxSize` {.int-type-prop}

:	Maximum width/height of exported preview image.

	If the property is not set, it is considered as no maximum.

	**Default:** `undefined`

#### `outputDir` {.string-type-prop}

:	If you set this property, the assets are exported to folder with this name relatively to [`workingDir`](#workingdir). In other words, the resulting filename is prepended by `outputDir/`.

	**Default:** `undefined`

#### `outputFileName` {.string-type-prop}

:	Filename for saving a preview image.

	If the property is not set, then the original filename is used with .preview.png suffix (e.g. `assets.sketch` ⇒ `assets.preview.png`).

	**Default:** `undefined`

#### `overwrite` {.bool-type-prop}

:	Set this to true to allow to overwrite existing files with newly generated once.

	!!! bug "I couldn't make it work"

		I tried this parameter with the [sketchtool][sketchtool], however, it had no influence. Maybe it doesn't work or maybe I did something wrong.

	**Default:** `false`


[export]: ./index.md
[metadata]: ./metadata.md
[layers]: ./layers.md
[artboards]: ./artboards.md
[pages]: ./pages.md
[preview]: ./preview.md

[sketchtool]: https://developer.sketch.com/cli/
