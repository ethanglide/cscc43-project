export interface StockList {
  username: string;
  list_name: string;
  public: boolean;
}

export interface StockListStock {
  symbol: string;
  amount: number;
}
