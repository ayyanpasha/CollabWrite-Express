const { model } = require("mongoose");
const { Schema } = require('mongoose');

const RequestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    write: {
        type: Boolean, // true-write, false-read
        default: false
    }
});

const Request = model('Request', RequestSchema);
Request.createIndexes();
module.exports = Request;