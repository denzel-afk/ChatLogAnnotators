const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");

// CosmosDB connection details
const uri = "mongodb://denzel-chatlogdb-2:76ImmguzQnI2dQidfeGdmNTaZspWsRcKNK8uOshJLLCXRLoVttMh62AIHl25P8ZHF4mflLXlFxOcACDbOfycCg==@denzel-chatlogdb-2.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@denzel-chatlogdb-2@";
const databaseName = "chat_annotator_test";
const collectionName = "conversations";

// File path to your JSON file
const filePath = "../public/chatlog.json";
const BATCH_SIZE = 100;

async function batchInsertData() {
  const client = new MongoClient(uri);

  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    const parsedData = JSON.parse(fileData);

    if (!parsedData.chatlog || !Array.isArray(parsedData.chatlog)) {
      console.error("Error: 'chatlog' field is missing or is not an array.");
      return;
    }

    const documents = parsedData.chatlog.map((doc) => ({
      ...doc,
      _id: new ObjectId(doc._id["$oid"]),
    }));

    await client.connect();
    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    console.log(`Starting batch insert into ${collectionName}...`);

    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);

      try {
        const result = await collection.insertMany(batch);
        console.log(
          `Inserted ${result.insertedCount} documents from index ${i} to ${
            i + batch.length - 1
          }`
        );
      } catch (error) {
        console.error(`Error inserting batch at index ${i}:`, error);
      }
    }

    console.log("Batch insert completed!");
  } catch (error) {
    console.error("Error reading or inserting data:", error);
  } finally {
    await client.close();
  }
}

batchInsertData();
