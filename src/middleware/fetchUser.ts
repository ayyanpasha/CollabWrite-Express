import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const fetchUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ errors: "Please login in" });
    }

    try {
        // Type assertion on data
        const data = jwt.verify(token, process.env.JWT_SECRET as Secret) as { user: { id: string } };
        req.headers["userId"] = data.user.id;
        next();
    } catch (error) {
        return res.status(401).send({ errors: "Not Authorized" });
    }
};

export default fetchUser;
