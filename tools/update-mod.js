import Path from './pathlibx.js';

const tempDir = new Path('./temp');
const modDir = new Path('./game/game/js/mod');

if (!modDir.existsSync()) {
  throw new Error('Wrong work dir');
}

if (!tempDir.t('mod').existsSync()) {
  throw new Error(`Place maginai 'mod' dir to ${tempDir.t('mod')}`);
}

const bakPath = modDir.withName('_mod');
if (bakPath.existsSync()) {
  throw new Error(`Remove backup (${bakPath}) first`);
}

modDir.mvSync(bakPath);

tempDir.t('mod').cpSync(modDir);

bakPath.t('mods').cpSync(modDir.t('mods'));
