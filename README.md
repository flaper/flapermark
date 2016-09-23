# markdown  [![Build Status](https://travis-ci.org/flaper/markdown.svg?branch=master)](https://travis-ci.org/flaper/markdown) [![npm version](https://badge.fury.io/js/%40flaper%2Fmarkdown.svg)](https://badge.fury.io/js/%40flaper%2Fmarkdown)
## Установка
`npm install @flaper/markdown --save`

## Использование

```js
import {FlaperMark, Sanitize} from '@flaper/markdown';

FlaperMark.toHtml(text); // полный рендеринок
FlaperMark.toInline(text); // без картинок, меньше отступов
FlaperMark.shortInline(text); // toInline + короткий текст

Sanitize.symbolsNumber(text); // подсчет количества символов
```
