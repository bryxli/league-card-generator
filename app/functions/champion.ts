import championData from "./champion.json";
import type { Champion } from "./types";

/**
 * Retrieves the champion for a given champion id.
 *
 * @async
 * @param {string} id - Champion id.
 * @returns {Object} The champion object.
 */
export function getChampionById(id: string): Champion {
  const champion = Object.values(championData.data).find(
    (champion) => champion.key === id,
  );
  if (!champion) throw new Error(`Champion data not found for id: ${id}`);
  return champion;
}
