import dotenv from "dotenv";

// Scraper 
import { Scraper } from "agent-twitter-client";

// Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

// Functions
import { login } from "./src/login";
import { crawlTweets } from "./src/crawl";
import { askGemini } from "./src/ask";
import { replyTweet } from "./src/reply";

dotenv.config();

const username = process.env.TWITTER_USERNAME || "";
const password = process.env.TWITTER_PASSWORD || "";
const email = process.env.TWITTER_EMAIL || "";
const fa = process.env.TWITTER_2FA_SECRET || "";
const apiKey = process.env.GEMINI_API_KEY || "";
const cmd = process.argv.slice(2)[0];

const scraper = new Scraper();
const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
    await login(scraper, username, password, email, fa);
    console.log("Login successful!");

    if (cmd === "crawl") {
        const listUsers = process.argv.slice(3);
        crawlTweets(scraper, listUsers);
    } else if (cmd === "tweet") {
        try {
            const response = await askGemini(genAI, "tweet");
            console.log("Tweet generated:", response);
            await scraper.sendTweet(response);
        } catch (error) {
            console.error("Error create tweet:", error);
        }
    } else if (cmd === "reply") {
        replyTweet(genAI, scraper, username);
    }
}

main().catch(console.error);
