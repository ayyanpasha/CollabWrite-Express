import { Schema, model, Document, Model } from "mongoose";

interface IPermission extends Document {
    userId: Schema.Types.ObjectId;
    documentId: Schema.Types.ObjectId;
    isAdmin: boolean;
    write: boolean;
}

const PermissionSchema: Schema = new Schema<IPermission>({
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

const Permission: Model<IPermission> = model<IPermission>('Permission', PermissionSchema);
Permission.createIndexes();
export default Permission;
