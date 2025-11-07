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

/**
 * Retrieves the AccountDTO for a given Riot ID.
 *
 * @async
 * @param {string} gameName - Riot account name.
 * @param {string} tagLine - Riot account tag.
 * @returns {Promise<AccountDTO>} The AccountDTO object.
 */
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

/**
 * Retrieves a list of ChampionMasteryDTO for a given Riot Puuid.
 *
 * @async
 * @param {string} puuid - Riot account Puuid.
 * @returns {Promise<ChampionMasteryDTO[]>} A list of ChampionMasteryDTO objects.
 */
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

/**
 * Retrieves a list of LeagueEntryDTO for a given Riot Puuid.
 *
 * @async
 * @param {string} puuid - Riot account Puuid.
 * @returns {Promise<LeagueEntryDTO[]>} A list of LeagueEntryDTO objects.
 */
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

/**
 * Retrieves a list of match ids for a given Riot Puuid.
 *
 * @async
 * @param {string} puuid - Riot account Puuid.
 * @param {number} [count] - The number of match ids to retrieve (max = 100).
 * @returns {Promise<string[]>} A list of match ids.
 */
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

/**
 * Retrieves the MatchDTO for a given match id.
 *
 * @async
 * @param {string} matchId - Match id.
 * @returns {Promise<MatchDTO>} The MatchDTO object.
 */
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

/**
 * Retrieves the SummonerDTO for a given Riot Puuid.
 *
 * @async
 * @param {string} puuid - Riot account Puuid.
 * @returns {Promise<SummonerDTO>} The SummonerDTO object.
 */
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
