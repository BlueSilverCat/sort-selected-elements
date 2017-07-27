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
import SSE from "./sort-selected-elements";
import { stringToNumberArray } from "./utilities/utility";

export default class SSEView {
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
    this.closeButton = makeButton([SSE.name, "close"], "", false, "normal", "no-color", "no-inline", "icon-x",
      null, null,
      SSEView.callFunc(SSE, "hidePanel", null), false, this.eventListeners);
    this.sortButton = makeButton([SSE.name, "sort"], "sort", false, "normal", "no-color", "no-inline", null, null, null,
      SSEView.callFunc(SSE, "sort", null), false, this.eventListeners);

    this.saveDefaultButton = makeButton([SSE.name, "saveDefault"], "save", false, "normal", "no-color",
      "no-inline", null, null, null,
      SSEView.callFunc(SSE, "setConfigs", null), false, this.eventListeners);
    this.loadDefaultButton = makeButton([SSE.name, "loadDefault"], "load", false, "normal", "no-color",
      "no-inline", null, null, null,
      SSEView.callFunc(SSE, "getConfigs", true), false, this.eventListeners);

    this.directionSelector = makeSelector([SSE.name, "direction"], ["asc", "desc"],
      SSE.sorter.direction,
      this.changeDirection(), false, this.eventListeners);

    this.doInlineSortChecker = makeCheckbox([SSE.name, "doInlineSort"], "inline", SSE.sorter.doInlineSort,
      SSEView.setInput(SSE.sorter, "doInlineSort", "checker"), false, this.eventListeners);
    this.doLinesSortChecker = makeCheckbox([SSE.name, "doLinesSort"], "lines", SSE.sorter.doLinesSort,
      SSEView.setInput(SSE.sorter, "doLinesSort", "checker"), false, this.eventListeners);
    this.sortOrderSelector = makeSelector([SSE.name, "sortOrder"], ["alpha", "natural"], SSE.sorter.sortOrder,
      SSEView.setInput(SSE.sorter, "sortOrder", "selector"), false, this.eventListeners);
    this.separatorInput = makeInputText("search", [SSE.name, "separator"], "separator", SSE.sorter.separator,
      SSEView.setInput(SSE.sorter, "separator", "text"), false, this.eventListeners);
    this.caseSensitiveChecker = makeCheckbox([SSE.name, "caseSensitive"], "case sensitive", SSE.sorter.caseSensitive,
      SSEView.setInput(SSE.sorter, "caseSensitive", "checker"), false, this.eventListeners);

    this.linesSortPrioritiesInput = makeInputText("search", [SSE.name, "linesSortPriorities"], "linesSortPriorities",
      SSE.sorter.linesSortPriorities,
      SSEView.setLinesSortConditioins(SSE.sorter, "linesSortPriorities"), false, this.eventListeners);

    this.doUniqueFilterChecker = makeCheckbox([SSE.name, "doUniqueFilter"], "unique", SSE.sorter.doUniqueFilter,
      SSEView.setInput(SSE.sorter, "doUniqueFilter", "checker"), false, this.eventListeners);

    this.doEmptyFilterChecker = makeCheckbox([SSE.name, "doEmptyFilter"], "no empty", SSE.sorter.doEmptyFilter,
      SSEView.setInput(SSE.sorter, "doEmptyFilter", "checker"), false, this.eventListeners);

    this.tabStopElements = [
      this.sortButton,
      this.sortOrderSelector,
      this.directionSelector,
      this.separatorInput,
      this.caseSensitiveChecker.firstChild,
      this.saveDefaultButton,
      this.loadDefaultButton,
      this.doLinesSortChecker.firstChild,
      this.linesSortPrioritiesInput,
      this.doInlineSortChecker.firstChild,
      this.doUniqueFilterChecker.firstChild,
      this.doEmptyFilterChecker.firstChild,
      //this.closeButton,
    ];
  }

  makeRootElement() {
    this.rootElement = makeHTML([SSE.name], { "tag": "div", "class": ["root", "native-key-bindings"] },
      [[], { "tag": "table" },
        [[], { "tag": "tr", "class": [""] },
          { "tag": "th", "class": [""] },
          this.closeButton,
          [[], { "tag": "span" },
            this.sortButton,
          ],
          [[], { "tag": "div", "class": ["block", "general"] },
            [[], { "tag": "span" },
              this.sortOrderSelector,
            ],
            [[], { "tag": "span" },
              this.directionSelector,
            ],
            [[], { "tag": "span", "textContent": "separator" },
              this.separatorInput,
            ],
            [[], { "tag": "span" },
              this.caseSensitiveChecker,
            ],
          ],
          [[], { "tag": "div", "class": ["btn-group", "default"], "textContent": "" },
            [[], { "tag": "span" },
              this.saveDefaultButton,
              this.loadDefaultButton,
            ],
          ],
        ],
        [[], { "tag": "tr", "class": [""] },
          { "tag": "th", "class": [""] },
          [[], { "tag": "div", "class": ["block", "lines"] },
            [[], { "tag": "span" },
              this.doLinesSortChecker,
            ],
            [[], { "tag": "span", "textContent": "priorities" },
              this.linesSortPrioritiesInput,
            ],
          ],
          [[], { "tag": "div", "class": ["block", "inline"] },
            [[], { "tag": "span" },
              this.doInlineSortChecker,
            ],
          ],
          [[], { "tag": "div", "class": ["block", "filter"] },
            [[], { "tag": "span" },
              this.doUniqueFilterChecker,
            ],
            [[], { "tag": "span" },
              this.doEmptyFilterChecker,
            ],
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

  changeDirection() {
    return (evt) => {
      SSE.sorter.direction = evt.target.value;
      SSE.sorter.changeLinesSortDirections();
      this.update(false);
    };
  }

  update(doAll = false) {
    this.linesSortPrioritiesInput.value = SSE.sorter.linesSortPriorities.toString();
    if (doAll === true) {
      this.sortOrderSelector.value = SSE.sorter.sortOrder;
      this.separatorInput.value = SSE.sorter.separator;
      this.caseSensitiveChecker.firstChild.checked = SSE.sorter.caseSensitive;
      this.doUniqueFilterChecker.firstChild.checked = SSE.sorter.doUniqueFilter;
      this.doEmptyFilterChecker.firstChild.checked = SSE.sorter.doEmptyFilter;
      this.doLinesSortChecker.firstChild.checked = SSE.sorter.doLinesSort;
      this.directionSelector.value = SSE.sorter.direction;
      this.doInlineSortChecker.firstChild.checked = SSE.sorter.doInlineSort;
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
    //this.separatorInput.focus();
  }
}
