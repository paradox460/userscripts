# 0.6

Upgrade report reasons to support global and subreddit specific reasons.

__This is a breaking change__.

You will need to upgrade your `reportReasons` configuration to be an _object_ (a `{}` in javascript), with global reasons under the `@global` key.
You can now add subreddit specific reasons under a key named for the subreddit.
# 0.5

Add configurable report reason presets.

Set the config value `reportReasons` to an _array_ of strings. They will be suggested as type-aheads for the report input.

# 0.4

Add mutation observer to add reports to "new" things on the page. Useful when you have infinite scroll, mod tool filtering, etc

# 0.3.1

Bugfix for f-report form not submitting

# 0.3

Add BotDefense automatic report button. Disabled by default. Enable by setting `botReport` to `true` in script values.

# 0.2

Updated update paths to point to new repo location

# 0.1

Initial release
