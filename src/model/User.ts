import { model, Schema, Document, Model } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    date: Date;
}

const UserSchema: Schema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User: Model<IUser> = model<IUser>('User', UserSchema);
User.createIndexes();
export default User;
