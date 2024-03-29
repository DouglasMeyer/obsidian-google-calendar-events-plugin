import type { ApiRequestData } from "./types";

export class GoogleApiError extends Error {
  request: ApiRequestData | null;
  status: number;
  response: any;

  constructor(
    message: string,
    request: ApiRequestData | null,
    status: number,
    response: any
  ) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, GoogleApiError.prototype);
    this.request = request;
    this.status = status;
    this.response = response;
  }
}
