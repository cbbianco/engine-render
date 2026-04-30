const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('solutionsplusone_crm');
    const coll = db.collection('notifications');
    const docs = await coll.find({ type: "success" }).sort({ createdAt: -1 }).limit(10).toArray();
    console.log(JSON.stringify(docs, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
