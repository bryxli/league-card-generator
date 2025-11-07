import { getChampionById } from "./champion";
import {
  getAllChampionMasteryDTOByPuuid,
  getAllLeagueEntryDTOByPuuid,
  getSummonerDTOByPuuid,
} from "./riot";
import type { ChampionData, RankedData } from "./types";

export async function getSummonerLevel(puuid: string): Promise<number> {
  const summonerDTO = await getSummonerDTOByPuuid(puuid);
  return summonerDTO.summonerLevel;
}

export async function consolidateChampionData(
  puuid: string,
): Promise<ChampionData[]> {
  const championMasteryDTOs = await getAllChampionMasteryDTOByPuuid(puuid);

  return championMasteryDTOs.map((masterDTO) => {
    const championId = masterDTO.championId.toString();
    const championData = getChampionById(championId);

    if (!championData) {
      throw new Error(`Champion data not found for id: ${championId}`);
    }

    const championName = championData.name;

    return {
      name: championName,
      level: masterDTO.championLevel,
    };
  });
}

export async function consolidateRankedData(
  puuid: string,
): Promise<RankedData[]> {
  const leagueEntryDTOs = await getAllLeagueEntryDTOByPuuid(puuid);
  return leagueEntryDTOs.map((leagueEntryDTO) => ({
    queueType: leagueEntryDTO.queueType,
    tier: leagueEntryDTO.tier,
    rank: leagueEntryDTO.rank,
    wins: leagueEntryDTO.wins,
    losses: leagueEntryDTO.losses,
  }));
}
