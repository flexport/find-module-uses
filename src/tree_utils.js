// @flow
const {includes, difference, flatMap} = require('lodash');

export type Tree<T> = {
  value: T,
  children: Array<Tree<T>>,
};

type ModuleT = {
  id: string,
  reasons: Array<{
    moduleId: string,
  }>,
};

const reduceTree = <A, B>(tree: Tree<A>, memo: B, func: (B, Tree<A>) => B): B => {
  const headRes = func(memo, tree);
  return tree.children.reduce((res, child) => reduceTree(child, res, func), headRes);
};

const flattenTree = <T>(node: Tree<T>): Array<T> => {
  return reduceTree(node, ([]: Array<T>), (array, node) => array.concat(node.value));
};

const treeFromHash = <T>(hash: { [T]: Array<T> }, start: T, seen = ([]: Array<*>)): Tree<T> => {
  seen = seen.concat(start);
  const childVals = difference(hash[start], seen);
  return ({
    value: start,
    children: childVals.map((child) => treeFromHash(hash, child, seen)),
  });
};

const treeToFlippedHash = <T>(tree: Tree<T>): { [T]: Array<T> } => {
  var seen = [];
  return reduceTree(tree, {}, (hash, node) => {
    if (includes(seen, node.value)) {
      return hash;
    }
    seen = seen.concat(node.value);
    node.children.forEach((child) => {
      const childVal: any = child.value;
      if (!hash[childVal]) {
        hash[childVal] = [];
      }
      hash[childVal].push(node.value);
    });
    return hash;
  });
};

const treeIntersect = <T>(tree: Tree<T>, otherVal: T): Tree<T> => {
  const originalVal = tree.value;

  const flippedHash = treeToFlippedHash(tree);
  const flippedTree = treeFromHash(flippedHash, otherVal);

  const reFlippedHash = treeToFlippedHash(flippedTree);
  return treeFromHash(reFlippedHash, originalVal);
};

const trimTree = <T>(node: Tree<T>, trimmedValues: Array<T>): Tree<T> => {
  var children;
  if (includes(trimmedValues, node.value)) {
    children = [];
  } else {
    children = node.children.map((child) => trimTree(child, trimmedValues));
  }

  return ({
    value: node.value,
    children: children,
  });
};

const treeToPaths = <T>(tree: Tree<T>, depth?: number): Array<Array<T>> => {
  if (tree.children.length === 0 || (depth && depth === 1)) {
    return [[tree.value]];
  }
  const childPaths = flatMap(tree.children, (child) => treeToPaths(child, depth ? depth - 1 : depth));
  return childPaths.map((childPath) => {
    return [tree.value].concat(childPath);
  });
};

const treeToExamplePath = <T>(tree: Tree<T>): Array<T> => {
  if (tree.children.length === 0) {
    return [tree.value];
  } else {
    return [tree.value].concat(treeToExamplePath(tree.children[0], 0));
  }
};

const treeAtPath = <T>(tree: Tree<T>, path: Array<T>): ?Tree<T> => {
  const child = tree.children.find(({value}) => value === path[0]);
  if (!child || path.length === 1) {
    return child;
  } else {
    return treeAtPath(child, path.slice(1));
  }
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

module.exports = {
  treeToPaths,
  treeToExamplePath,
  treeAtPath,
  treeIntersect,
  trimTree,
  flattenTree,
  dependenciesTree,
  dependentsTree,
};
