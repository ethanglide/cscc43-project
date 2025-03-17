import { HttpClient, MessageResponse, ErrorResponse } from "./http-client";

export interface StockListsResponse {
  username: string;
  list_name: string;
  public: boolean;
}

export interface StockListStockResponse {
  symbol: string;
  amount: number;
}

export default class StockListsApi {
  static async getStockLists(username: string) {
    const response = await HttpClient.get(`/stock-lists?username=${username}`);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockListsResponse[];
  }

  static async getStockListStocks(username: string, listName: string) {
    const response = await HttpClient.get(
      `/stock-lists/stocks?username=${username}&listName=${listName}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockListStockResponse[];
  }

  static async createStockList(
    token: string,
    listName: string,
    isPublic: boolean,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/create",
      { listName, isPublic },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async deleteStockList(token: string, listName: string) {
    const response = await HttpClient.post(
      "/stock-lists/delete",
      { listName },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async addStockToList(
    token: string,
    listName: string,
    symbol: string,
    amount: number,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/add-stock",
      { listName, symbol, amount },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async removeStockFromList(
    token: string,
    listName: string,
    symbol: string,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/remove-stock",
      { listName, symbol },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }
}
