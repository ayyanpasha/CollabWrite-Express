const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const { default: mongoose } = require('mongoose');
const Permission = require('../model/Permission');
const Admin = require('../model/Admin');
require('dotenv').config();

const router = express.Router();
// ROUTE 1: Update Permission: PUT-'/api/document/permission/id/:id'
router.put('/id/:id',
    fetchUser,
    async (req, res) => {
        try {
            const permissionId = req.params.id;
            const write = req.body.write;
            if (!mongoose.isValidObjectId(permissionId)) {
                return res.status(404).json({ errors: "User doesn't control this document" });
            }
            const permission = await Permission.findById(permissionId);
            if (!permission) {
                return res.status(404).json({ errors: "User doesn't control this document" });
            }

            const userRequesing = await Permission.find({ userId: req.user.id, documentId: permission.documentId });

            if (userRequesing.length === 0 || userRequesing[0].isAdmin === false) {

                return res.status(401).json({ errors: "Unauthorized" });
            }

            if (write === "write") {
                const result = await Permission.findByIdAndUpdate(permissionId, { $set: { write: true } });
                return res.json(result);
            } else if (write === "read") {
                const result = await Permission.findByIdAndUpdate(permissionId, { $set: { write: false } });
                return res.json(result);
            } else {
                res.json({ errors: `Invalid Request` });
            }
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 2: Delete Permission: DELETE-'/api/document/permission/id/:id'
router.delete('/id/:id',
    fetchUser,
    async (req, res) => {
        try {
            const permissionId = req.params.id;
            if (!mongoose.isValidObjectId(permissionId)) {
                return res.status(404).json({ errors: "User doesn't controll this document" });
            }
            const permission = await Permission.findById(permissionId);
            if (!permission) {
                return res.status(404).json({ errors: "User doesn't controll this document" });
            }

            const admin = await Admin.find({ userId: req.user.id, documentId: permission.documentId });
            if (!admin) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            await Permission.findByIdAndDelete(permissionId);
            res.json({ success: `Permission Deleted` });

        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);

// ROUTE 3: Get Permissioned Users: GET-'/api/document/permission/id/:id'
router.get('/id/:id',
    fetchUser,
    async (req, res) => {
        try {
            const documentId = req.params.id;
            if (!mongoose.isValidObjectId(documentId)) {
                return res.status(404).json({ errors: "User doesn't control this document" });
            }
            const permission = await Permission.find({ userId: req.user.id, documentId: documentId });
            if (permission.length === 0 || permission[0].isAdmin === false) {
                return res.status(401).json({ errors: "Unauthorized" });
            }

            const people = await Permission.find({ documentId: documentId }).populate('userId').exec();

            res.json(people);
        } catch (error) {
            return res.status(500).json({ errors: `Document doesn't exist/Internal Server Error` });
        }
    }
);


module.exports = router;