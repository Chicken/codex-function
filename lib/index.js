import bent from "bent";

let key = null;

/**
 * Set the OpenAI API key if it's not in the usual OPENAI_KEY environmental variable
 * @param {string} newKey OpenAI API key
 */
export function setOpenAIKey(newKey) {
    if (typeof(newKey) !== "string")
        throw new TypeError("Key must be string");
    key = newKey;
}

/**
 * Create a function at runtime using Codex
 * @param {string} desc description of your function 
 * @param {string[]} args arguments which the function should take
 * @returns {function} AI generated function
 */
export async function createFunction(desc, args = []) {
    const useKey = key ?? process.env.OPENAI_KEY;

    if (!useKey)
        throw new Error("OpenAI key not found");
    if (typeof(desc) != "string")
        throw new TypeError("Function description must be a string");
    if (!Array.isArray(args) || args.some(v => typeof(v) !== "string"))
        throw new TypeError("Args must be a string array");

    let apiResponse;
    try {
        apiResponse = await bent("POST", "json")(
            "https://api.openai.com/v1/engines/davinci-codex/completions",
            JSON.stringify({
                prompt: `// Javascript function which ${desc}\nfunction(${args.join(", ")}) {`,
                temperature: 0,
                max_tokens: 320,
                top_p: 1,
                frequency_penalty: 0,
                best_of: 3,
                presence_penalty: 0
            }),
            {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${useKey}`
            }
        );
    } catch(e) {
        throw new Error(`Something went wrong with OpenAI API: ${e.message}`);
    }

    const rawCodexResponse = apiResponse.choices[0].text;

    let functionLength = 0;
    let blockCount = 1;
    while(blockCount && functionLength <= rawCodexResponse.length) {
        if (rawCodexResponse[functionLength] === "{") blockCount++;
        if (rawCodexResponse[functionLength] === "}") blockCount--;
        functionLength++;
    }

    if (functionLength > rawCodexResponse.length)
        throw new Error("Couldn't find function end in codex response");

    const codexFunction = rawCodexResponse.slice(0, functionLength);

    let func;
    try {
        func = eval(`(function(${args.join(", ")}) {\n${codexFunction})`);
    } catch(e) {
        throw new Error(`Something went wrong evaluating Codex generate function: ${e.message}`);
    }

    return func;
}
