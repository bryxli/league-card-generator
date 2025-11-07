export type AccountDto = {
  puuid: string;
  gameName: string;
};

export type ChampionMasteryDto = {
  puuid: string;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  championId: number;
  lastPlayTime: number;
  championLevel: number;
  championPoints: number;
  championPointsSinceLastLevel: number;
  markRequiredForNextLevel: number;
  championSeasonMilestone: number;
  nextSeasonMilestone: any; // TODO: define type
  tokensEarned: number;
  milestoneGrades: string[];
};

export type RiotErrorBody = {
  status: {
    message: string;
    status_code: number;
  };
};
