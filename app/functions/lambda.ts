import fetch from "node-fetch";
import type { AccountDto, RiotErrorBody } from "./types";
import { RiotApiError } from "./errors";

const RIOT_KEY = process.env.RIOT_API_KEY!;
const REGION = "americas";

async function getAccountDtoByRiotId(
  gameName: string,
  tagLine: string,
): Promise<AccountDto> {
  const res = await fetch(
    `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch account for ${gameName}#${tagLine}`,
    );
  }

  return body as AccountDto;
}

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
    const accountDto = await getAccountDtoByRiotId(gameName, tagLine);
    return accountDto;
  } catch (error) {
    if (error instanceof RiotApiError) {
      return {
        statusCode: error.statusCode,
        body: error.body,
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
