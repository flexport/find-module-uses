// @flow
/* eslint-disable no-console */
const {includes} = require('lodash');
import type {Tree} from '../tree_utils';

const toGraphvizId = (value: string): string => {
  return value.slice(2).replace(/\/([^/]+)$/, '\\n$1');
};

const renderGraphvizRecursively = (tree: Tree<string>, ignoreNames, depth) => {
  if (depth === 0 || includes(ignoreNames, tree.value)) {
    return;
  }

  tree.children.forEach(({value: childVal}) => {
    console.log(`  "${toGraphvizId(tree.value)}" -> "${toGraphvizId(childVal)}";`);
  });
  tree.children.forEach((child) => {
    renderGraphvizRecursively(child, ignoreNames, depth - 1);
  });
};

const renderGraphviz = (moduleTree: Tree<string>, ignoreNames: Array<string>, depth: number) => {
  console.log('strict digraph {');
  renderGraphvizRecursively(moduleTree, ignoreNames, depth);
  console.log('}');
};

module.exports = renderGraphviz;
