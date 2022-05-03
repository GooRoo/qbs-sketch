# Sketch.artboards

This is an auxiliary module that allows to set or override some [export][export] settings specifically for the [`'artboards'`](index.md#mode) mode. [More…](#detailed-description)

## Properties

??? info "Unique properties"

	_The properties unique for this exporting mode (non-existing in [`Sketch.export`][export]) are marked below with **bold** font._

- [`background`](#background): `string`
- **[`exportPageAsFallback`](#exportpageasfallback)**: `bool`
- [`formats`](#formats): `stringList`
- [`groupContentsOnly`](#groupcontentsonly): `bool`
- **[`includeSymbols`](#includesymbols)**: `bool`
- [`items`](#items): `stringList`
- [`outputDir`](#outputdir): `string`
- [`overwrite`](#overwrite): `bool`
- [`saveForWeb`](#saveforweb): `bool`
- [`scales`](#scales): `varList`
- **[`singleCore`](#singlecore)**: `bool`
- [`trimmed`](#trimmed): `bool`
- [`useIdForName`](#useidforname): `bool`

## Detailed Description

This module, as well as the rest of auxiliary modules such as [`Sketch.layers`][layers], [`Sketch.pages`][pages], and [`Sketch.preview`][preview], plays only a helping role. It allows to attach some properties to your products or groups that are later used by the rules defined in the main [`Sketch.export`][export] module.

## File Tags

This module doesn't set or use any tags.

## Property Documentation

#### `background` {.string-type-prop}

:	Allows to set/override the background color to use when exporting slices. Replaces any background specified in the document.

	**Allowed values:**

	- color literal (`'#rgb'`, `'#rgba'`, `'#rrggbb'`, or `'#rrggbbaa'`)
	- color name

		??? example "List of all names"

			---8<--- "docs/reference/color-names.html"

	- `rgb`/`rgba` function

  		For example: `'rgb(128, 0, 255)'`, `'rgba(50%, 0, 100%, 50%)'`.

	- `hsl`/`hsla` function

  		For example: `'hsl(270deg, 100%, 50%)'`, `'hsla(270, 100, 50, 0.5)'`

	**Default:** `undefined`

#### `exportPageAsFallback` {.bool-type-prop}

:	If a page contains no artboards, export that page instead.

	**Default:** `false`

#### `formats` {.stringList-type-prop}

:	The format in which assets are generated. If you set this value, it will override your export presets in the documents.

	!!! tip

		If empty list is provided, then the default [sketchtool][sketchtool]'s behavior is used, i.e. it generates PNG images.

	**Allowed values:** `'png'` | `'jpg'` | `'tiff'` | `'webp'` | `'pdf'` | `'eps'` |` 'svg'`

	**Default:** `[]`

#### `groupContentsOnly` {.bool-type-prop}

:	Export only layers that are contained within the group.

	**Default:** `false`

#### `includeSymbols` {.bool-type-prop}

:	When exporting artboards, include the ones that represent symbols.

	**Default:** `false`

#### `items` {.stringList-type-prop}

:	List of artboard/slice names or IDs to export. You can retrieve the IDs from the [metadata](metadata.md). If you specify this value, it will override the export presets defined in the document.

	!!! tip

		If empty list is provided, then the default [sketchtool][sketchtool]'s behavior is used which is to generate assets for all exportable artboards/slices.

	**Default:** `[]`

#### `outputDir` {.string-type-prop}

:	If you set this property, the assets are exported to folder with this name relatively to [`workingDir`](#workingdir). In other words, the resulting filename is prepended by `outputDir/`.

	**Default:** `undefined`

#### `overwrite` {.bool-type-prop}

:	Set this to true to allow to overwrite existing files with newly generated once.

	!!! bug "I couldn't make it work"

		I tried this parameter with the [sketchtool][sketchtool], however, it had no influence. Maybe it doesn't work or maybe I did something wrong.

	**Default:** `false`

#### `saveForWeb` {.bool-type-prop}

:	Export web-ready images. Setting this option to `true` strips out additional file data from some images, such as EXIF metadata and color profiles.

	**Default:** `false`

#### `scales` {.varList-type-prop}

:	Scales to be used for exporting of assets. This allows you to scale pictures up (@2x, @3x, @4x, etc.) or down (@0.5x, @0.25x, etc.). You can provide a single value or a list. If you specify this value, it will override the export presets defined in the document.

	!!! info "Floating-point scaling factor"

		It appears that [sketchtool][sketchtool] allows to use floats only when scaling down, i.e. for $0 < scale < 1$. If you try to set this property to something like 2.5, the fractional part is trancated.

	!!! tip

		If empty list is provided, then the default [sketchtool][sketchtool]'s behavior is used: all assets are exported according to the presets defined in the document or as `@1x`.

	**Default:** `[]`

#### `singleCore` {.bool-type-prop}

:	By default, [sketchtool][sketchtool] utilises all cores available on the system to get the exports done as soon as possible, but this can be overriden with this property.

	**Default:** `false`

#### `trimmed` {.bool-type-prop}

:	Export images trimmed.

	**Default:** `false`

#### `useIdForName` {.bool-type-prop}

:	Name exported images using their ID rather than their name.

	You can also retrieve the IDs from the [metadata](metadata.md).

	**Default:** `false`


[export]: ./index.md
[metadata]: ./metadata.md
[layers]: ./layers.md
[artboards]: ./artboards.md
[pages]: ./pages.md
[preview]: ./preview.md

[sketchtool]: https://developer.sketch.com/cli/
