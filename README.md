# Codex-Function

A Node.JS library to generate functions at runtime using OpenAI Codex.

## :warning: DO NOT USE IN ANY PRODUCTION CODE! :warning:
## :warning: THIS WILL DOWNLOAD CODE FROM OPENAI AND EVAL IT :warning:

## Usage

The library will automaticly try to find a key in an environmental variable called `OPENAI_KEY`  
If you do not have this one you can manually set the key.

```js
import { setOpenAIKey } from "codex-function";

setOpenAIKey("someSuperSecretKey");
```

To generate a function you do
```js
import { createFunction } from "codex-function";

const fizzbuzz = await createFunction("prints fizzbuzz from 0 to 100");

fizzbuzz();
```

Notice how `createFunction` needs to be awaited as it needs to make a HTTP request to OpenAI API.

If you want the function to take in arguments you need to pass in an array of those.  
This is done so that AI has something more to work with and you know what to pass to the generate function.

```js
import { createFunction } from "codex-function";

const add = await createFunction("add together two numbers", ["a", "b"]);

console.log(add(15, 20));
```
