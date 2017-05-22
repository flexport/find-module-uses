// @flow
/* eslint-disable no-console */
const {includes} = require('lodash');
const {flattenTree} = require('../tree_utils.js');
import type {Tree} from '../tree_utils';

const renderTree = (tree: Tree<string>, ignoreNames: Array<string>, maxDepth: number, indent: number = 0) => {
  const isTrimmed = maxDepth === 0 || includes(ignoreNames, tree.value);
  const offsetString = ' '.repeat(indent);
  if (isTrimmed) {
    const trimCount = flattenTree(tree).length - 1;
    console.log(`${offsetString}${tree.value} (Excluded, ${trimCount} child modules hidden)`);
    return;
  } else {
    console.log(`${offsetString}${tree.value}`);
  }

  tree.children.forEach((c) => renderTree(c, ignoreNames, maxDepth - 1, indent + 4));
};

module.exports = renderTree;
