const { model } = require("mongoose");
const { Schema } = require('mongoose');

const PermissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    write: {
        type: Boolean,
        default: false
    }
});

const Permission = model('Permission', PermissionSchema);
Permission.createIndexes();
module.exports = Permission;