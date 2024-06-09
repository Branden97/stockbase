import { Request, Response } from 'express';

export const loginHandler = (req: Request, res: Response) => {
  res.json({
    message: "This is a stub response for the auth/login operation.",
    exampleData: {"token": "example.jwt.token"}
  });
};
