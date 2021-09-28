# html-node-compiler
This module lets you to run node codes in your html!

# Example Server.JS

```js
const htmlNodeCompiler = require("html-node-compiler");
const express = require("express");
const app = express();
app.use(htmlNodeCompiler.callback);

app.get("/", (req, res) => {
    res.sendNode("index", { myVariable: "Hi!" }); // will be rendering index.html
});

app.listen(3000);
```

# Tags

## `render{FILE}`
#### Puts file to the html and replaces tags.
#### Example: `render{header}`

## `print{CODE}`
### Runs code and replaces it with it.
#### Example: `print{2+2}` -> `4`
#### Example: `print{["2", "3"]}` -> `["2", "3"]`
#### Example: `print{"<h1>Hi</h1>"}` -> # Hi

## `print_r{CODE}`
### Runs code and replaces it with it. (Raw result)
#### Example: `print_r{2+2}` -> `4`
#### Example: `print_r{["2", "3"]}` -> `2,3`
#### Example: `print_r{"<h1>Hi</h1>"}` -> # Hi

## `print_s{CODE}`
### Runs code and replaces it with it. (Without html rendering and raw)
#### Example: `print_s{2+2}` -> `4`
#### Example: `print_s{["2", "3"]}` -> `2,3`
#### Example: `print_s{"<h1>Hi</h1>"}` -> `<h1>Hi</h1>`

## `run{CODE}`
### Runs code.
#### Example: `run{console.log("Hi!")}`, Console: Hi!

## `file{FILE}`
### Puts file without rendering it.
#### Example: `file{./index.html}`