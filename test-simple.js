const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to MongoDB Atlas...');
console.log('URI (password hidden):', uri.replace(/:[^:@]*@/, ':****@'));

const client = new MongoClient(uri);

async function run() {
  try {
    // Set a shorter timeout
    const timeoutMS = 10000; // 10 seconds
    console.log(`Attempting to connect (timeout: ${timeoutMS}ms)...`);
    
    await client.connect();
    console.log('✅ Connected successfully to MongoDB Atlas!');
    
    // Send a ping to confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged deployment. Connection confirmed!");
    
    // List databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nThis suggests a firewall or network issue.');
      console.log('Try:');
      console.log('1. Using a different network (mobile hotspot)');
      console.log('2. Checking Windows Firewall settings');
      console.log('3. Checking if your ISP/network blocks MongoDB ports');
    }
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

run().catch(console.dir);