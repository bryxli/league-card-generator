import { getChampionById } from "./champion";
import { getAllChampionMasteryDTOByPuuid } from "./riot";
import type { ChampionData } from "./types";

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
