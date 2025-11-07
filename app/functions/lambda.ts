import { RiotApiError } from "./errors";
import {
  getAccountDTOByRiotId,
  getAllChampionMasteryDTOByPuuid,
  getAllLeagueEntryDTOByPuuid,
  getMatchDTOById,
  getMatchIdsByPuuid,
  getSummonerDTOByPuuid,
} from "./riot";

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
    const championMasteryDTOs = await getAllChampionMasteryDTOByPuuid(
      accountDTO.puuid,
    );
    const leagueEntryDTOs = await getAllLeagueEntryDTOByPuuid(accountDTO.puuid);
    const matchIds = await getMatchIdsByPuuid(accountDTO.puuid);
    const matchDTO = await getMatchDTOById(matchIds[0]);
    const summonerDTO = await getSummonerDTOByPuuid(accountDTO.puuid);

    return summonerDTO;
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
