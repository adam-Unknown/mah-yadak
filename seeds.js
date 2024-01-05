const { MongoClient, ObjectId } = require("mongodb");

const products = [
  {
    name: "Product 1",
    price: 10,
    category: "Category A",
  },
  {
    name: "Product 2",
    price: 20,
    category: "Category B",
  },
  {
    name: "Product 3",
    price: 30,
    category: "Category C",
  },
  {
    name: "Product 4",
    price: 40,
    category: "Category D",
  },
  {
    name: "Product 5",
    price: 50,
    category: "Category E",
  },
  {
    name: "Product 6",
    price: 60,
    category: "Category F",
  },
  {
    name: "Product 7",
    price: 70,
    category: "Category G",
  },
  {
    name: "Product 8",
    price: 80,
    category: "Category H",
  },
  {
    name: "Product 9",
    price: 90,
    category: "Category I",
  },
  {
    name: "Product 10",
    price: 100,
    category: "Category J",
  },
];

const performCURD = async (client) => {
  const db = client.db("mah-yadak");

  const partsCollection = db.collection("parts");
  const suggestionsCollection = db.collection("suggestions");

  db.renameCollection("suggestions", "part-list");
  // console.log(
  //   `ID ${x} : ${await partsCollection.find({_id: suggest.parts})}`
  // );
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
