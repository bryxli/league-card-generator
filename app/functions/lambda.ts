import fetch from "node-fetch";
import type {
  AccountDto,
  ChampionMasteryDto,
  LeagueEntryDTO,
  RiotErrorBody,
} from "./types";
import { RiotApiError } from "./errors";

const RIOT_KEY = process.env.RIOT_API_KEY!;
const REGION = "americas";
const SERVER = "na1";

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

async function getAllChampionMasteryDtoByPuuid(puuid: string): Promise<any[]> {
  const res = await fetch(
    `https://${SERVER}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch champion mastery for puuid ${puuid}`,
    );
  }

  return body as ChampionMasteryDto[];
}

async function getAllLeagueRanksByPuuid(puuid: string): Promise<any[]> {
  const res = await fetch(
    `https://${SERVER}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch league ranks for puuid ${puuid}`,
    );
  }

  return body as LeagueEntryDTO[];
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
    const championMasteryDtos = await getAllChampionMasteryDtoByPuuid(
      accountDto.puuid,
    );
    const leagueEntryDtos = await getAllLeagueRanksByPuuid(accountDto.puuid);

    return leagueEntryDtos;
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
