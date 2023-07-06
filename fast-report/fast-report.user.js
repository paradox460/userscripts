// ==UserScript==
// @name         Fast Reports for Reddit
// @namespace    http://userscripts.pdx.su
// @version      0.7
// @description  Provide fast report interface for old reddit
// @author       Paradox
// @run-at       document-end
// @match        https://*.reddit.com/*
// @icon         https://www.google.com/s2/favicons?domain=reddit.com
// @downloadURL  https://github.com/paradox460/userscripts/raw/master/fast-report/fast-report.user.js
// @updateURL    https://github.com/paradox460/userscripts/raw/master/fast-report/fast-report.user.js
// @homepageUrl  https://github.com/paradox460/userscripts/tree/master/fast-report
// ==/UserScript==
/*eslint-env browser*/

const reportBtnSelector = '.report-button + :not(.fast-report-button)';

// UTILITY FUNCTIONS

function getUh() {
  const uh = document.querySelector("[name=uh]")?.value
  if (!uh) { return false }
  return uh
}


// LINK GENERATION

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

function renderReportContainers(element) {
  const links = [
    generateFastReportLink(),
  ]
  for (const link of links) {
    const li = document.createElement('li');
    li.classList.add('fast-report-button');
    li.appendChild(link)

    element.insertAdjacentElement('beforebegin', li);
  }
}


function scanAndAddReportLinks() {
  document.querySelectorAll(reportBtnSelector).forEach(renderReportContainers);
}

const mObserver = new MutationObserver(() => {
  scanAndAddReportLinks();
})

function startObserving() {
  mObserver.observe(document.body, { childList: true, subtree: true });
}

// REPORTING

function showReportTA(element) {
  const input = document.createElement('input');
  input.classList.add('fast-report-input');
  input.placeholder = 'Report reason';

  if (GM_getValue('reportReasons')) {
    const datalist = document.createElement('datalist');
    datalist.id = 'report-reasons';
    const { subreddit } = element.closest('.thing').dataset;
    const subReasons = GM_getValue('reportReasons')[subreddit];
    const globalReasons = GM_getValue('reportReasons')['@global'];
    if (subReasons || globalReasons) {
      const reasonsObject = {
        ...subReasons && { [subreddit]: subReasons },
        ...globalReasons && { "Global": globalReasons }
      };
      for (const [group, reasons] of Object.entries(reasonsObject)) {
        for (const reason of reasons) {
          const option = document.createElement('option');
          option.value = reason;
          option.innerText = group.replace(/^@/, '');
          datalist.appendChild(option);
        }
      }
      element.insertAdjacentElement('afterend', datalist);
      input.setAttribute('list', 'report-reasons');
    }
  }

  input.addEventListener('keydown', e => {
    if (e.isComposing) { return }
    if (e.key == 'Enter') {
      submitReport(input.value, e.target).then(() => e.target.parentElement.remove());
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
}


// MAIN

(function () {
  'use strict';
  scanAndAddReportLinks();
  startObserving();
})();
