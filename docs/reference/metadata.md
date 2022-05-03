# Sketch.metadata

Provides support for extracting metadata from `sketch`-documents. [More…](#detailed-description)

## Properties

- [`sketchtoolPath`](#sketchtoolpath): `path`
- [`workingDir`](#workingdir): `string`

## Detailed Description

Every Sketch document is a [zip-file](https://developer.sketch.com/file-format/) that contains graphical assets, data, settings, and metadata in JSON format. The metadata can be extracted using this module.

A bit ~~dumb~~ useless example below:

```qml
SketchExport {
	name: 'sketch-meta'

	Group {
		fileTagsFilter: ['sketch.metadata']
		qbs.install: true
	}
}
```

It's suggest to export the metadata at least from one of your documents, look in the file and decide what you can do with it.

## File Tags

### Input

| Tag      | Auto-tagged patterns | Description                                                |
| -------- | -------------------- | ---------------------------------------------------------- |
| `sketch` | *.sketch             | Sketch documents used as a source for extracting metadata. |

### Output

| Tag               | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `sketch.metadata` | Metadata files (*.meta.json) extracted from documents are marked with this tag. |

## Property Documentation

#### `sketchtoolPath` {.path-type-prop}

:	The path to the [`sketchtool`][sketchtool] that will be used for exporting. Usually, there is no need to change this value.

	**Default:** the binary from the first found Sketch.app installed in your system.

#### `workingDir` {.path-type-prop .readonly-prop}

:	Contains the path to the export working directory. Useful when you want to [install generated files](../getting-started/usage.md#installing-generated-files) _preserving_ the folder structure.


[export]: ./index.md
[metadata]: ./metadata.md
[layers]: ./layers.md
[artboards]: ./artboards.md
[pages]: ./pages.md
[preview]: ./preview.md

[sketchtool]: https://developer.sketch.com/cli/
