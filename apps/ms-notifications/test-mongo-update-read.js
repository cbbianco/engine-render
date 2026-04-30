const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('solutionsplusone_crm');
    const coll = db.collection('notifications');
    
    const result = await coll.updateMany({ read: { $ne: true } }, { $set: { read: true } });
    console.log("Documents updated to read:true ->", result.modifiedCount);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
