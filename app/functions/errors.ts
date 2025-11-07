import type { RiotErrorBody } from "./types";

export class RiotApiError extends Error {
  public statusCode: number;
  public body: string;

  constructor(statusCode: number, body: RiotErrorBody, message?: string) {
    super(message || "Riot API request failed");
    this.statusCode = statusCode;
    this.body = body.status.message;
    Object.setPrototypeOf(this, RiotApiError.prototype);
  }
}
