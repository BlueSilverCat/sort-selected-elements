"use babel";

import { caseSensitiveCompare, filterArray, filterArrayThreshold, naturalSortCompare, uniqueArray } from "./utilities/utility";

export class Sorter {
  constructor() {
    this.doInlineSort = false;
    this.doIinesSort = true;
    this.sortOrder = "alpha"; //"alphabetically", "natural"
    //this.lineBreak = "LF"; //"CRLF", "LF" 分けなくても正常に動くようだ。検出して操作するのが確実ではある
    this.delimiter = " ";
    this.inlineDirection = "asc"; //"asc": "ascending", "desc": "descending"
    this.caseSensitive = true; //true: case sensitive, false: case insensitive
    this.linesSortPriorities = [];
    this.linesSortDirections = []; //1: "ascending", -1: "descending"

    this.inlineCompareFunc = this.getInlineCompare(); // or bind
    this.linesCompareFunc = this.getLinesCompare(); // or bind
  }

  getCompareFunc() {
    if (this.sortOrder === "natural") {
      return naturalSortCompare;
    }
    return caseSensitiveCompare;
  }
  //getLineBreak() {
  //  if (this.lineBreak === "CRLF") {
  //    return "\r\n";
  //  }
  //  return "\n";
  //}
  getInlineDirection() {
    if (this.inlineDirection === "desc") {
      return -1;
    }
    return 1;
  }
  setDefaultLinesSortPriorities(len) {
    this.linesSortPriorities = [];
    for (let i = 0; i < len; i++) {
      this.linesSortPriorities[i] = i;
    }
  }
  setDefaultLinesSortDirections(len) {
    this.linesSortDirections = [];
    for (let i = 0; i < len; i++) {
      this.linesSortDirections[i] = 1;
    }
  }

  checkLinesSortConditions(len) {
    this.linesSortPriorities = uniqueArray(this.linesSortPriorities);
    this.linesSortPriorities = filterArrayThreshold(this.linesSortPriorities, 0, len - 1);
    this.linesSortDirections = filterArray(this.linesSortDirections, [-1, 1]);

    //console.log(len);
    //console.log(this.linesSortPriorities);
    //console.log(this.linesSortDirections);

    if (this.linesSortPriorities.length === 0) {
      this.setDefaultLinesSortPriorities(len);
    }
    if (this.linesSortDirections.length === 0) {
      this.setDefaultLinesSortDirections(len);
    }
  }

  getInlineCompare() { //or bind
    let that = this;
    return function inlineCompare(x, y) {
      let result = that.getCompareFunc()(x, y, that.caseSensitive);
      return result * that.getInlineDirection();
    };
  }
  getLinesCompare() { //or bind
    let that = this;
    return function linesCompare(x, y) {
      for (let k = 0; k < that.linesSortPriorities.length; ++k) {
        if (!(Array.isArray(x) && that.linesSortPriorities[k] < x.length &&
            Array.isArray(y) && that.linesSortPriorities[k] < y.length)) {
          break;
        }
        let i = x[that.linesSortPriorities[k]];
        let j = y[that.linesSortPriorities[k]];
        let result = that.getCompareFunc()(i, j, that.caseSensitive);
        if (result !== 0) {
          if (that.linesSortDirections.length < k) { //linesSortDirectionsには-1, 1しか入っていない
            return result * that.linesSortDirections[k];
          }
          return result;
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
    let lines = string.split("\n");
    let numberOfKeys = 0;

    for (let i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].split(this.delimiter);
      if (numberOfKeys < lines[i].length) {
        numberOfKeys = lines[i].length;
      }
    }
    return [numberOfKeys, lines];
  }

  sort(string) {
    let numberOfKeys = 0;
    let lines = [];
    [numberOfKeys, lines] = this.split(string);

    if (this.doIinesSort) {
      this.checkLinesSortConditions(numberOfKeys);
      lines.sort(this.linesCompareFunc);
    }

    for (let i = 0; i < lines.length; ++i) {
      if (this.doInlineSort) {
        lines[i].sort(this.inlineCompareFunc);
      }
      lines[i] = lines[i].join(this.delimiter);
    }
    return lines.join("\n");
  }


  static removeTailLineBreak(string) {
    const kCheckLineBreakRegex = /\n$/;
    if (kCheckLineBreakRegex.test(string)) {
      return [true, string.replace(kCheckLineBreakRegex, "")];
    }
    return [false, string];
  }
  static appendTailLineBreak(string, flag) {
    if (flag === true) {
      return `${string}\n`;
    }
    return string;
  }
}
