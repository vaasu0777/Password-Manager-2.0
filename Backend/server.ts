import dotenv from "dotenv";
dotenv.config({ path: "C:\\Users\\Ishika\\Coding-by-Vaasu\\Password-Manager-2.0\\.env" });
import cors from "cors";
import crypto from "crypto";
import { MongoClient, ObjectId } from "mongodb";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import express, { Request, Response } from "express";

// ✅ Augment Express Request to include Clerk's auth property
declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionId: string;
        getToken: () => Promise<string | null>;
      };
    }
  }
}

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Connecting to MongoDB
const client = new MongoClient(process.env.MONGODB_URL as string);

(async () => {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();

// ---------- CRYPTO HELPERS ----------

function deriveKey(userId: string): Buffer {
  return crypto.pbkdf2Sync(userId, "some-fixed-salt", 310_000, 32, "sha256");
}

function encryptDetails(text: string | number, userId: string): string {
  const iv = crypto.randomBytes(12);
  const key = deriveKey(userId);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(text), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Pack: iv (12) + tag (16) + encrypted
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptDetails(storedData: string, userId: string): string {
  const buf = Buffer.from(storedData, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const key = deriveKey(userId);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
    "utf8"
  );
}

// ---------- PASSWORD ROUTES ----------

// Get all passwords
app.get("/passwords", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("passwords");

    const data = await collection.find({ userId }).toArray();

    const decrypted = data.map((entry) => {
      try {
        return {
          ...entry,
          username: decryptDetails(entry.username as string, userId),
          password: decryptDetails(entry.password as string, userId),
        };
      } catch {
        // Old unencrypted entry — return as-is
        return entry;
      }
    });

    res.json(decrypted);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Save a password
app.post("/passwords", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { site, username, password } = req.body as {
      site: string;
      username: string;
      password: string;
    };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("passwords");

    await collection.insertOne({
      site,
      username: encryptDetails(username, userId),
      password: encryptDetails(password, userId),
      userId,
    });

    res.json({ message: "Mission Accomplished 👍🗿🔥" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Edit a password
app.put("/passwords", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { _id, site, username, password } = req.body as {
      _id: string;
      site: string;
      username: string;
      password: string;
    };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("passwords");

    await collection.updateOne(
      { _id: new ObjectId(_id), userId },
      {
        $set: {
          site,
          username: encryptDetails(username, userId),
          password: encryptDetails(password, userId),
        },
      }
    );

    res.json({ message: "Mission Accomplished 🗿🗿👍" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a password
app.delete("/passwords", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { _id } = req.body as { _id: string };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("passwords");

    await collection.deleteOne({ _id: new ObjectId(_id), userId });

    res.json({ message: "Mission Accomplished 🗿👍" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- CARD ROUTES ----------

// Get all cards
app.get("/cards", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("cards");
    const data = await collection.find({ userId }).toArray();

    const decrypted = data.map((entry) => {
      try {
        return {
          ...entry,
          CardNumber: decryptDetails(entry.CardNumber as string, userId),
          CVV: decryptDetails(entry.CVV as string, userId),
          ExpiryDate: decryptDetails(entry.ExpiryDate as string, userId),
        };
      } catch {
        // Old unencrypted entry — return as-is
        return entry;
      }
    });

    res.json(decrypted);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Save a card
app.post("/cards", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { cardHolderName, CardNumber, ExpiryDate, CVV, Comments } =
      req.body as {
        cardHolderName: string;
        CardNumber: string;
        ExpiryDate: string;
        CVV: string;
        Comments?: string;
      };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("cards");

    await collection.insertOne({
      cardHolderName,
      CardNumber: encryptDetails(CardNumber, userId),
      ExpiryDate: encryptDetails(ExpiryDate, userId),
      CVV: encryptDetails(CVV, userId),
      Comments,
      userId,
    });

    res.json({ message: "Mission Accomplished 🗿👍" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Edit a card
app.put("/cards", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { _id, cardHolderName, CardNumber, ExpiryDate, CVV, Comments } =
      req.body as {
        _id: string;
        cardHolderName: string;
        CardNumber: string;
        ExpiryDate: string;
        CVV: string;
        Comments?: string;
      };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("cards");

    await collection.updateOne(
      { _id: new ObjectId(_id), userId },
      {
        $set: {
          cardHolderName,
          CardNumber: encryptDetails(CardNumber, userId),
          ExpiryDate: encryptDetails(ExpiryDate, userId),
          CVV: encryptDetails(CVV, userId),
          Comments,
        },
      }
    );

    res.json({ message: "Mission Accomplished 🗿🗿👍" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a card
app.delete("/cards", ClerkExpressRequireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth;
    const { _id } = req.body as { _id: string };

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("cards");

    await collection.deleteOne({ _id: new ObjectId(_id), userId });

    res.json({ message: "Mission Accomplished 🗿🗿👍" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- START SERVER ----------

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});