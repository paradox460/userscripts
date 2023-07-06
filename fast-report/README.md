# Fast-report.js
UserScript for improved reporting experience on (old) reddit.

The new report UX that reddit has rolled out is an abomination. It's slow, cumbersome, unwieldily, relies on subreddit moderators to implement a "custom" report option, and ultimately just sucks.

This UserScript adds a simple button to the thing toolbar, titled `f-report` (for fast reporting).

Click `f-report`, and a text area appears. Type your report, and hit `Enter`. Your report is done! Hit `Esc` if you didn't want to actually report anything.

## Preset Reasons

You can set some "presets", that appear in a type-ahead list, both globally and on a per-subreddit basis. Set the `reportReasons` value in your userscript manager to a _JSON Object_, with global reasons in a `@global` key and per-subreddit reasons under subreddit keys.

```json
{
  "@global": ["hate", "spam", "repost"],
  "Android": ["@rule 1", "@rule 2"],
  "Cats": ["dog"]
}
```

> **Note:**
> Subreddit names _must_ be exact. Case is important. `android` will not work, as the subreddit's name is `Android`.

# [Click here to install](https://github.com/paradox460/userscripts/raw/master/fast-report/fast-report.user.js)
