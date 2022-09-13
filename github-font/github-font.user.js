// ==UserScript==
// @name        Fix GH monospace fonts
// @namespace   http://userscripts.pdx.su
// @match       *://github.com/*
// @icon        https://www.google.com/s2/favicons?domain=github.com
// @grant       GM_getValue
// @version     0.0.1
// @author      Paradox
// @description Fix the font used on github to be a configured monospace font.
// @downloadURL https://github.com/paradox460/userscripts/raw/master/github-font/github-font.user.js
// @updateURL   https://github.com/paradox460/userscripts/raw/master/github-font/github-font.user.js
// ==/UserScript==

const font = GM_getValue("font", "JetBrains Mono");

const newCSS = `
    pre, .blob-code-inner {
        font-family: "${font}"
    }
`

const sheet = new CSSStyleSheet();
sheet.replaceSync(newCSS);

window.document.adoptedStyleSheets = [...window.document.adoptedStyleSheets, sheet];
