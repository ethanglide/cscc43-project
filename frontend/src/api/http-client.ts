export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

export class HttpClient {
  private static baseUrl: string = import.meta.env.VITE_API_BASE_URL;

  /**
   * Sends a GET request to the specified path.
   * @param path The path to send the GET request to.
   * @param token The token to use for authentication. (Optional)
   * @returns The response from the server.
   */
  static async get(path: string, token: string = "") {
    return await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Sends a POST request to the specified path.
   * @param path The path to send the POST request to.
   * @param body The body of the POST request.
   * @param token The token to use for authentication. (Optional)
   * @returns The response from the server.
   */
  static async post(path: string, body: any, token: string = "") {
    return await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  }
}
