#! /usr/bin/env node

/**
 *   A li'l utility to visualize the dependents tree of a given js module. Ie,
 *   all the things that use that js module. Makes it easier to find things that
 *   might be affected by any code changes you make!
 *
 *   NOTE: For greater detail and more examples, see:
 *   https://github.com/flexport/flexport/pull/13607
 *
 * =============================================================================
 * BASIC USAGE
 * =============================================================================
 *
 *     $ yarn list-deps -- $module
 *
 *   This will list the dependents of `$module` a linearish format. If you
 *   don't pass the exact name of a module, the script'll try to find one
 *   that matches, though be aware it just searches by substring match. To
 *   not overwhelm you, the hierarchy is limited to 5 levels by default, but
 *   that can be overriden (see below).
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
 *   -e, --exclude            Modules to exclude from the hierarchy (Multiple allowed)
 *                            [string] [default: []]
 *
 *   -d, --depth              How deep of a hierarchy to display
 *                            [number] [default: "5"]
 *
 *   -m, --mode               Visualization mode. There are three available:
 *                            * flat: lists each layer of dependents as a flat list
 *                            * tree: prints out a formatted tree
 *                            * graphviz: prints the tree in the graphviz format
 *                              (use http://www.webgraphviz.com/ or dot to
 *                              visualize)
 *                            [string] [default: "tree"]
 *
 *   --help                   Show help
 *                            [boolean]
 *
 * =============================================================================
 * EXAMPLE
 * =============================================================================
 *
 *   $ yarn list-deps -- TimePicker
 *     ./components/form/TimePicker.jsx
 *        ./components/form/DateAndTimeField.jsx
 *            ./dispatch/components/deliveries/DeliveryDateModal.jsx
 *                ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
 *                    ./dispatch/components/deliveries/DeliveryHeader.jsx
 *                        ./dispatch/components/deliveries/Delivery.jsx (Excluded, 6 child modules hidden)
 *        ./components/form/TimeField.jsx
 *            ./components/form/TimeRangeField.jsx
 *                ./dispatch/components/deliveries/DeliveryDateModal.jsx
 *                    ./dispatch/components/deliveries/actionItems/DeliveryActionItems.jsx
 *                        ./dispatch/components/deliveries/DeliveryHeader.jsx (Excluded, 7 child modules hidden)
 *                ./core/components/shipments/action_items/DeliveryAppointmentScheduleActionItem.jsx
 *                    ./core/components/shipments/show/ShipmentActionItems.jsx
 *                        ./core/components/shipments/show/ShipmentView.jsx (Excluded, 17 child modules hidden)
 *        ./components/form/TimePickerContainer.jsx
 */

/* eslint-disable no-console */
// @flow
const {isArray} = require('lodash');

const {dependentsTree, getProfile, moduleMatch} = require('../lib/webpack_utils.js');
const {treeIntersect} = require('../lib/tree_utils.js');
const {renderErr} = require('../lib/utils.js');
const renderGraphviz = require('../lib/renderers/graphviz.js');
const renderTree = require('../lib/renderers/tree.js');
const renderLevels = require('../lib/renderers/levels.js');

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
    describe: 'Root from which to find dependents',
    type: 'string',
  }).
  option('e', {
    alias: 'exclude',
    describe: 'Modules to exclude from the hierarchy (Multiple allowed)',
    default: [],
    type: 'string',
  }).
  option('m', {
    alias: 'mode',
    default: 'tree',
    describe: 'Visualization mode. There are three available:\n* flat: lists each layer of dependents as a flat list.\n* tree: prints out a formatted tree\n* graphviz: prints the tree in the graphviz format (use http://www.webgraphviz.com/ or dot to visualize)',
    type: 'string',
  }).
  option('d', {
    alias: 'depth',
    default: '5',
    describe: 'How deep of a hierarchy to display',
    type: 'number',
  }).
  help().
  wrap(120).
  argv;

const run = (profilePromise, startQuery: string, rootQuery: ?string, ignoreQueries: Array<string>, mode: string, depth: number) => {
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

    // Flow is dumb about type refinement
    const ignoreNames: Array<any> = ignoreQueries.map((query) => {
      return findModule(query) || {err: query};
    });
    if (ignoreNames.some(({err}) => err)) {
      // We failed to look up one of the exclusions.
      ignoreNames.filter(({err}) => err).forEach(({err}) => {
        renderErr(`Error: Couldn't find module ${err}!`);
      });
      return;
    }

    var moduleTree = dependentsTree(modules, startName);
    if (rootName) {
      moduleTree = treeIntersect(moduleTree, rootName);
    }
    if (mode === 'tree') {
      console.log(renderTree(moduleTree, ignoreNames, depth));
    } else if (mode === 'graphviz') {
      console.log(renderGraphviz(moduleTree, ignoreNames, depth));
    } else if (mode === 'flat') {
      console.log(renderLevels(moduleTree, ignoreNames, depth));
    } else {
      renderErr(`Unknown mode: ${mode}`);
    }
  });
};

const profileLocation = argv.profilePath;
const forceRegenProfile = argv.forceRegenProfile;
const startName = argv._[0];
const rootName = argv.root;
const ignoreNames = isArray(argv.exclude) ? argv.exclude : [argv.exclude];
const depth = +argv.depth;
const mode = argv.mode;

const profilePromise = getProfile(profileLocation, forceRegenProfile);
run(profilePromise, startName, rootName, ignoreNames, mode, depth);
