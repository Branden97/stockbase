import { Request, Response } from 'express';

export const getUserHandler = (req: Request, res: Response) => {
  res.json({
    message: "This is a stub response for the users/getUser operation.",
    exampleData: {"id": 1, "username": "user1", "email": "user1@example.com", "created_at": "2023-01-01T00:00:00Z", "updated_at": "2023-01-01T00:00:00Z"}
  });
};
