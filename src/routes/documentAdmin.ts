import express, { Request, Response } from 'express';
import fetchUser from '../middleware/fetchUser';
import mongoose from 'mongoose';
import Permission from '../model/Permission';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ROUTE 1: Set Admin: PUT-'/api/document/admin/id/:id'
router.put('/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const permissionId = req.params.id;
            //Check for valid ObjectID
            if (!mongoose.isValidObjectId(permissionId)) {
                return res.status(404).json({ errors: "User doesn't control this document" });
            }
            //Check if Permission Exist
            const permission = await Permission.findById(permissionId);
            if (!permission) {
                return res.status(404).json({ errors: "Invalid" });
            }
            //If the user changing is ADMIN
            const userRequesting = await Permission.find({ userId: req.headers['userId'], documentId: permission.documentId })
            if (userRequesting.length === 0 || userRequesting[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }
            //If the user to be made is already ADMIN
            await Permission.updateOne({ userId: permission.userId, documentId: permission.documentId }, { $set: { isAdmin: true } });
            res.json({ success: `Made Admin` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

export default router;