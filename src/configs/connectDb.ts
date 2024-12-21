import mongoose from "mongoose";
import { ENV } from "./env";

const connectDb = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("Connected to Database");
  } catch (error) {
    console.error("Failed to connect to the Database, ", error);
  }
};

export default connectDb;
