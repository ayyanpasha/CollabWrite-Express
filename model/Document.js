const { model } = require("mongoose");
const { Schema } = require('mongoose');

const DocumentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    document: {
        type: Object
    },
    private: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Document = model('Document', DocumentSchema);
Document.createIndexes();
module.exports = Document;