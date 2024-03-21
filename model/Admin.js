const { model } = require("mongoose");
const { Schema } = require('mongoose');

const AdminSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
});

const Admin = model('Admin', AdminSchema);
Admin.createIndexes();
module.exports = Admin;