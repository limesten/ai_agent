// Suppress punycode deprecation warning
process.removeAllListeners('warning');

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readline from "readline";

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

    runAgent(agent, getUserMessage);
}

async function runAgent(agent, getUserMessage) {
    const chat = agent.chats.create({
        model: "gemini-2.0-flash",
        history: []
    });

    console.log("Chat with Gemini (use 'ctrl-c' to quit)");

    while (true) {
        const userMessage = await getUserMessage("You: ");

        const response = await chat.sendMessage({
            message: userMessage,
        });

        console.log(`\nGemini: ${response.text}`);
    }
}


main();