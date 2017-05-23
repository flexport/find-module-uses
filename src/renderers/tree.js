// @flow
/* eslint-disable no-console */
const {includes} = require('lodash');
const {flattenTree} = require('../tree_utils.js');
import type {Tree} from '../tree_utils';

const renderTree = (tree: Tree<string>, ignoreNames: Array<string>, maxDepth: number, indent: number = 0) => {
  var output = '';

  const isTrimmed = maxDepth === 0 || includes(ignoreNames, tree.value);
  const offsetString = ' '.repeat(indent);
  if (isTrimmed) {
    const trimCount = flattenTree(tree).length - 1;
    output += `${offsetString}${tree.value} (Excluded, ${trimCount} child modules hidden)\n`;
    return output;
  } else {
    output += `${offsetString}${tree.value}\n`;
  }

  output += tree.children.reduce((output, c) => output += renderTree(c, ignoreNames, maxDepth - 1, indent + 4), '');
  return output;
};

module.exports = renderTree;
