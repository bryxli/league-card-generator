import fetch from "node-fetch";
import type {
  AccountDTO,
  ChampionMasteryDTO,
  LeagueEntryDTO,
  MatchDTO,
  RiotErrorBody,
  SummonerDTO,
} from "./types";
import { RiotApiError } from "./errors";

const RIOT_KEY = process.env.RIOT_API_KEY!;
const REGION = "americas";
const SERVER = "na1";

export async function getAccountDTOByRiotId(
  gameName: string,
  tagLine: string,
): Promise<AccountDTO> {
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

  return body as AccountDTO;
}

export async function getAllChampionMasteryDTOByPuuid(
  puuid: string,
): Promise<ChampionMasteryDTO[]> {
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

  return body as ChampionMasteryDTO[];
}

export async function getAllLeagueEntryDTOByPuuid(
  puuid: string,
): Promise<LeagueEntryDTO[]> {
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

export async function getMatchIdsByPuuid(
  puuid: string,
  count: number = 20,
): Promise<string[]> {
  const res = await fetch(
    `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch match ids for puuid ${puuid}`,
    );
  }

  return body as string[];
}

export async function getMatchDTOById(matchId: string): Promise<MatchDTO> {
  const res = await fetch(
    `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch match for match id ${matchId}`,
    );
  }

  return body as MatchDTO;
}

export async function getSummonerDTOByPuuid(
  puuid: string,
): Promise<SummonerDTO> {
  const res = await fetch(
    `https://${SERVER}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
    {
      headers: { "X-Riot-Token": RIOT_KEY },
    },
  );

  const body = await res.json();

  if (!res.ok) {
    throw new RiotApiError(
      res.status,
      body as RiotErrorBody,
      `Failed to fetch summoner for puuid ${puuid}`,
    );
  }

  return body as SummonerDTO;
}
