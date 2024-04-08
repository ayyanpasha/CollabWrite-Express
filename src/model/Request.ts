import { Schema, model, Document, Model } from "mongoose";

interface IRequest extends Document {
    userId: Schema.Types.ObjectId;
    documentId: Schema.Types.ObjectId;
    write: boolean;
}

const RequestSchema: Schema = new Schema<IRequest>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    write: {
        type: Boolean,
        default: false
    }
});

const Request: Model<IRequest> = model<IRequest>('Request', RequestSchema);
Request.createIndexes();
export default Request;
