import express, { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import fetchUser from '../middleware/fetchUser';
import Document from '../model/Document';
import mongoose from 'mongoose';
import Permission from '../model/Permission';
import RequestModel from '../model/Request';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ROUTE 1: Create new Document: POST-'/api/document/new'
router.post('/new',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            //Create New Note document
            const newDocument = {
                title: "Untitled document",
                document: { ops: [{ insert: '\n' }] }
            };
            //Create document, Permission & Admin
            const document = new Document(newDocument);
            const permission = new Permission({ userId: req.headers['userId'], documentId: document._id, write: true, isAdmin: true });
            // const admin = new Admin({ userId: req.user.id, documentId: document._id });

            //Store Document & Permission
            const savedDocument = await document.save();
            await permission.save();
            // await admin.save();


            res.json(savedDocument);
        } catch (error) {
            return res.status(500).json({ errors: 'Internal Server Error' });
        }
    }
);

// ROUTE 2: Read Document: GET-'/api/document/id/:id'
router.get('/id/:id',
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

            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).send({ errors: "Please login in" });
            }

            try {
                const data = jwt.verify(token, process.env.JWT_SECRET as Secret) as { user: { id: string } };
                const userRequested = data.user.id;
                const hasPermission = await Permission.find({ documentId: documentId, userId: userRequested }).populate('documentId').exec();

                if (hasPermission.length !== 0) {
                    return res.json(hasPermission);
                }
            } catch (error) {
                if (!document.private) {
                    return res.status(200).send([{ write: false, isAdmin: false, documentId: document }]);
                }
                return res.status(401).send({ errors: "Not Authuorized" });
            }



            if (!document.private) {
                return res.status(200).send([{ write: false, isAdmin: false, documentId: document }]);
            }

            res.status(401).json({ errors: "Unauthenticated" });

        } catch (error) {
            return res.status(500).json({ errors: error });
        }
    }
);

// ROUTE 3: Update Document: PUT-'/api/document/id/:id'
router.put('/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const documentId = req.params.id;
            if (!isQuillFormat(req.body.document)) {
                return res.status(404).json({ errors: "Invalid Format" });
            }
            //Check for valid ObjectID
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //Check if Document Exist
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //If the user changing has WRITE access
            const permission = await Permission.find({ userId: req.headers['userId'], documentId: documentId });
            if (permission.length === 0 || permission[0].write === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const result = await Document.findByIdAndUpdate(documentId, { $set: { document: req.body.document } });
            res.json({ success: `Updated` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 4: Delete Document: DELETE-'/api/document/id/:id'
router.delete('/id/:id',
    fetchUser,
    async (req: Request, res: Response                                  ) => {
        try {
            const documentId = req.params.id;
            //Check for valid ObjectID
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //Check if Document Exist
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //If the user changing has WRITE access
            const permission = await Permission.find({ userId: req.headers['userId'], documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            //TODO, DELETE CORRESPONDING USERS, Permissions, Admins
            await Document.findByIdAndDelete(documentId);
            await Permission.deleteMany({ documentId: documentId });
            await RequestModel.deleteMany({ documentId: documentId });

            res.json({ success: `Deleted Successfully` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 5: Update Document Title: PATCH-'/api/document/title/id/:id'
router.patch('/title/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const documentId = req.params.id;
            //Check for valid ObjectID
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //Check if Document Exist
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //If the user changing has WRITE access
            const permission = await Permission.find({ userId: req.headers['userId'], documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            //TODO, DELETE CORRESPONDING USERS, Permissions, Admins
            await Document.findByIdAndUpdate(documentId, { $set: { title: req.body.title } });
            res.json({ success: `Updated Title` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 6: Document List: GET-'/api/document/list'
router.get('/list',
    fetchUser,
    async (req:Request, res: Response) => {
        try {
            const document = await Permission.find({ userId: req.headers['userId'] }).populate('documentId').exec();
            res.json(document);
        } catch (error) {
            return res.status(500).json({ errors: error });
        }
    }
);

// ROUTE 7: Change Document Access: PUT-'/api/document/access/id/:id'
router.put('/access/id/:id',
    fetchUser,
    async (req: Request, res: Response) => {
        try {
            const documentId = req.params.id;
            if (typeof req.body.private !== 'boolean')
                return res.json({ error: `Invalid Entry` });
            //Check for valid ObjectID
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //Check if Document Exist
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document does not exist" });
            }
            //If the user changing has WRITE access
            const permission = await Permission.find({ userId: req.headers['userId'], documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            await Document.findByIdAndUpdate(documentId, { $set: { private: req.body.private } });
            res.json({ success: `Updated` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

function isQuillFormat(obj: any) {
    // Check if the object has an `ops` property
    if (obj && Array.isArray(obj.ops)) {
        // Additional checks can be added here based on the expected structure of `ops`
        return true; // Object is in Quill format
    }
    return false; // Object is not in Quill format
}

export default router;