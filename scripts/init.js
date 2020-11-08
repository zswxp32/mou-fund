const fs = require('fs-extra');
const pkgStore = require('pkg-store');

module.exports = function init () {
  fs.ensureDirSync('./dist');
  fs.emptyDirSync('./dist');
  fs.copySync('./icon', './dist/icon');

  const pkg = new pkgStore(process.cwd());
  let { name_ch: name, version } = pkg.read();

  if (process.env.NODE_ENV === 'development') {
    name = `${name}-debug`;
    version = '1.0.0';
  }

  const manifest = fs.readFileSync('./manifest.json', 'utf-8');
  const newManifest = manifest
    .replace('__NAME__', name)
    .replace('__VERSION__', version);

  fs.writeFileSync('./dist/manifest.json', newManifest, 'utf-8');
}
