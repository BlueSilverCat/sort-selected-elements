# sort-selected-elements package

Sort selected text in the Atom.  
You can select the following items.

-   Sort target
    -   lines sort
    -   inline sort
-   Sort order
    -   alphabetically
    -   natural
-   Sort direction
    -   ascending
    -   descending
-   Sort case
    -   case sensitive
    -   case insensitive
-   Sort filter
    -   only unique element
    -   no empty
-   Lines sort priorities
-   Sort separator

![Demo](https://raw.githubusercontent.com/BlueSilverCat/sort-selected-elements/master/sort-selected-elements.gif?raw=true)

# Basic usage

1.  Select text in editor.
2.  Open panel.
    -   `Atom Command Palette` -> `sort-selected-elements: panel`
    -   Push `sort-selected-elements: panel` key. default key is `ctrl-shift-alt-s`
3.  Set conditions.
4.  Push sortButton.
5.  Sort by entered conditions.

or

1.  Select text in editor.
2.  Execute sort command.
    -   `Atom Command Palette` -> `sort-selected-elements: sort`
    -   Push `sort-selected-elements: sort` key. default key is `ctrl-shift-s`
3.  Sort by default conditions or last entered conditions.

# Panel

![Panel](https://raw.githubusercontent.com/BlueSilverCat/sort-selected-elements/master/panel.png?raw=true)

-   `sort button` Sort selected elements.
-   `sort order selector` Select sort order.
    -   `alpah` Alphabetically sort.
    -   `natural` Natural sort.
-   `sort direction` Select sort direction.
    -   `asc` Ascending order.
    -   `descending` Descending order.
-   `separator input`
    Input separator. selected text is separated into elements by this string.
-   `case sensitive checker` Indicates whether case sensitive or not.
-   `save default button` Save all conditions except `lines sort priorities` to default value.
-   `load default button` Load all conditions except `lines sort priorities` from default value.
-   `close button` Close this panel.
-   `lines sort checker` Indicates whether perform lines sort or not.
-   `lines sort priorities` Input lines sort priorities. Indicates the priority of keys to be sorted. one-based array. negative value means descending order. If it is empty, it will be set to default value when sorting.  
    e.g. it is "3,-1,2". It means that sort by the 3rd key, then sort in descending by the first key, then sort by the second key.
-   `inline sort checker` Indicate whether perform inline sort or not.
-   `unique filter checker` Indicate whether perform unique filter or not. If set it to true, duplicate elements are deleted.
-   `no empty filter checker` Indicate whether perform no empty filter or not. If set it to true, empty elements are deleted.


# About lines sort priorities

Selected text is as below.

```text
009 fox green 350
004 cat white 150
003 dog gray 200
006 cat yellow 200
011 rat black 1000
010 rat white 1500
001 dog white 100
007 fox white 300
005 cat black 100
008 fox black 300
012 rat cyan 1250
002 dog black 150
```

Perform sorting with all default values. (`lines sort priorities` is emputy)  
Then the result is as below.  
And `lines sort priorities` is set to "1,2,3,4".  

```text
001 dog white 100
002 dog black 150
003 dog gray 200
004 cat white 150
005 cat black 100
006 cat yellow 200
007 fox white 300
008 fox black 300
009 fox green 350
010 rat white 1500
011 rat black 1000
012 rat cyan 1250
```

This means that sort by the first key, then sort by the second key, and so on.  
If you want to sort by only 3rd key, set `lines sort priorities` to "3".  
Then the result is as below.  
**Caution: Currently, if you do not specify all the keys, the results may differ.**

```text
008 fox black 300
005 cat black 100
011 rat black 1000
002 dog black 150
012 rat cyan 1250
003 dog gray 200
009 fox green 350
001 dog white 100
004 cat white 150
007 fox white 300
010 rat white 1500
006 cat yellow 200
```

If set `lines sort priorities` to "3,1".  
Then the result is as below.

```text
002 dog black 150
005 cat black 100
008 fox black 300
011 rat black 1000
012 rat cyan 1250
003 dog gray 200
009 fox green 350
001 dog white 100
004 cat white 150
007 fox white 300
010 rat white 1500
006 cat yellow 200
```

You can determine the direction of each key by specifying a negative number.  
For example, if you set `lines sort priorities` to "-3,1".  
Then the result is as below.

```text
006 cat yellow 200
001 dog white 100
004 cat white 150
007 fox white 300
010 rat white 1500
009 fox green 350
003 dog gray 200
012 rat cyan 1250
002 dog black 150
005 cat black 100
008 fox black 300
011 rat black 1000
```

# Default Keybindings

| Keystroke        | Command                              | Selector                    | Description                                                           |
| :--------------- | :----------------------------------- | :-------------------------- | :-------------------------------------------------------------------- |
| ctrl-alt-shift-S | sort-selected-elements:panel         | atom-workspace              | Open/Close panel.  (Activate package)                                 |
| ctrl-shift-S     | sort-selected-elements:sort          | atom-workspace              | Sort selected text by default or last conditions.  (Activate package) |
| none             | sort-selected-elements:settings      | atom-workspace              | Open package settings. (Activate package)                             |
| escape           | core:cancel                          | atom-workspace              | Close panel.                                                          |
| tab              | sort-selected-elements:focusNext     | sort-selected-elements.root | Focus next.                                                           |
| shift-tab        | sort-selected-elements:focusPrevious | sort-selected-elements.root | Focus previous.                                                       |
