/* eslint-disable no-console */
// @flow
const {promisify, resolve: success} = require('bluebird');
const {statSync} = require('fs');
const readFile = promisify(require('fs').readFile);
const exec = promisify(require('child_process').exec);

// Sort of a grab bag collection right now...
type ModuleT = {
  id: string,
  reasons: Array<{
    moduleId: string,
  }>,
};

const renderErr = (err: string) => {
  // TODO: Actually deal with this?
  console.error(err);
  return;
};

const arrToEnglish = (arr: Array<string>, inter: string, last: string, oxford: string) => {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]}${inter}${arr[1]}`;
  } else {
    const allButLast = arr.slice(0, arr.length - 1).join(inter);
    const last = arr[arr.length - 1];

    return `${allButLast}${oxford}${last}`;
  }
};

const fileIsPresent = (path: string) => {
  try {
    statSync(path);
    return true;
  } catch (_) {
    return false;
  }
};

const generateWebpackProfile = (path: string) => {
  console.log('Generating webpack profile (this may take some time)...');

  const nodeCmd = '/usr/bin/env node';
  // Make configurable?
  const nodeFlags = '--max_old_space_size=4096';
  const wpCmd = 'node_modules/.bin/webpack';
  const wpFlags = '--profile --json --config webpack/config.production.js';
  return exec(`${nodeCmd} ${nodeFlags} ${wpCmd} ${wpFlags} > ${path}`);
};

const getProfile = (profileLocation: string, forceRegenProfile: boolean) => {
  const shouldGenProfile = forceRegenProfile || !fileIsPresent(profileLocation);
  const profileGenerated = shouldGenProfile ?
    generateWebpackProfile(profileLocation) :
    success();

  profileGenerated.catch(() => {
    renderErr('Error: Couldn\'t generate profile.json!');
  });
  const profilePromise = profileGenerated.then((data) => {
    return readFile(profileLocation, 'utf-8');
  });

  profilePromise.catch((err) => {
    renderErr('Error: Couldn\'t find profile.json!');
  });
  return profilePromise.then((profile) => {
    // strip out text at beginning
    // TODO: make more robust/faster (these two lines take ~1.5 seconds together);
    profile = profile.split('\n').slice(1).join('\n');
    return JSON.parse(profile).modules;
  });
};

// TODO: Make more sophisticated
// How does jest do the matching?
const moduleMatch = (modules: Array<ModuleT>, name: string): ?string => {
  const module = modules.find(({id}) => {
    return id.match && id.match(name);
  });
  return module && module.id;
};

const matchSuffixes = <T>(haystack: Array<T>, needle: Array<T>): boolean => {
  return needle.every((val, idx) => {
    const haystackVal = haystack[haystack.length - needle.length + idx];
    return haystackVal === val;
  });
};

module.exports = {
  fileIsPresent,
  renderErr,
  generateWebpackProfile,
  arrToEnglish,
  getProfile,
  moduleMatch,
  matchSuffixes,
};
