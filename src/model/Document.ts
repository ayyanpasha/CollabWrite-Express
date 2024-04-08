import { Schema, model, Document as mDocument, Model } from "mongoose";

interface IDocument extends mDocument {
    title: string;
    document?: object;
    private: boolean;
    date: Date;
}

const DocumentSchema: Schema = new Schema<IDocument>({
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

const Document: Model<IDocument> = model<IDocument>('Document', DocumentSchema);
Document.createIndexes();
export default Document;
