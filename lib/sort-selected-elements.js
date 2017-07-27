"use babel";

import { CompositeDisposable } from "atom";
import SSEView from "./sort-selected-elements-view";
import { Sorter } from "./sort-selected-elements-sorter.js";
import { isEmptyString } from "./utilities/utility";
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
      "order": 2,
      "type": "string",
      "description": "default sortOrder",
      "default": "alpha",
      "enum": ["alpha", "natural"],
    },
    "defaultDirection": {
      "order": 3,
      "type": "string",
      "description": "default Direction",
      "default": "asc",
      "enum": ["asc", "desc"],
    },
    "defaultSeparator": {
      "order": 4,
      "type": "string",
      "description": "default separator",
      "default": " ",
    },
    "defaultCaseSensitive": {
      "order": 5,
      "type": "boolean",
      "description": "default caseSensitive",
      "default": true,
    },
    "defaultDoUniqueFilter": {
      "order": 6,
      "type": "boolean",
      "description": "default doUniqueFilter",
      "default": false,
    },
    "defaultDoEmptyFilter": {
      "order": 7,
      "type": "boolean",
      "description": "default doEmptyFilter",
      "default": false,
    },

    "defaultDoLinesSort": {
      "order": 8,
      "type": "boolean",
      "description": "default doLinesSort", //"If this value is true, this package sort lines.",
      "default": true,
    },
    //"defaultLinesSortPriorities": {
    //  "order": 9,
    //  "type": "string",
    //  "description": "default linesSortPriorities",
    //  "default": "",
    //},
    "defaultDoInlineSort": {
      "order": 10,
      "type": "boolean",
      "description": "default doInlineSort", //"If this value is true, this package sort inline elements.",
      "default": false,
    },
  },

  "name": "sort-selected-elements",
  activate() {
    this.sorter = new Sorter();
    this.sSEView = new SSEView();
    this.panel = atom.workspace.addBottomPanel({
      "item": this.sSEView.getElement(),
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

    this.subscriptions.add(atom.commands.add(this.sSEView.rootElement, {
      "sort-selected-elements:focusNext": () => { this.sSEView.focusNext(); },
      "sort-selected-elements:focusPrevious": () => { this.sSEView.focusPrevious(); },
    }));

    this.getConfigs(false);
  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.sSEView.destroy();
  },

  getConfigs(doUpdate = false) {
    this.autoFocus = atom.config.get(`${this.name}.autoFocus`);

    this.sorter.doInlineSort = atom.config.get(`${this.name}.defaultDoInlineSort`);
    this.sorter.doLinesSort = atom.config.get(`${this.name}.defaultDoLinesSort`);
    this.sorter.sortOrder = atom.config.get(`${this.name}.defaultSortOrder`);
    this.sorter.separator = atom.config.get(`${this.name}.defaultSeparator`);
    this.sorter.direction = atom.config.get(`${this.name}.defaultDirection`);
    this.sorter.caseSensitive = atom.config.get(`${this.name}.defaultCaseSensitive`);
    this.sorter.doUniqueFilter = atom.config.get(`${this.name}.defaultDoUniqueFilter`);
    this.sorter.doEmptyFilter = atom.config.get(`${this.name}.defaultDoEmptyFilter`);
    //this.sorter.linesSortPriorities = stringToNumberArray(atom.config.get(`${this.name}.defaultLinesSortPriorities`, ","));

    if (doUpdate === true) {
      this.sSEView.update(true);
    }
  },
  setConfigs() {
    atom.config.set(`${this.name}.defaultDoInlineSort`, this.sorter.doInlineSort);
    atom.config.set(`${this.name}.defaultDoLinesSort`, this.sorter.doLinesSort);
    atom.config.set(`${this.name}.defaultSortOrder`, this.sorter.sortOrder);
    atom.config.set(`${this.name}.defaultSeparator`, this.sorter.separator);
    atom.config.set(`${this.name}.defaultDirection`, this.sorter.Direction);
    atom.config.set(`${this.name}.defaultCaseSensitive`, this.sorter.caseSensitive);
    atom.config.set(`${this.name}.defaultDoUniqueFilter`, this.sorter.doUniqueFilter);
    atom.config.set(`${this.name}.defaultDoEmptyFilter`, this.sorter.doEmptyFilter);
    //atom.config.set(`${this.name}.defaultLinesSortPriorities`, this.sorter.linesSortPriorities.toString());
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
        this.sSEView.initialFocus();
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

    let text = editor.getSelectedText();
    text = this.sorter.preSort(text);
    this.sSEView.update();
    replaceSelected(text, editor);
  },
};
