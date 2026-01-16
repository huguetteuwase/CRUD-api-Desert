"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const store_1 = require("../data/store");
const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("Missing MongoDB connection string. Set `MONGODB_URI` (or `MONGO_URI`/`MONGO_URL`) in your environment or .env file.");
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(uri);
        console.log("MongoDB Connected");
        // Seed categories from in-memory store if collection is empty
        try {
            // Ensure seed categories exist and have legacyId set.
            if (store_1.categories && store_1.categories.length) {
                let upserted = 0;
                for (const c of store_1.categories) {
                    const res = await categoryModel_1.default.findOneAndUpdate({ legacyId: c.id }, {
                        $set: {
                            name: c.name,
                            description: c.description,
                            legacyId: c.id,
                        },
                    }, { upsert: true, new: true });
                    if (res)
                        upserted++;
                }
                if (upserted > 0)
                    console.log(`Upserted ${upserted} seed categories into MongoDB`);
            }
        }
        catch (seedErr) {
            console.warn("Category seeding failed:", seedErr);
        }
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
