#! /usr/bin/env node

/**
 *   A utility to help you figure out what modules might be affected by your js
 *   changes, and where to find them. Especially useful for UI changes, where
 *   you want to be certain that you haven't screwed up the rendering of any of
 *   the enclosing components.
 *
 * =============================================================================
 * BASIC USAGE
 * =============================================================================
 *
 *     $ yarn list-uses -- $module
 *
 *   This will find the direct users of `$module`, and, for each one, give you
 *   a path starting at the root of one of the apps (eg, dispatch, core, client,
 *   etc) where you can find it.
 *
 * =============================================================================
 * FLAGS
 * =============================================================================
 *
 *   -p, --profilePath        Location of the profile.json file
 *                            [string] [default: "tmp/profile.json"]
 *
 *   -f, --forceRegenProfile  Force regeneration of webpack profile (Slow!)
 *                            [boolean] [default: "false"]
 *
 *   -r, --root               The "root" to of the graph to restrict the sarch
 *                            to. If passed, the script will only return
 *                            results that are within this subgraph.
 *                            [string]
 *
 *   -d, --depth              How deep the use paths should be. Ie, if this is
 *                            2, the script will not only find the direct users
 *                            of the passed component, but also the direct
 *                            users of *those* direct users, and, for each
 *                            combination, give you an example path.
 *                            [number] [default: "1"]
 *
 *   --help                   Show help
 *                            [boolean]
 *
 * =============================================================================
 * EXAMPLE
 * =============================================================================
 *
 *   $ yarn list-uses -- TimePicker
 *      Directly used by:
 *        ./components/form/PortField.jsx
 *      Example path:
 *        ./core/CoreApp.jsx
 *        ./core/components/rates/index/RateListContainer.jsx
 *        ./core/components/rates/index/RateListHeader.jsx
 *        ./components/form/PortField.jsx
 *        ./components/maps/StaticMap.jsx
 *
 *      Directly used by:
 *        ./components/form/GeoBoundMultiSelectField.jsx
 *      Example path:
 *        ./core/CoreApp.jsx
 *        ./core/components/companies/service_areas/CompanyServiceAreas.jsx
 *        ./components/form/GeoBoundMultiSelectField.jsx
 *        ./components/maps/StaticMap.jsx
 *
 *      Directly used by:
 *        ./components/network/NetworkStaticMap.jsx
 *      Example path:
 *        ./core/CoreApp.jsx
 *        ./core/components/clients/show/ClientDetailsInterface.jsx
 *        ./core/components/clients/show/ClientDetailsContainer.jsx
 *        ./core/components/network/NetworkInterface.jsx
 *        ./components/network/NetworkInterface.jsx
 *        ./components/network/NetworkListInterface.jsx
 *        ./components/network/Locations.jsx
 *        ./components/network/LocationsRow.jsx
 *        ./components/network/NetworkStaticMap.jsx
 *        ./components/maps/StaticMap.jsx
 *
 *      Directly used by:
 *        ./components/network/LocationDetailsSidebar.jsx
 *      Example path:
 *        ./core/CoreApp.jsx
 *        ./core/components/clients/show/ClientDetailsInterface.jsx
 *        ./core/components/clients/show/ClientDetailsContainer.jsx
 *        ./core/components/network/NetworkInterface.jsx
 *        .sdf/components/network/NetworkInterface.jsx
 *        ./components/network/NetworkListInterface.jsx
 *        ./components/network/LocationDetails.jsx
 *        ./components/network/LocationDetailsSidebar.jsx
 *        ./components/maps/StaticMap.jsx
 *
 *      4 USES FOUND FOR: ./components/maps/StaticMap.jsx
 *
 */

// @flow
const {getProfile, moduleMatch, dependentsTree} = require('../lib/webpack_utils.js');
const {renderErr} = require('../lib/utils.js');
const {getUses, renderUses} = require('../lib/uses.js');
const {treeIntersect} = require('../lib/tree_utils.js');

const argv = require('yargs').
  demand(1, 1, 'Please specify a module!').
  option('p', {
    alias: 'profilePath',
    default: 'tmp/profile.json',
    describe: 'Location of the profile.json file',
    type: 'string',
  }).
  option('f', {
    alias: 'forceRegenProfile',
    default: 'false',
    describe: 'Force regeneration of webpack profile (Slow!)',
    type: 'boolean',
  }).
  option('r', {
    alias: 'root',
    describe: 'The "root" to of the graph to restrict the search to. If passed, the script will only return results that are within this subgraph.',
    type: 'string',
  }).
  option('d', {
    alias: 'depth',
    default: '1',
    describe: 'How deep the use paths should be. Ie, if this is 2, the script will not only find the direct users of the passed component, but also the direct users of *those* direct users, and, for each combination, give you an example path.',
    type: 'number',
  }).
  help().
  wrap(120).
  argv;

const run = (profilePromise, startQuery: string, rootQuery: ?string, depth) => {
  profilePromise.then((modules) => {
    const findModule = moduleMatch.bind(null, modules);
    const startName = findModule(startQuery);
    if (!startName) {
      // We failed to look up the desired module in profile.
      renderErr(`Error: Couldn't find module ${startQuery}!`);
      return;
    }

    const rootName = rootQuery != null ? findModule(rootQuery) : null;
    if (rootQuery != null && !rootName) {
      // We failed to look up the desired module in profile.
      renderErr(`Error: Couldn't find module ${rootQuery}!`);
      return;
    }

    // Consider subsuming into getUses?
    var moduleTree = dependentsTree(modules, startName);
    if (rootName) {
      moduleTree = treeIntersect(moduleTree, rootName);
    }
    const uses = getUses(moduleTree, depth);
    console.log(renderUses(startName, rootName, depth, uses));
  });
};

const webpackLocation = argv.webpackPath;
const profileLocation = argv.profilePath;
const forceRegenProfile = argv.forceRegenProfile;
const startName = argv._[0];
const rootName = argv.root;
const depth = +argv.depth;

const profilePromise = getProfile(webpackPath, profileLocation, forceRegenProfile);
run(profilePromise, startName, rootName, depth);
