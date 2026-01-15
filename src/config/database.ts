import mongoose from "mongoose";
import CategoryModel from "../models/categoryModel";
import { categories as seedCategories } from "../data/store";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "Missing MongoDB connection string. Set `MONGODB_URI` (or `MONGO_URI`/`MONGO_URL`) in your environment or .env file."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");

    // Seed categories from in-memory store if collection is empty
    try {
      // Ensure seed categories exist and have legacyId set.
      if (seedCategories && seedCategories.length) {
        let upserted = 0;
        for (const c of seedCategories) {
          const res = await CategoryModel.findOneAndUpdate(
            { legacyId: c.id },
            {
              $set: {
                name: c.name,
                description: c.description,
                legacyId: c.id,
              },
            },
            { upsert: true, new: true }
          );
          if (res) upserted++;
        }
        if (upserted > 0)
          console.log(`Upserted ${upserted} seed categories into MongoDB`);
      }
    } catch (seedErr) {
      console.warn("Category seeding failed:", seedErr);
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
