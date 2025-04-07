export enum StockListType {
  public = "public",
  private = "private",
  portfolio = "portfolio",
}

export interface StockList {
  username: string;
  list_name: string;
  list_type: StockListType;
}

export interface Portfolio {
  username: string;
  list_name: string;
  cash: number;
}

export interface StockListStock {
  symbol: string;
  amount: number;
  beta: number;
  CV: number;
}

export interface CorrelationMatrix {
  symbols: string[];
  correlations: number[][];
}
