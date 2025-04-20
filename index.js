// Suppress punycode deprecation warning
process.removeAllListeners("warning");

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readline from "readline";
import { readFile, listFiles, editFile } from "./tools.js";

const toolRegistry = [
    {
        name: "readFile",
        description: "Reads a file and returns the content",
        parameters: {
            type: "object",
            properties: {
                filePath: {
                    type: "string",
                    description: "The path to the file to read",
                },
            },
            required: ["filePath"],
        },
        handler: readFile,
    },
    {
        name: "listFiles",
        description: "List the contents of a directory",
        parameters: {
            type: "object",
            properties: {
                dirPath: {
                    type: "string",
                    description: "The path to the directory to list",
                },
            },
            required: ["dirPath"],
        },
        handler: listFiles,
    },
    {
        name: "editFile",
        description: `Make edits to a text file.

        Replaces 'oldStr' with 'newStr' in the given file. 'oldStr' and 'newStr' MUST be different from each other.

        If the file specified with path doesn't exist, it will be created.
        `,
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The path to the file" },
                oldStr: {
                    type: "string",
                    description:
                        "Text to search for - must match exactly and must only have one match exactly",
                },
                newStr: {
                    type: "string",
                    description: "Text to replace the oldStr with",
                },
            },
            required: ["path", "oldStr", "newStr"],
        },
        handler: editFile,
    },
];

async function main() {
    dotenv.config();
    const apiKey = process.env.GEMINI_API_KEY;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const getUserMessage = (message) => {
        return new Promise((resolve) => {
            rl.question(message, (answer) => {
                resolve(answer);
            });
        });
    };

    const agent = new GoogleGenAI({ apiKey: apiKey });

    const functionDeclarations = toolRegistry.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
    }));

    const config = {
        tools: [
            {
                functionDeclarations: functionDeclarations,
            },
        ],
    };

    runAgent(agent, getUserMessage, config);
}

async function runAgent(agent, getUserMessage, config) {
    const chat = agent.chats.create({
        model: "gemini-2.0-flash",
        history: [],
        config: config,
    });

    console.log("Chat with Gemini (use 'ctrl-c' to quit)");

    let readUserInput = true;
    let content = "";
    while (true) {
        try {
            // If we got tool results from last interaction (readUserInput = false)
            // Then we feed those directly to the model instead of getting new user input
            if (readUserInput) {
                content = await getUserMessage("You: ");
            }

            console.log(`sending to model: ${content}`);
            const response = await chat.sendMessage({
                message: content,
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const toolResults = [];

                for (const functionCall of response.functionCalls) {
                    const tool = toolRegistry.find((t) => t.name === functionCall.name);
                    if (tool) {
                        const result = tool.handler(functionCall.args);
                        toolResults.push({
                            tool: functionCall.name,
                            result: result,
                        });
                    } else {
                        toolResults.push({
                            tool: functionCall.name,
                            result: `Unknown function: ${functionCall.name}`,
                        });
                    }
                }

                content = toolResults
                    .map((tr) => `Result from ${tr.tool}:\n${tr.result}`)
                    .join("\n\n");

                readUserInput = false;
            } else {
                console.log(`\nGemini: ${response.text}`);
                readUserInput = true;
            }
        } catch (error) {
            console.error("Error:", error.message);
            process.exit(1);
        }
    }
}

main();
