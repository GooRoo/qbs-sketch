import qbs
import qbs.Probes
import qbs.Process

Probes.BinaryProbe {
	names: 'sketchtool'
	searchPaths: {
		var p = new Process()
		try {
			p.exec('mdfind', ['kMDItemCFBundleIdentifier=="com.bohemiancoding.sketch3"'], true)
			var sketchApps = p.readStdOut().split('\n')
			return Array.prototype.reduce.call(sketchApps, function (acc, value) {
				if (value) {
					acc.push(value + '/Contents/MacOS')
				}
				return acc
			}, [])
		} catch (e) {
			console.error(e)
		} finally {
			p.close()
		}
	}
}
