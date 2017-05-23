// @flow
/* eslint-disable no-console */
const {includes, uniqBy, flatMap, difference} = require('lodash');
const {trimTree, flattenTree} = require('../tree_utils.js');
import type {Tree} from '../tree_utils';

const formatNode = (node: Tree<string>, trimmedValues: Array<string>, visibleValues: Array<string>) => {
  if (includes(trimmedValues, node.value)) {
    const subtree = uniqBy(flattenTree(node).slice(1), (value) => value);
    const hiddenCount = difference(subtree, visibleValues).length;
    return {value: node.value, trimmed: true, hiddenCount: hiddenCount};
  } else {
    return {value: node.value, trimmed: false, hiddenCount: 0};
  }
};

type RenderedNode = {
  value: string,
  trimmed: boolean,
  hiddenCount: number,
};

const linearizeGraphRecursively = (
  nodes: Array<Tree<string>>,
  trimmedValues: Array<string>,
  visibleValues: Array<string>,
  displayedValues: Array<string>
) => {
  nodes = nodes.filter(({value}) => !includes(displayedValues, value));
  nodes = uniqBy(nodes, ({value}) => value);
  const nodeVals = nodes.map(({value}) => value);
  displayedValues = displayedValues.concat(nodeVals);

  if (nodes.length === 0) {
    return [];
  }

  const thisLevel = nodes.map((node) => {
    return formatNode(node, trimmedValues, visibleValues);
  });

  const untrimmedNodes = nodes.filter(({value}) => !includes(trimmedValues, value));
  const children = flatMap(untrimmedNodes, ({children}) => children);
  const otherLevels = linearizeGraphRecursively(children, trimmedValues, visibleValues, displayedValues);

  return [thisLevel].concat(otherLevels);
};

const linearizeGraph = (
  node: Tree<string>,
  trimmedValues: Array<string>
): Array<Array<RenderedNode>> => {
  const visibleValues = flattenTree(trimTree(node, trimmedValues));
  return linearizeGraphRecursively([node], trimmedValues, visibleValues, []);
};

const renderLevels = (moduleTree: Tree<string>, ignoreNames: Array<string>, depth: number) => {
  const levels = linearizeGraph(moduleTree, ignoreNames).slice(0, depth + 1);

  return levels.reduce((output, modules, idx) => {
    if (idx === 0) {
      output += 'ROOT MODULE:\n';
    } else {
      output += `Level ${idx}\n`;
    }
    output += modules.reduce((output, module) => {
      if (module.trimmed) {
        return output + `${module.value} (Excluded, ${module.hiddenCount} child modules hidden)\n`;
      } else {
        return output + `${module.value}\n`;
      }
    }, '');
    return output + '\n';
  }, '');
};

module.exports = renderLevels;
