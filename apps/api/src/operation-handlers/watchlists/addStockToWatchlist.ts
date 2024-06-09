import { Request, Response } from 'express';

export const addStockToWatchlistHandler = (req: Request, res: Response) => {
  res.json({
    message: "This is a stub response for the watchlists/addStockToWatchlist operation.",
    exampleData: {"id": 1, "watchlist_id": 1, "stock_id": 1, "created_at": "2023-01-01T00:00:00Z", "updated_at": "2023-01-01T00:00:00Z"}
  });
};
