const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const Document = require('../model/Document');
const { default: mongoose } = require('mongoose');
const Permission = require('../model/Permission');
const Request = require('../model/Request');
require('dotenv').config();

const router = express.Router();

// ROUTE 1: Create Request Read Access: POST-'/api/document/request/read/:id'
router.post('/read/id/:id',
    fetchUser,
    async (req, res) => {
        try {
            const documentId = req.params.id;
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }
            const userRequested = req.user.id;
            const hasPermission = ((await Permission.find({ documentId: documentId, userId: userRequested })).length !== 0);
            const onRequestList = ((await Request.find({ documentId: documentId, userId: userRequested })).length !== 0);
            if (hasPermission || onRequestList) {
                return res.status(409).json({ errors: "Your Request was submitted earlier Or You have the access" });
            }

            const request = new Request({ userId: req.user.id, documentId: document._id });
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
    async (req, res) => {
        try {
            const requestId = req.params.id;
            if (!mongoose.isValidObjectId(requestId)) {
                return res.status(404).json({ errors: "Request doesn't exist" });
            }
            const request = await Request.findById(requestId);
            if (!request) {
                return res.status(404).json({ errors: "Request doesn't exist" });
            }

            const permission = await Permission.find({ userId: req.user.id, documentId: request.documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const giveAccess = await Permission({ userId: request.userId, documentId: request.documentId, write: request.write });
            await giveAccess.save();
            await Request.findByIdAndDelete(requestId);

            res.json({ success: "Access Given" });
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 3: Get Request Users: PUT-'/api/document/request/id/:id'
router.get('/access/id/:id',
    fetchUser,
    async (req, res) => {
        try {
            const documentId = req.params.id;
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "Document doesn't exist" });
            }

            const permission = await Permission.find({ userId: req.user.id, documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const request = await Request.find({ documentId: documentId }).populate('userId').exec();
            res.json(request);
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

module.exports = router;