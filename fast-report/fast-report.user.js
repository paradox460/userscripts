// ==UserScript==
// @name         Fast Reports for Reddit
// @namespace    http://userscripts.pdx.su
// @version      0.2
// @description  Provide fast report interface for old reddit
// @author       Paradox
// @run-at document-end
// @match        https://*.reddit.com/*
// @icon         https://www.google.com/s2/favicons?domain=reddit.com
// @grant        none
// @downloadURL https://github.com/paradox460/userscripts/raw/master/fast-report/fast-report.user.js
// @updateURL https://github.com/paradox460/userscripts/raw/master/fast-report/fast-report.user.js
// ==/UserScript==
/*eslint-env browser*/

const reportBtnSelector = '.report-button + :not(.fast-report-button)';

// UTILITY FUNCTIONS

function getUh() {
  const uh = document.querySelector("[name=uh]")?.value
  if (!uh) { return false }
  return uh
}


// REMOVAL FUNCTIONS

function generateFastReportLink() {
  const link = document.createElement('a')
  link.classList.add('fast-report-link');
  link.href = 'javascript:void(0)';
  link.addEventListener('click', e => {
    showReportTA(e.target);
  });
  link.appendChild(document.createTextNode('f-report'));

  return link;
}

function renderFastReportContainer(element) {
  const link = generateFastReportLink()
  const li = document.createElement('li');
  li.classList.add('fast-report-button');
  li.appendChild(link)

  element.insertAdjacentElement('beforebegin', li);
}

function scanAndAddReportLinks() {
  document.querySelectorAll(reportBtnSelector).forEach(renderFastReportContainer);
}

function showReportTA(element) {
  const input = document.createElement('input');
  input.classList.add('fast-report-input');
  input.placeholder = 'Report reason';
  input.addEventListener('keydown', e => {
    if (e.isComposing) { return }
    if (e.key == 'Enter') {
      submitReport(input.value, e.target);
    } else if (e.key == 'Escape') {
      e.target.replaceWith(generateFastReportLink());
    }
  });
  element.replaceWith(input);
  input.focus();
}

async function submitReport(reportReason, element) {
  const uh = getUh();
  const { fullname: thing, subreddit } = element.closest('.thing').dataset;
  const body = new FormData();
  body.append('thing_id', thing);
  body.append('reason', 'other');
  body.append('other_reason', reportReason);
  body.append('id', `#report-action-form`);
  body.append('r', subreddit);
  body.append('uh', uh);

  await fetch('/api/report', {
    method: 'POST',
    credentials: 'include',
    body,
  });

  element.parentNode.remove();
}

// MAIN

(function () {
  'use strict';
  scanAndAddReportLinks();
})();
