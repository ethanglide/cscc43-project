import { HttpClient, MessageResponse, ErrorResponse } from "./http-client";

export enum StockListType {
  public = 'public',
  private = 'private',
  portfolio = 'portfolio',
}

export interface StockListsResponse {
  username: string;
  list_name: string;
  list_type: StockListType;
}

export interface PortfoliosResponse {
  username: string;
  list_name: string;
  cash: number;
}

export interface StockListStockResponse {
  symbol: string;
  amount: number;
}

export interface ReviewResponse {
  owner_username: string;
  list_name: string;
  reviewer_username: string;
  review: string;
  rating: number;
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

  static async getPortfolios(token: string) {
    const response = await HttpClient.get(`/stock-lists/portfolios`, token);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as PortfoliosResponse[];
  }

  static async getPublicStockLists() {
    const response = await HttpClient.get("/stock-lists/public");
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockListsResponse[];
  }

  static async getSharedStockLists(token: string) {
    const response = await HttpClient.get("/stock-lists/shared", token);
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as StockListsResponse[];
  }

  static async getStockListReviews(
    token: string,
    username: string,
    listName: string,
  ) {
    const response = await HttpClient.get(
      `/stock-lists/reviews?username=${username}&listName=${listName}`,
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as ReviewResponse[];
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

  static async createPortfolio(token: string, listName: string) {
    const response = await HttpClient.post(
      "/stock-lists/create-portfolio",
      { listName },
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

  static async shareStockList(
    token: string,
    listName: string,
    reviewer: string,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/share",
      { listName, reviewer },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async unshareStockList(
    token: string,
    listName: string,
    reviewer: string,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/unshare",
      { listName, reviewer },
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

  static async editReview(
    token: string,
    ownerUsername: string,
    listName: string,
    review: string,
    rating: number,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/edit-review",
      { ownerUsername, listName, review, rating },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }

  static async removeReview(
    token: string,
    listName: string,
    reviewerUsername: string,
  ) {
    const response = await HttpClient.post(
      "/stock-lists/remove-review",
      { listName, reviewerUsername },
      token,
    );
    const data = await response.json();

    if (!response.ok) {
      return data as ErrorResponse;
    }

    return data as MessageResponse;
  }
}
