import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { Buffer } from "buffer";
import sharp from "sharp";
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

    // const prompt = `
    //   Generate a custom "League of Legends player card" image with this data:
    //   Summoner: ${gameName}#${tagLine}
    //   Summoner Level: ${summonerLevel}
    //   Ranked Data: ${rankedData}
    //   Recent Match Data: ${matchData}
    //   Most Played Champions: ${championData}
    //   Style: Clean modern trading card, glowing edges, dark background.
    // `;

    const prompt = `
      Generate a custom "MOBA fantasy game player card" image with this data:
      Summoner: ${gameName}#${tagLine}
      Summoner Level: ${summonerLevel}
      Ranked Data: ${rankedData}
      Style: Clean modern trading card, glowing edges, dark background.
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

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const compressedBuffer = await sharp(imageBuffer)
      .resize({ width: 320 })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-cache",
      },
      body: compressedBuffer.toString("base64"),
      isBase64Encoded: true,
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
