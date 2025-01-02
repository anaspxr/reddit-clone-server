import mongoose, { Schema } from "mongoose";

interface IMessage {
  message: string;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model("Message", messageSchema);
