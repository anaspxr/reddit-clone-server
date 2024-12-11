import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("Mongo URI is missing!");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to Database");
  } catch (error) {
    console.error("Failed to connect to the Database, ", error);
  }
};

export default connectDb;
