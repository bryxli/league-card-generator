import fetch from "node-fetch";

const RIOT_KEY = process.env.RIOT_API_KEY!;
const REGION = "americas";

type AccountDto = {
  puuid: string;
  gameName: string;
};

type RiotErrorBody = {
  status: {
    message: string;
    status_code: number;
  };
};

class RiotApiError extends Error {
  public statusCode: number;
  public body: string;

  constructor(statusCode: number, body: RiotErrorBody, message?: string) {
    super(message || "Riot API request failed");
    this.statusCode = statusCode;
    this.body = body.status.message;
    Object.setPrototypeOf(this, RiotApiError.prototype);
  }
}

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
