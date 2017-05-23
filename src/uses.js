const {treeIntersect, treeAtPath, treeToPaths, treeToExamplePath} = require('./tree_utils');

const renderUses = (startName, rootName, depth, paths) => {
  var output = '';

  paths.forEach(([user, path]) => {
    output += 'Directly used by:\n';
    user.reverse().slice(0, user.length - 1).forEach((module) => {
      output += `  ${module}\n`;
    });
    output += 'Example path:\n';
    path.reverse().forEach((module) => {
      output += `  ${module}\n`;
    });
    output += '\n';
  });

  if (paths.length === 0 && rootName) {
    output += '******** DANGER ********\n';
    output += `No use of ${startName} found under ${rootName}!`;
    output += 'Consider doing a global search (don\'t pass -r) instead?\n';
    output += '******** DANGER ********\n';
  } else if (paths.length === 0) {
    output += '******** DANGER ********\n';
    output += `No use of ${startName} found !\n`;
    output += '******** DANGER ********\n';
  } else if (paths.length === 1) {
    output += '******** DANGER ********\n';
    output += `Only one direct use of ${startName} found! Is that what you expected?\n`;
    output += `Consider increasing depth (Current depth: ${depth})\n`;
    output += '******** DANGER ********\n';
  } else {
    output += `${paths.length} USES FOUND FOR: ${startName}\n`;
  }
  return output;
};

const getUses = (moduleTree: *, depth: number) => {
  const usePaths = treeToPaths(moduleTree, depth + 1)

  if (usePaths.length === 1 && usePaths[0].length === 1) {
    return [];
  }

  const uses = usePaths.map((path) => {
    const subTree = treeAtPath(moduleTree, path.slice(1));
    const examplePath = treeToExamplePath(subTree);
    return [path, path.concat(examplePath)];
  });
  return uses;
};

module.exports = {
  renderUses,
  getUses,
}
