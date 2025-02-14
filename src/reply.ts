import { Scraper, SearchMode } from 'agent-twitter-client';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { askGemini } from './ask';
import dotenv from "dotenv";

dotenv.config();

const number = Number(process.env.REPLY_LATEST_TWEET) || 5;

function removeFirstWord(str: string): string {
    const words = str.split(" ");
    return words.slice(1).join(" ");
}

export const replyTweet = async function handle(genAI: GoogleGenerativeAI, scraper: Scraper, username: string) {
    const replyTweets = (
        await scraper.fetchSearchTweets(
            `@${username}`,
            number,
            SearchMode.Latest
        )
    ).tweets;
    replyTweets.map(async (tweet: any) => {

        //Reply
        const replyID = tweet.id;
        const replyContent = removeFirstWord(tweet.text);

        //Main Tweet
        const targetId = tweet.conversationId;
        const target = await scraper.getTweet(targetId);
        const targetText = target?.text;
        const contentToReply = await askGemini(genAI, "reply", targetText, replyContent);
        try {
            const response = await scraper.sendTweet(contentToReply, replyID);
        } catch (error) {
            console.log("Error when replying:", error);
        }

    })
}