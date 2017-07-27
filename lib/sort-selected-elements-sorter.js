"use babel";

import { caseSensitiveCompare, naturalSortCompare, uniqueFilter } from "./utilities/utility";

export class Sorter {
  constructor() {
    this.sortOrder = "alpha"; //"alphabetically", "natural"
    this.separator = " ";
    this.direction = "asc"; //"asc": "ascending", "desc": "descending"
    this.caseSensitive = true; //true: case sensitive, false: case insensitive

    this.doInlineSort = false;

    this.doLinesSort = true;
    this.linesSortPriorities = []; //negative number is descending. start is 1

    this.doUniqueFilter = false;
    this.doEmptyFilter = false;

    this.inlineCompareFunc = this.getInlineCompare(); // or bind
    this.linesCompareFunc = this.getLinesCompare(); // or bind
    this.lastNumberOfKeys = 0; //表示する?
  }

  getCompareFunc() {
    if (this.sortOrder === "natural") {
      return naturalSortCompare;
    }
    return caseSensitiveCompare;
  }
  getDirection() {
    if (this.direction === "desc") {
      return -1;
    }
    return 1;
  }

  setDefaultLinesSortPriorities() {
    let direction = this.getDirection();
    this.linesSortPriorities = [];
    for (let i = 0; i < this.lastNumberOfKeys; ++i) {
      this.linesSortPriorities[i] = (i + 1) * direction; //1--n
    }
  }
  changeLinesSortDirections() {
    let direction = this.getDirection();
    for (let i = 0; i < this.linesSortPriorities.length; ++i) {
      this.linesSortPriorities[i] = Math.abs(this.linesSortPriorities[i]) * direction;
    }
  }

  checkLinesSortConditions() {
    this.linesSortPriorities = this.linesSortPriorities.filter(Sorter.filterLinesPriorities);

    if (this.linesSortPriorities.length === 0) {
      this.setDefaultLinesSortPriorities();
    }
  }

  getInlineCompare() { //or bind
    let that = this;
    return function inlineCompare(x, y) {
      let result = that.getCompareFunc()(x, y, !that.caseSensitive);
      return result * that.getDirection();
    };
  }
  getLinesCompare() { //or bind
    let that = this;
    return function linesCompare(x, y) {
      for (let k = 0; k < that.linesSortPriorities.length; ++k) {
        if (!(Array.isArray(x) && Math.abs(that.linesSortPriorities[k]) - 1 < x.length &&
            Array.isArray(y) && Math.abs(that.linesSortPriorities[k]) - 1 < y.length)) {
          break;
        }
        let i = x[Math.abs(that.linesSortPriorities[k]) - 1];
        let j = y[Math.abs(that.linesSortPriorities[k]) - 1];
        let result = that.getCompareFunc()(i, j, !that.caseSensitive);
        if (result !== 0) {
          return result * Math.sign(that.linesSortPriorities[k]);
        }
      }
      return 0;
    };
  }

  preSort(string) {
    let workString = "";
    let lineBreakFlag = false;

    [lineBreakFlag, workString] = Sorter.removeTailLineBreak(string);
    workString = this.sort(workString);
    return Sorter.appendTailLineBreak(workString, lineBreakFlag);
  }

  split(string) {
    let lines = string.split(/\r?\n/);
    this.lastNumberOfKeys = 0;

    if (this.doEmptyFilter === true && this.doLinesSort === true) {
      lines = lines.filter(Sorter.filterLargerZero);
    }
    if (this.doUniqueFilter === true && this.doLinesSort === true) {
      lines = lines.filter(uniqueFilter);
    }

    for (let i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].split(this.separator);

      if (this.doEmptyFilter === true && this.doInlineSort === true) {
        lines[i] = lines[i].filter(Sorter.filterLargerZero);
      }
      if (this.doUniqueFilter === true && this.doInlineSort === true) {
        lines[i] = lines[i].filter(uniqueFilter);
      }

      if (this.lastNumberOfKeys < lines[i].length) {
        this.lastNumberOfKeys = lines[i].length;
      }
    }
    return lines;
  }
  join(lines) {
    for (let i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].join(this.separator);
    }
    return lines.join("\n"); //editor.insertText "normalizeLineEndings": true
  }

  linesSort(lines) {
    if (this.doLinesSort === true) {
      this.checkLinesSortConditions(this.lastNumberOfKeys);
      lines.sort(this.linesCompareFunc);
    }
  }
  inlineSort(lines) { //joinと分けるとfor文が増える
    if (this.doInlineSort === true) {
      for (let i = 0; i < lines.length; ++i) {
        lines[i].sort(this.inlineCompareFunc);
      }
    }
  }

  sort(string) {
    let lines = [];
    lines = this.split(string);
    this.inlineSort(lines);
    this.linesSort(lines);
    return this.join(lines);
  }

  static removeTailLineBreak(string) {
    const kCheckLineBreakRegex = /\r?\n$/;
    if (kCheckLineBreakRegex.test(string)) {
      return [true, string.replace(kCheckLineBreakRegex, "")];
    }
    return [false, string];
  }
  static appendTailLineBreak(string, flag) {
    if (flag === true) {
      return `${string}\n`; //editor.insertText "normalizeLineEndings": true
    }
    return string;
  }

  static filterLargerZero(e, _i, _arr) {
    return e.length > 0;
  }

  //0と絶対値が同じ数値を許さない
  static filterLinesPriorities(e, i, arr) {
    return e !== 0 &&
      arr.indexOf(e) === i && (
        arr.indexOf(-e) === -1 ||
        arr.indexOf(-e) >= i
      );
  }
}
