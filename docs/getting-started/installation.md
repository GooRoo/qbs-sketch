# Installation

!!! question "Already installed the module?"

	Skip to the [next article](./usage.md).

## Prerequisites

### Qbs

Please, check the [official guide](https://doc.qt.io/qbs/installing.html).

### Apple macOS

This is an obvious limitation: the module works only on macOS as Sketch does too.

### Sketch

This module relies on existing Sketch installation on your host system. If you have several versions installed, the first found one will be used.

## Download

### via Git

=== "HTTPS"

	```sh
	git clone https://github.com/GooRoo/qbs-sketch.git
	```

=== "SSH"

	```sh
	git clone git@github.com:GooRoo/qbs-sketch.git
	```

### as archive

[Download zip](https://github.com/GooRoo/qbs-sketch/archive/refs/heads/main.zip){ .md-button .md-button--primary }

## Add to your project

As you [would do](https://doc.qt.io/qbs/custom-modules.html) with any other 3rdParty module, just add the search path to your project's root `qbs`-file:

```qml
import qbs

Project {
	qbsSearchPaths: [
		'<path/to/qbs-sketch/root/folder>'
	]

	// ...
}
```

## Use in Qbs

!!! success "Done with installation?"

	Congrats! Now, you are able to export assets and metadata from your `sketch`-files during the Qbs build process. Learn how in the next chapter.
