"use babel";

import {
  disposeEventListeners,
  focusElement,
  makeHTML,
  setTabIndex,
} from "./utilities/html-utility";
import {
  makeButton,
  makeCheckbox,
  //makeInputNumber,
  makeInputText,
  makeSelector,
} from "./utilities/atom-utility";
import SBC from "./sort-selected-elements";
import { stringToNumberArray } from "./utilities/utility";

export default class SBCView {
  constructor() {
    this.initialize();
    this.makeElements();
    this.makeRootElement();
    setTabIndex(this.tabStopElements);
  }

  initialize() {
    //this.subscriptions = new CompositeDisposable();
    this.eventListeners = [];
  }

  destroy() {
    this.rootElement.remove();
    //this.subscriptions.dispose();
    disposeEventListeners(this.eventListeners);
  }

  getElement() {
    return this.rootElement;
  }

  makeElements() {
    this.closeButton = makeButton([SBC.name, "close"], "", false, "normal", "no-color", "no-inline", "icon-x",
      null, null,
      SBCView.callFunc(SBC, "hidePanel", null), false, this.eventListeners);
    this.sortButton = makeButton([SBC.name, "sort"], "sort", false, "normal", "no-color", "no-inline", null, null, null,
      SBCView.callFunc(SBC, "sort", null), false, this.eventListeners);

    this.saveDefaultButton = makeButton([SBC.name, "saveDefault"], "saveDefault", false, "normal", "no-color", "no-inline", null, null, null,
      SBCView.callFunc(SBC, "setConfigs", null), false, this.eventListeners);
    this.loadDefaultButton = makeButton([SBC.name, "loadDefault"], "loadDefault", false, "normal", "no-color", "no-inline", null, null, null,
      SBCView.callFunc(SBC, "getConfigs", true), false, this.eventListeners);


    this.doInlineSortChecker = makeCheckbox([SBC.name, "doInlineSort"], "inline", SBC.sorter.doInlineSort,
      SBCView.setInput(SBC.sorter, "doInlineSort", "checker"), false, this.eventListeners);
    this.doIinesSortChecker = makeCheckbox([SBC.name, "doIinesSort"], "lines", SBC.sorter.doIinesSort,
      SBCView.setInput(SBC.sorter, "doIinesSort", "checker"), false, this.eventListeners);
    this.sortOrderSelector = makeSelector([SBC.name, "sortOrder"], ["alpha", "natural"], SBC.sorter.sortOrder,
      SBCView.setInput(SBC.sorter, "sortOrder", "selector"), false, this.eventListeners);
    //this.lineBreakSelector = makeSelector([SBC.name, "lineBreak"], ["LF", "CRLF"], SBC.sorter.lineBreak,
    //  SBCView.setInput(SBC.sorter, "lineBreak", "selector"), false, this.eventListeners);
    this.delimiterInput = makeInputText("search", [SBC.name, "delimiter"], "delimiter", SBC.sorter.delimiter,
      SBCView.setInput(SBC.sorter, "delimiter", "text"), false, this.eventListeners);
    this.inlineDirectionSelector = makeSelector([SBC.name, "inlineDirection"], ["asc", "desc"], SBC.sorter.inilineDirection,
      SBCView.setInput(SBC.sorter, "inlineDirection", "selector"), false, this.eventListeners);
    this.caseSensitiveChecker = makeCheckbox([SBC.name, "caseSensitive"], "case sensitive", SBC.sorter.caseSensitive,
      SBCView.setInput(SBC.sorter, "caseSensitive", "checker"), false, this.eventListeners);

    this.linesSortPrioritiesInput = makeInputText("search", [SBC.name, "linesSortPriorities"], "linesSortPriorities", SBC.sorter.linesSortPriorities,
      SBCView.setLinesSortConditioins(SBC.sorter, "linesSortPriorities"), false, this.eventListeners);
    this.linesSortDirectionsInput = makeInputText("search", [SBC.name, "linesSortDirections"], "linesSortDirections", SBC.sorter.linesSortDirections,
      SBCView.setLinesSortConditioins(SBC.sorter, "linesSortDirections"), false, this.eventListeners);

    this.tabStopElements = [
      this.sortButton,
      this.sortOrderSelector,
      this.delimiterInput,
      this.caseSensitiveChecker.firstChild,
      this.saveDefaultButton,
      this.loadDefaultButton,
      this.doIinesSortChecker.firstChild,
      this.linesSortPrioritiesInput,
      this.linesSortDirectionsInput,
      this.doInlineSortChecker.firstChild,
      this.inlineDirectionSelector,
      //this.closeButton,
    ];
  }

  makeRootElement() {
    this.rootElement = makeHTML([SBC.name], { "tag": "div", "class": ["root", "native-key-bindings"] }, [[], { "tag": "table" },
      [[], { "tag": "tr", "class": [""] },
        { "tag": "th", "class": [""] },
        [[], { "tag": "span" },
          this.sortButton,
        ],
        [[], { "tag": "span", "textContent": "order" },
          this.sortOrderSelector,
        ],
        //[[], { "tag": "span", "textContent": "line break" },
        //  this.lineBreakSelector,
        //],
        [[], { "tag": "span", "textContent": "delimitor" },
          this.delimiterInput,
        ],
        [[], { "tag": "span" },
          this.caseSensitiveChecker,
        ],
        [[], { "tag": "span" },
          this.saveDefaultButton,
        ],
        [[], { "tag": "span" },
          this.loadDefaultButton,
        ],
        //[[], { "tag": "span" },
          this.closeButton,
        //],
      ],
      [[], { "tag": "tr", "class": [""] },
        { "tag": "th", "class": [""] },
        [[], { "tag": "span" },
          this.doIinesSortChecker,
        ],
        [[], { "tag": "span", "textContent": "priorities" },
          this.linesSortPrioritiesInput,
        ],
        [[], { "tag": "span", "textContent": "directions" },
          this.linesSortDirectionsInput,
        ],
        [[], { "tag": "span" },
          this.doInlineSortChecker,
        ],
        [[], { "tag": "span" }, //"textContent": "inline direction" },
          this.inlineDirectionSelector,
        ],
      ],
    ]);
  }

  static callFunc(obj, funcName, param) {
    return (_evt) => {
      obj[funcName](param);
    };
  }

  static setInput(obj, property, type, selector = null) {
    return (evt) => {
      if (type === "number") {
        let num = parseInt(evt.target.value, 10);
        if (isNaN(num)) {
          num = 0;
        }
        obj[property] = num;
      } else if (type === "checker") {
        obj[property] = evt.target.checked;
      } else if (type === "selector" && selector !== null) {
          obj[property] = selector[evt.target.value];
      } else {
        obj[property] = evt.target.value;
      }
    };
  }

  static setLinesSortConditioins(obj, property) {
    return (evt) => {
      obj[property] = stringToNumberArray(evt.target.value, ",");
    };
  }

  update(doAll) {
    this.linesSortPrioritiesInput.value = SBC.sorter.linesSortPriorities.toString();
    this.linesSortDirectionsInput.value = SBC.sorter.linesSortDirections.toString();
    if (doAll === true) {
      this.sortOrderSelector.value = SBC.sorter.sortOrder;
      this.delimiterInput.value = SBC.sorter.delimiter;
      this.caseSensitiveChecker.firstChild.checked = SBC.sorter.caseSensitive;
      this.doIinesSortChecker.firstChild.checked = SBC.sorter.doIinesSort;
      this.doInlineSortChecker.firstChild.checked = SBC.sorter.doInlineSort;
      this.inlineDirectionSelector.value = SBC.sorter.inlineDirection;
    }
  }

  focusNext() {
    focusElement(this.tabStopElements, "next");
  }
  focusPrevious() {
    focusElement(this.tabStopElements, "previous");
  }
  initialFocus() {
    this.sortButton.focus();
    //this.delimiterInput.focus();
  }
}
