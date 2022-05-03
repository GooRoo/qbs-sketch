# SketchExport

Represents a bunch of assets exported from `sketch`-documents. [More…](#detailed-description)

Inherits [`Product`](https://doc.qt.io/qbs/qml-qbslanguageitems-product.html)

## Properties

This item doesn't define any own properties.

## Detailed Description

This item is just a product with the [dependency](https://doc.qt.io/qbs/qml-qbslanguageitems-depends.html) to [`Sketch.export`][export], [`Sketch.layers`][layers], [`Sketch.artboards`][artboards], [`Sketch.pages`][pages], [`Sketch.preview`][preview], and [`Sketch.metadata`][metadata].

Its resulting [type](https://doc.qt.io/qbs/qml-qbslanguageitems-product.html#type-prop) is `#!js ['sketch.export', 'sketch.metadata']`.

For more information, read the [introduction](../getting-started/usage.md#using-sketchexport-product).

[export]: ./index.md
[metadata]: ./metadata.md
[layers]: ./layers.md
[artboards]: ./artboards.md
[pages]: ./pages.md
[preview]: ./preview.md
