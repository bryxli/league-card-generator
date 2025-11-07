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
  return (
    Object.values(championData.data).filter(
      (champion) => champion.key === id,
    )[0] || null
  );
}
