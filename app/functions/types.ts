export type AccountDTO = {
  puuid: string;
  gameName: string;
};

export type ChampionMasteryDTO = {
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
  nextSeasonMilestone: {
    requireGradeCounts: Object;
    rewardMarks: number;
    bonus: boolean;
    rewardConfig: {
      rewardValue: string;
      rewardType: string;
      maximumReward: number;
    };
  };
  tokensEarned: number;
  milestoneGrades: string[];
};

export type LeagueEntryDTO = {
  leagueId: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries: {
    losses: number;
    progress: string;
    target: number;
    wins: number;
  };
};

export type MatchDTO = {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    endOfGameResult: string;
    gameCreation: number;
    gameDuration: number;
    gameEndTimestamp: number;
    gameId: number;
    gameMode: string;
    gameName: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: any[]; // TODO: define type
    platformId: string;
    queueId: number;
    teams: any[]; // TODO: define type
    tournamentCode: string;
  };
};

export type SummonerDTO = {
  profileIconId: number;
  revisionDate: number;
  puuid: string;
  summonerLevel: number;
};

export type RiotErrorBody = {
  status: {
    message: string;
    status_code: number;
  };
};

export type Champion = {
  // TODO: expand type
  name: string;
};

export type ChampionData = {
  name: string;
  level: number;
};

export type RankedData = {
  queueType: string;
  tier: string;
  rank: string;
  wins: number;
  losses: number;
};
