import { Request, Response } from 'express';

export const logoutAllHandler = (req: Request, res: Response) => {
  res.json({
    message: "This is a stub response for the auth/logoutAll operation.",
    exampleData: {}
  });
};
