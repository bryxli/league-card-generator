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

    const prompt = `
You are an E-sports analyst.
Generate a card for a League of Legends player with the name "${matchData[0].summonerName}" using the following details:
- Player Level: ${summonerLevel}
- Ranked Stats: ${rankedData}
- Top 3 Favorite Champions: ${championData[0]}, ${championData[1]}, ${championData[2]}
Design Requirements:
- Layout: Modern trading card style with a clear header for the player name
- Information: Display player level, ranked stats, and favorite champions prominently
`;

    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: process.env.BEDROCK_MODEL_ID!,
        body: JSON.stringify({
          taskType: "TEXT_IMAGE",
          textToImageParams: {
            text: prompt,
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

    const result = JSON.parse(new TextDecoder().decode(response.body));
    const imageBase64 = result?.images?.[0];
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
