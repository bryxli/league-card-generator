export type AccountDto = {
  puuid: string;
  gameName: string;
};

export type RiotErrorBody = {
  status: {
    message: string;
    status_code: number;
  };
};
