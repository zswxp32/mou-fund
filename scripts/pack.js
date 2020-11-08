const { exec } = require('shelljs');
const pkgStore = require('pkg-store');

function pack () {
  const cwd = process.cwd();
  const pkg = new pkgStore(cwd);
  const { name, version } = pkg.read();

  exec([
    'cd ./dist',
    `zip -r ../build/${name}-${version}.zip ./*`
  ].join(' && '));
}

pack();