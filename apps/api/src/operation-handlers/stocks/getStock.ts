import { Request, Response } from 'express';

export const getStockHandler = (req: Request, res: Response) => {
  res.json({
    message: "This is a stub response for the stocks/getStock operation.",
    exampleData: {"id": 1, "symbol": "AAPL", "company_name": "Apple Inc.", "created_at": "2023-01-01T00:00:00Z", "updated_at": "2023-01-01T00:00:00Z"}
  });
};
