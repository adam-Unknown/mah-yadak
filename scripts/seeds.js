const { MongoClient, ObjectId } = require("mongodb");

const parts = [
  {
    brand: "Apple",
    category: "Laptop",
    description: "Apple MacBook Pro 13-inch 2021",
    imageUrls: ["https://i.imgur.com/123456.jpg"],
    sale: {
      interestRates: 10,
      purchasePrice: 10000000,
      salesPrice: 10000000,
      updatePriceAt: new Date(),
    },
    id: "0",
    modal: "laptop",
    suitable: "Laptop",
    usedFor: ["Laptop", "Desktop"],
    warehouse: {
      placehold: "1000",
      quantity: 1000,
      warnAt: 1000,
    },
  },
  {
    brand: "Apple",
    category: "Laptop",
    description: "Apple MacBook Pro 13-inch 2021",
    imageUrls: ["https://i.imgur.com/123456.jpg"],
    sale: {
      interestRates: 10,
      purchasePrice: 10000000,
      salesPrice: 10000000,
      updatePriceAt: new Date(),
    },
    id: "0",
    modal: "laptop",
    suitable: "Laptop",
    usedFor: ["Laptop", "Desktop"],
    warehouse: {
      placehold: "1000",
      quantity: 1000,
      warnAt: 1000,
    },
  },
];

const performCURD = async (client) => {
  const db = client.db("mah-yadak");

  const partsCollection = db.collection("parts");

  await partsCollection.insertMany(
    parts.map((part) => {
      const { id, ...partWithoutId } = part;
      return { ...partWithoutId };
    })
  );
};

(async () => {
  const url =
    "mongodb+srv://muhammadasukere:1s20FKMLuilvuOiR@cluster0.2hpnmos.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(url);
  try {
    client.connect();
    console.log("connected to MongoDB");
    await performCURD(client);
  } finally {
    client.close();
    console.log("disconnect from MongoDB");
  }
})().catch((err) => console.log(err));
