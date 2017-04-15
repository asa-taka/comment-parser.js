# comment-parser

`comment-parser` is a parser for plane-text fuzzily formatted by comments.

For example

```sh
# My Favorite Things     # comment
Brown paper packages     # entry
tied up with strings     # entry

# These are a few of my  # comment (above empty line clear comment relation)
# favorite things        # comment
Silver white winters     # entry
#that melt into springs  # disabled
These are a few          # entry
of my favorite things    # entry
```

the file, these lines have no formats clearly.
But it looks like to be fuzzy structured.
Header like comments show kind of entries of each following liens,
and clear lines break the relation from above section, and inline comment add notes.

## sample

```js
const fs = require('fs');
const comment = require('comment-parser');

const text = fs.readFileSync('sample.txt');
const res = comment.parse(text);
```

then above `res` will contains

```js
{
  "entries": [
    {
      "value": "Brown paper packages",
      "comments": {
        "nearby": [
          "# My Favorite Things     # comment"
        ],
        "inline": [
          "entry"
        ]
      },
      "disabled": false,
      "source": {
        "value": "Brown paper packages     # entry",
        "line": 2
      }
    }
    :
}
```

the full result is in [sample.json](./spec/testdata/sample.json).

## Line Classes

This parser treats each lines as one of following four Class.

- `comment`:
- `entry`:
- `disabled`: a disabled entry
- `clear`:

and `entry` and `disabled` has inline comment which text in between `#` and the end of line.
