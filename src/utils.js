/* eslint-disable no-console */
// @flow
const {statSync} = require('fs');

const renderErr = (err: string) => {
  // TODO: Actually deal with this?
  console.error(err);
  return;
};

const arrToEnglish = (arr: Array<string>, inter: string, last: string, oxford: string) => {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]}${inter}${arr[1]}`;
  } else {
    const allButLast = arr.slice(0, arr.length - 1).join(inter);
    const last = arr[arr.length - 1];

    return `${allButLast}${oxford}${last}`;
  }
};

const fileIsPresent = (path: string) => {
  try {
    statSync(path);
    return true;
  } catch (_) {
    return false;
  }
};

const matchSuffixes = <T>(haystack: Array<T>, needle: Array<T>): boolean => {
  return needle.every((val, idx) => {
    const haystackVal = haystack[haystack.length - needle.length + idx];
    return haystackVal === val;
  });
};

module.exports = {
  fileIsPresent,
  renderErr,
  arrToEnglish,
  matchSuffixes,
};
