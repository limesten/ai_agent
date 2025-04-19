// Suppress punycode deprecation warning
process.removeAllListeners('warning');

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readline from "readline";
import { readFile } from "./tools.js";

const readFileFunctionDeclaration = {
    name: "readFile",
    description: "Reads a file and returns the content",
    parameters: {
        type: "object",
        properties: {
            filePath: { type: "string", description: "The path to the file to read" }
        },
        required: ["filePath"]
    }
}

async function main() {

    dotenv.config();
    const apiKey = process.env.GEMINI_API_KEY;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const getUserMessage = (message) => {
        return new Promise((resolve) => {
            rl.question(message, (answer) => {
                resolve(answer); 
            });
        });
    };
    
    const agent = new GoogleGenAI({ apiKey: apiKey });

    const config = {
        tools: [{
            functionDeclarations: [readFileFunctionDeclaration]
        }]
    };

    runAgent(agent, getUserMessage, config);
}

async function runAgent(agent, getUserMessage, config) {
    const chat = agent.chats.create({
        model: "gemini-2.0-flash",
        history: [],
        config: config
    });

    console.log("Chat with Gemini (use 'ctrl-c' to quit)");

    while (true) {
        try {
            const userMessage = await getUserMessage("You: ");

            const response = await chat.sendMessage({
                message: userMessage,
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                for (const functionCall of response.functionCalls) {
                    if (functionCall.name === "readFile") {
                        const args = functionCall.args;
                        const content = readFile(args.filePath);
                        
                        const followUpResponse = await chat.sendMessage({
                            message: content,
                        });
                        console.log(`\nGemini: ${followUpResponse.text}`);
                    }
                }
            } else {
                console.log(`\nGemini: ${response.text}`);
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

main();