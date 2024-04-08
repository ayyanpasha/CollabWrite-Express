import express,{Request,Response} from 'express';
import fetchUser from '../middleware/fetchUser';
import Document from '../model/Document';
import mongoose from 'mongoose';
import Permission from '../model/Permission';
import RequestModel from '../model/Request';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ROUTE 1: Create Request Read Access: POST-'/api/document/request/read/:id'
router.post('/read/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const documentId = req.params.id;
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }
            const userRequested = req.headers['userId'];
            const hasPermission = ((await Permission.find({ documentId: documentId, userId: userRequested })).length !== 0);
            const onRequestList = ((await RequestModel.find({ documentId: documentId, userId: userRequested })).length !== 0);
            if (hasPermission || onRequestList) {
                return res.status(409).json({ errors: "Your Request was submitted earlier Or You have the access" });
            }

            const request = new RequestModel({ userId: userRequested, documentId: document._id });
            await request.save();

            res.json({ success: "Request Sent" });
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 2: Give Read/Write Access: PUT-'/api/document/request/access/id/:id'
router.put('/access/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const requestId = req.params.id;
            if (!mongoose.isValidObjectId(requestId)) {
                return res.status(404).json({ errors: "Request doesn't exist" });
            }
            const request = await RequestModel.findById(requestId);
            if (!request) {
                return res.status(404).json({ errors: "Request doesn't exist" });
            }

            const permission = await Permission.find({ userId: req.headers['userId'], documentId: request.documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const giveAccess = new Permission({ userId: request.userId, documentId: request.documentId, write: request.write });
            await giveAccess.save();
            await RequestModel.findByIdAndDelete(requestId);

            res.json({ success: "Access Given" });
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 3: Get Request Users: PUT-'/api/document/request/id/:id'
router.get('/access/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const documentId = req.params.id;
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }

            const permission = await Permission.find({ userId: req.headers['userId'], documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const request = await RequestModel.find({ documentId: documentId }).populate('userId').exec();
            res.json(request);
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

export default router;