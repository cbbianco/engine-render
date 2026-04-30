const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('solutionsplusone_crm');
    const coll = db.collection('notifications');
    
    const countFalse = await coll.countDocuments({ read: false });
    const countMissing = await coll.countDocuments({ read: { $exists: false } });
    console.log("Documents with read:false ->", countFalse);
    console.log("Documents with read missing ->", countMissing);
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
