const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const Document = require('../model/Document');
const { default: mongoose } = require('mongoose');
const Permission = require('../model/Permission');
require('dotenv').config();

const router = express.Router();

// ROUTE 1: Set Admin: PUT-'/api/document/admin/id/:id'
router.put('/id/:id',
    fetchUser,
    async (req, res) => {
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
            const userRequesting = await Permission.find({ userId: req.user.id, documentId: permission.documentId })
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

module.exports = router;