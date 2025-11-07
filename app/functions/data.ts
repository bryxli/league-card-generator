import { getChampionById } from "./champion";
import {
  getAllChampionMasteryDTOByPuuid,
  getAllLeagueEntryDTOByPuuid,
  getMatchDTOById,
  getMatchIdsByPuuid,
  getSummonerDTOByPuuid,
} from "./riot";
import type { ChampionData, MatchData, RankedData } from "./types";

export async function getSummonerLevel(puuid: string): Promise<number> {
  const summonerDTO = await getSummonerDTOByPuuid(puuid);
  return summonerDTO.summonerLevel;
}

export async function consolidateChampionData(
  puuid: string,
): Promise<ChampionData[]> {
  const championMasteryDTOs = await getAllChampionMasteryDTOByPuuid(puuid);

  return championMasteryDTOs
    .map((masterDTO) => {
      const championId = masterDTO.championId.toString();

      try {
        const championData = getChampionById(championId);

        const championName = championData.name;

        return {
          name: championName,
          level: masterDTO.championLevel,
        };
      } catch (error) {
        return undefined;
      }
    })
    .filter(Boolean) as ChampionData[];
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

export async function consolidateMatchData(
  puuid: string,
): Promise<MatchData[]> {
  const matchIds = await getMatchIdsByPuuid(puuid, 16); // Set to retrieve last 16 matches due to rate limit of 20 requests/second
  return await Promise.all(
    matchIds.map(async (matchId) => {
      const matchDTO = await getMatchDTOById(matchId);
      const participants = matchDTO.info.participants;
      const participant = participants.find((p) => p.puuid === puuid);
      return {
        assists: participant.assists,
        baronKills: participant.baronKills,
        champLevel: participant.champLevel,
        championName: participant.championName,
        deaths: participant.deaths,
        dragonKills: participant.dragonKills,
        firstBloodKill: participant.firstBloodKill,
        firstTowerKill: participant.firstTowerKill,
        goldEarned: participant.goldEarned,
        kills: participant.kills,
        pentaKills: participant.pentaKills,
        summonerLevel: participant.summonerLevel,
        summonerName: participant.summonerName,
        teamEarlySurrendered: participant.teamEarlySurrendered,
        teamPosition: participant.teamPosition,
        timePlayed: participant.timePlayed,
        totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
        totalMinionsKilled: participant.totalMinionsKilled,
        turretKills: participant.turretKills,
        turretTakedowns: participant.turretTakedowns,
        visionScore: participant.visionScore,
        wardsKilled: participant.wardsKilled,
        wardsPlaced: participant.wardsPlaced,
        win: participant.win,
      };
    }),
  );
}
