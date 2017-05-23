// @flow
/* eslint-disable no-console */
const {includes} = require('lodash');
import type {Tree} from '../tree_utils';

const toGraphvizId = (value: string): string => {
  return value.slice(2).replace(/\/([^/]+)$/, '\\n$1');
};

const renderGraphvizRecursively = (tree: Tree<string>, ignoreNames, depth) => {
  if (depth === 0 || includes(ignoreNames, tree.value)) {
    return '';
  }

  var output = '';
  tree.children.forEach(({value: childVal}) => {
    output += `  "${toGraphvizId(tree.value)}" -> "${toGraphvizId(childVal)}";\n`;
  });
  tree.children.forEach((child) => {
    output += renderGraphvizRecursively(child, ignoreNames, depth - 1);
  });
  return output;
};

const renderGraphviz = (moduleTree: Tree<string>, ignoreNames: Array<string>, depth: number) => {
  var output = '';
  output += 'strict digraph {\n';
  output += renderGraphvizRecursively(moduleTree, ignoreNames, depth);
  output += '}';
  return output;
};

module.exports = renderGraphviz;
