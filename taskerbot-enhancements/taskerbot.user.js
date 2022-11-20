// ==UserScript==
// @name         Taskerbot in Toolbox
// @namespace    https://userscripts.pdx.su
// @version      0.8
// @description  Add taskerbot to the moderator toolbox
// @author       You
// @match        https://www.reddit.com/*
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @downloadURL https://github.com/paradox460/userscripts/raw/master/taskerbot-enhancements/taskerbot.user.js
// @updateURL https://github.com/paradox460/userscripts/raw/master/taskerbot-enhancements/taskerbot.user.js
// ==/UserScript==

const removeAsSubreddit = GM_getValue('removeAsSubreddit', false);

const addReporterToModtools = () => {
  const target = document.querySelector(".modtools .pretty-button.action.positive");
  if (!target) { return };
  target.insertAdjacentHTML("afterend", `<a id="taskerbot-button" href="javascript:;" class="pretty-button negative" accesskey="T" type="taskerbot" style="margin-left: 5px">TaskerBot Report</a>`);
  mObserver.disconnect();
  const tbButton = document.querySelector("#taskerbot-button");

  tbButton.addEventListener("click", tbClicked, { passive: true });
}

const addCleanUserpageButton = () => {
  const target = document.querySelector(".profile-page.moderator .menuarea");
  if (!target) { return };
  target.insertAdjacentHTML("beforeend", `<a id="taskerbot-clean-button" href="javascript:;" class="pretty-button negative" accesskey="C" title="Clean up removed things" type="taskerbotCleanup style="margin-left: 10px;">Clean up</a>`);
  const tbcButton = document.querySelector("#taskerbot-clean-button");

  tbcButton.addEventListener("click", cleanClicked)
}

const tbClicked = (e) => {
  // get checked items
  const things = [...document.querySelectorAll(".thing > input:checked")].reduce((acc, elem) => {
    if (!isVisible(elem)) {
      return acc
    }
    acc.push(elem.closest(".thing"))
    return acc
  }, [])
  // if checked items > 0, collect reason
  if (things.length < 1) {
    return;
  }
  const rule = window.prompt("Which taskerbot rule (@rule ###)", "2");
  if (!rule || rule === "") {
    return;
  }

  addBadThings(things, rule)
}

const cleanClicked = (e) => {
  if (!window.confirm("Delete every removed/spammed thing from the currently visible list?")) { return }
  // Get removed things
  const things = [...document.querySelectorAll(".thing.spam")].reduce((acc, elem) => {
    if (!isVisible(elem)) {
      return acc
    }
    acc.push(elem)
    return acc
  }, [])

  if (things.length < 1) {
    return
  }

  addThingsToClean(things)
}

const addBadThings = (things, rule) => {
  things.forEach(thing => {
    window.badThings.push([thing, rule])
  })
  eatBadThings()
}

const eatBadThings = () => {
  if (window.badThings.length < 1) { window.consumingBadThings = false; return }
  window.consumingBadThings = true;
  const badThingsConsumer = setInterval(() => {
    if (window.badThings.length < 1) { clearInterval(badThingsConsumer); window.consumingBadThings = false; return; }
    removeThing(...window.badThings.pop())
  }, 2000);
}

const addThingsToClean = (things) => {
  window.toClean.push(...things);
  cleanupThings();
}

const cleanupThings = () => {
  if (window.toClean.length < 1) { window.cleaning = false; return }
  window.cleaning = true;
  const cleanupConsumer = setInterval(() => {
    if (window.cleaning.length < 1) { clearInterval(cleanupConsumer); window.cleaning = false; return }
    deleteThing(window.toClean.pop())
  }, 2000)
}

// Searches the jQuery command json returned from reddit for the t1 of the comment, to distinguish it
const searchForCommentID = (data) => {
  let result;
  if (data instanceof Array) {
    for (const x of data) {
      result = searchForCommentID(x)
      if (result) { break }
    }
  } else {
    if (data?.id?.match(/t1_.*/)) {
      return data.id
    }
    if (data instanceof Object) {
      for (const x of Object.values(data)) {
        result = searchForCommentID(x)
        if (result) { break }
      }
    }
  }
  return result;
}


const removeThing = async (elem, rule) => {
  if (removeAsSubreddit) {
    removeThingAsSubreddit(elem, rule);
  } else {
    removeThingAsSelf(elem, rule);
  }

  elem.classList.add("removed")
  elem.querySelector("input:checked").checked = false;
}

const removeThingAsSubreddit = async (elem, rule) => {
  const uh = getUh();
  if (!uh) { return false }

  const { fullname: thing, subreddit } = elem.dataset;
  const endpoint = thing.startsWith('t1') ? 'api/v1/modactions/removal_comment_message' : 'api/v1/modactions/removal_link_message';

  await promised_GM_xmlhttpRequest({
    url: `https://oauth.reddit.com/${endpoint}`,
    method: 'POST',
    headers: oAuthHeaders(),
    data: JSON.stringify({
      item_id: [thing],
      message: `@rule ${rule}`,
      title: "Taskerbot removal trigger",
      type: 'public_as_subreddit',
      lock_comment: true,
    })
  })
}

const removeThingAsSelf = async (elem, rule) => {
  const uh = getUh();
  if (!uh) { return false }

  const { fullname: thing, subreddit } = elem.dataset
  const body = new FormData();
  body.append("thing_id", thing)
  body.append("text", `@rule ${rule}`)
  body.append("id", `#form-${thing}`)
  body.append("r", subreddit)
  body.append("uh", uh)


  const result = await fetch('/api/comment', {
    method: "POST",
    credentials: "include",
    body: body
  }).then(response => response.json())

  const commentID = searchForCommentID(result.jquery)
  if (commentID) {
    const distinguishBody = new FormData();
    distinguishBody.append("id", commentID);
    distinguishBody.append("sticky", false);
    distinguishBody.append("r", subreddit);
    distinguishBody.append("uh", uh);

    fetch('/api/distinguish/yes', {
      method: "POST",
      credentials: "include",
      body: distinguishBody
    });
  }
}

const deleteThing = (elem) => {
  const uh = getUh();
  if (!uh) { return false }

  const { fullname: thing, subreddit } = elem.dataset;
  const body = new FormData();
  body.append("id", thing)
  body.append("executed", "deleted")
  body.append("r", subreddit)
  body.append("uh", uh)

  fetch('/api/del', {
    method: "POST",
    credentials: "include",
    body: body
  }).then(response => response.json())
    .then(result => {
      elem.hidden = true
    })
}

const isVisible = (elem) => {
  return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
}

const getUh = () => {
  const uh = document.querySelector("[name=uh]")?.value
  if (!uh) { return false }
  return uh
}

const oAuthHeaders = () => {
  let token = document.cookie.split("; ")
    .find(c => c.startsWith("token="))
    ?.replaceAll(/token=|[^A-Za-z0-9+/].*?$/g, '')
  token = atob(token);
  token = JSON.parse(token);

  return { Authorization: `bearer ${token.accessToken}` }
}

const promised_GM_xmlhttpRequest = (opts) => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({ ...opts, onload: response => resolve(response), onerror: response => reject(response) })
  });
}

const mObserver = new MutationObserver(() => {
  addReporterToModtools();
})

const startObserving = () => {
  mObserver.observe(document.body, { subtree: true, childList: true })
}

if (window.location.href.match(/modqueue/i)) {
  startObserving();
  addReporterToModtools()
}

if (window.location.href.match(/user/i)) {
  addCleanUserpageButton()
}

window.addEventListener("click", e => {
  if (e.target.closest(".tb-queuetools-tab")) {
    startObserving();
  }
}, { passive: true })

window.addEventListener("beforeUnload", e => {
  if (window.consumingBadThings) { e.returnValue = `Currently taskerbotting posts, ${window.badThings.length * 2} seconds left` }
})

window.badThings = [];
window.toClean = [];
