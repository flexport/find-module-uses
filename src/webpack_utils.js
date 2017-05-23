// @flow
const {promisify, resolve: success} = require('bluebird');
const readFile = promisify(require('fs').readFile);
const exec = promisify(require('child_process').exec);

const {renderErr, fileIsPresent} = require('./utils.js');
const {treeFromHash} = require('./tree_utils.js');
import type {Tree} from '../lib/tree_utils';

// Sort of a grab bag collection right now...
type ModuleT = {
  id: string,
  reasons: Array<{
    moduleId: string,
  }>,
};

const generateProfile = (path: string) => {
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
    generateProfile(profileLocation) :
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

// The children are things that need the parent.
const dependentsTree = (modules: Array<ModuleT>, startName: string): Tree<string> => {
  const modulesByNeeded = modules.reduce((res, module) => {
    res[module.id] = module.reasons.map(({moduleId}) => moduleId);
    return res;
  }, {});

  return (treeFromHash(modulesByNeeded, startName): Tree<string>);
};

// The children are things the parent needs.
const dependenciesTree = (modules: Array<ModuleT>, startName: string) => {
  const modulesByNeeds = modules.reduce((res, module) => {
    module.reasons.forEach(({moduleId: id}) => {
      res[id] = res[id] ? res[id].concat([module.id]) : [module.id];
    });
    return res;
  }, {});

  return (treeFromHash(modulesByNeeds, startName): Tree<string>);
};

// TODO: Make more sophisticated
// How does jest do the matching?
const moduleMatch = (modules: Array<ModuleT>, name: string): ?string => {
  const module = modules.find(({id}) => {
    return id.match && id.match(name);
  });
  return module && module.id;
};

module.exports = {
  generateProfile,
  getProfile,
  moduleMatch,
  dependentsTree,
  dependenciesTree,
};
