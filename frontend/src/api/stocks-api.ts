import { ErrorResponse, HttpClient } from "./http-client";

export interface StockResponse {
    symbol: string;
}

export default class StocksApi {
    static async getStocks() {
        const response = await HttpClient.get("/stocks");
        const data = await response.json();

        if (!response.ok) {
            return data as ErrorResponse;
        }

        return data as StockResponse[];
    }
}
