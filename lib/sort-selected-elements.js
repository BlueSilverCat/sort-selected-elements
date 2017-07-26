"use babel";

import { isEmptyString, stringToNumberArray } from "./utilities/utility";
import { CompositeDisposable } from "atom";
import SBCView from "./sort-selected-elements-view";
import { Sorter } from "./sort-selected-elements-sorter.js";
import { replaceSelected } from "./utilities/atom-utility";

export default {
  "config": {
    "autoFocus": {
      "order": 1,
      "type": "boolean",
      "description": "If set this to ture, autofocus on panel",
      "default": true,
    },
    "defaultSortOrder": {
      "order": 1,
      "type": "string",
      "description": "default sortOrder",
      "default": "alpha",
      "enum": ["alpha", "natural"],
    },
    "defaultDelimiter": {
      "order": 2,
      "type": "string",
      "description": "default delimiter",
      "default": " ",
    },
    "defaultCaseSensitive": {
      "order": 3,
      "type": "boolean",
      "description": "default caseSensitive",
      "default": true,
    },
    "defaultDoLinesSort": {
      "order": 4,
      "type": "boolean",
      "description": "default doLinesSort", //"If this value is true, this package sort lines.",
      "default": true,
    },
    "defaultLinesSortPriorities": {
      "order": 5,
      "type": "string",
      "description": "default linesSortPriorities",
      "default": "",
    },
    "defaultLinesSortDirections": {
      "order": 6,
      "type": "string",
      "description": "default linesSortDirections",
      "default": "",
    },
    //"defaultLineBreak": {
    //  "order":,
    //  "type": "string",
    //  "description": "default lineBreak",
    //  "default": "LF",
    //  "enum": ["LF", "CRLF"],
    //},
    "defaultDoInlineSort": {
      "order": 7,
      "type": "boolean",
      "description": "default doInlineSort", //"If this value is true, this package sort inline elements.",
      "default": false,
    },
    "defaultInlineDirection": {
      "order": 8,
      "type": "string",
      "description": "default inlineDirection",
      "default": "asc",
      "enum": ["asc", "desc"],
    },
  },

  "name": "sort-selected-elements",
  activate() {
    this.sorter = new Sorter();
    this.sBCView = new SBCView();
    this.panel = atom.workspace.addBottomPanel({
      "item": this.sBCView.getElement(),
      "visible": false,
      "className": this.name,
    });

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add("atom-workspace", {
      "sort-selected-elements:panel": () => { this.togglePanel(); },
      "sort-selected-elements:sort": () => { this.sort(); },
      "sort-selected-elements:settings": () => { this.settings(); },

      "core:cancel": () => { this.hidePanel(); },
      //"core:close": () => { this.hidePanel(); },
    }));

    this.subscriptions.add(atom.commands.add(this.sBCView.rootElement, {
      "sort-selected-elements:focusNext": () => { this.sBCView.focusNext(); },
      "sort-selected-elements:focusPrevious": () => { this.sBCView.focusPrevious(); },
    }));

    this.getConfigs(false);
  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.sBCView.destroy();
  },

  getConfigs(doUpdate = false) {
    this.autoFocus = atom.config.get(`${this.name}.autoFocus`);

    this.sorter.doInlineSort = atom.config.get(`${this.name}.defaultDoInlineSort`);
    this.sorter.doLinesSort = atom.config.get(`${this.name}.defaultDoLinesSort`);
    this.sorter.sortOrder = atom.config.get(`${this.name}.defaultSortOrder`);
    //this.sorter.lineBreak = atom.config.get(`${this.name}.defaultLineBreak`);
    this.sorter.delimiter = atom.config.get(`${this.name}.defaultDelimiter`);
    this.sorter.inlineDirection = atom.config.get(`${this.name}.defaultInlineDirection`);
    this.sorter.caseSensitive = atom.config.get(`${this.name}.defaultCaseSensitive`);
    this.sorter.linesSortPriorities = stringToNumberArray(atom.config.get(`${this.name}.defaultLinesSortPriorities`, ","));
    this.sorter.linesSortDirections = stringToNumberArray(atom.config.get(`${this.name}.defaultLinesSortDirections`, ","));

    if (doUpdate === true) {
      this.sBCView.update(true);
    }
  },
  setConfigs() {
    atom.config.set(`${this.name}.defaultDoInlineSort`, this.sorter.doInlineSort);
    atom.config.set(`${this.name}.defaultDoLinesSort`, this.sorter.doLinesSort);
    atom.config.set(`${this.name}.defaultSortOrder`, this.sorter.sortOrder);
    //atom.config.set(`${this.name}.defaultLineBreak`, this.sorter.lineBreak);
    atom.config.set(`${this.name}.defaultDelimiter`, this.sorter.delimiter);
    atom.config.set(`${this.name}.defaultInlineDirection`, this.sorter.inlineDirection);
    atom.config.set(`${this.name}.defaultCaseSensitive`, this.sorter.caseSensitive);
    atom.config.set(`${this.name}.defaultLinesSortPriorities`, this.sorter.linesSortPriorities.toString());
    atom.config.set(`${this.name}.defaultLinesSortDirections`, this.sorter.linesSortDirections.toString());
  },

  settings() {
    atom.workspace.open(`atom://config/packages/${this.name}`);
  },

  togglePanel() {
    if (this.panel.isVisible()) {
      this.panel.hide();
    } else {
      this.panel.show();
      if (this.autoFocus === true) {
        this.sBCView.initialFocus();
      }
    }
  },

  hidePanel() {
    this.panel.hide();
  },

  sort() {
    let editor = atom.workspace.getActiveTextEditor();
    if (isEmptyString(editor)) {
      return;
    }

    let selected = editor.getSelectedText();
    selected = this.sorter.preSort(selected);
    this.sBCView.update();
    replaceSelected(selected, editor);
  },
};
