import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Buffer } from "buffer";
import { Jimp } from "jimp";
import {
  consolidateChampionData,
  consolidateMatchData,
  consolidateRankedData,
  getSummonerLevel,
} from "./data";
import { RiotApiError } from "./errors";
import { getAccountDTOByRiotId } from "./riot";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

export async function handler(event: any) {
  const query = event.queryStringParameters || {};
  const gameName = query.gameName;
  const tagLine = query.tagLine;

  if (!gameName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing summoner name" }),
    };
  } else if (!tagLine) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing tag line" }),
    };
  }

  try {
    const accountDTO = await getAccountDTOByRiotId(gameName, tagLine);
    const puuid = accountDTO.puuid;

    const summonerLevel = await getSummonerLevel(puuid);
    const rankedData = await consolidateRankedData(puuid);
    const matchData = await consolidateMatchData(puuid);
    const championData = await consolidateChampionData(puuid);

    // const prompt = `Generate a summary for a League of Legends player using the following details: - Player Name: ${gameName}#${tagLine} - Player Level: ${summonerLevel} - Ranked Stats: ${JSON.stringify(rankedData)} - Favorite Champions: ${JSON.stringify(championData.slice(0,5))} - Recent Match History: ${JSON.stringify(matchData)} Only consider accounts in the NA region. Give the information in a concise format suitable for a player card. Do not regurgitate the data, instead provide insights and highlights about the player's performance and style. Prioritize queueType: RANKED_SOLO_5x5.`;

    // const textResponse = await bedrock.send(
    //   new InvokeModelCommand({
    //     modelId: "amazon.titan-text-lite-v1",
    //     body: JSON.stringify({
    //       inputText: prompt,
    //       textGenerationConfig: {
    //         temperature: 0.7,
    //         topP: 0.7,
    //         maxTokenCount: 238,
    //       },
    //     }),
    //   }),
    // );

    // const textResult = JSON.parse(new TextDecoder().decode(textResponse.body));
    // let playerSummary = textResult.results[0].outputText;

    // if (playerSummary.length > 238) {
    //   playerSummary = playerSummary.slice(0, 238);
    // }

    // const imagePrompt = `Create a visually appealing player card based on the following summary: ${playerSummary} The style should be modern and clean, suitable for showcasing a player's achievements and stats. Avoid low quality, distorted, or blurry visuals.`;

    const imagePrompt = `You are an E-sports analyst. Generate a card for a League of Legends player using the following details: - Player Level: ${summonerLevel} - Ranked Stats: ${rankedData} - Top 3 Favorite Champions: ${championData[0]}, ${championData[1]}, ${championData[2]} Design Requirements: - Layout: Modern trading card style with a clear header for the player name - Information: Display player level, ranked stats, and favorite champions prominently`;

    const imageResponse = await bedrock.send(
      new InvokeModelCommand({
        modelId: "amazon.titan-image-generator-v2:0",
        body: JSON.stringify({
          taskType: "TEXT_IMAGE",
          textToImageParams: {
            text: imagePrompt,
            negativeText: "low quality, distorted, blurry",
          },
          imageGenerationConfig: {
            width: 320,
            height: 704,
            cfgScale: 7.5,
            seed: Math.floor(Math.random() * 99999),
          },
        }),
      }),
    );

    const imageResult = JSON.parse(
      new TextDecoder().decode(imageResponse.body),
    );
    const imageBase64 = imageResult?.images?.[0];
    if (!imageBase64) throw new Error("No image returned");

    const image = await Jimp.read(Buffer.from(imageBase64, "base64"));
    const base64Image = await image.getBase64("image/jpeg", {
      quality: 80,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<img src="${base64Image}" />`,
    };
  } catch (error) {
    if (error instanceof RiotApiError) {
      return {
        statusCode: error.statusCode,
        body: error.body,
      };
    } else if (error instanceof Error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
