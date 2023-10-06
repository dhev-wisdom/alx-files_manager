const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

const uri = `mongodb://${host}:${port}`;

class DBClient {
  constructor () {
    this.isConnected = false;
    this.connect();
  }
  async connect() {
    try {
      this.client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
      await this.client.connect();
      console.log('Connection To MongoDB server successful');
      this.db = this.client.db(database);
      this.isConnected = true;
    } catch (err) {
      console.error('Error in connection: ', err);
      this.isConnected = false;
      //throw err;
    }
  }
  async close() {
    try {
      await this.client.close();
      console.log('MongoDB connection closed successfully');
    } catch (err) {
      console.error('Error encountered while closing connection: ', err);
      //throw err;
    }
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    const col_name = 'users';
    const collection = this.db.collection(col_name);
    try {
      const documentsCount = await collection.countDocuments();
      return documentsCount;
    } catch (err) {
      console.error(`Encountered an error while fetching documents in ${col_name}`);
      //throw err;
    }
  }
  
  async nbFiles() {
    const col_name = 'files';
    const collection = this.db.collection(col_name);
    try {
      const documentsCount = await collection.countDocuments();
      return documentsCount;
    } catch (err) {
      console.error(`Encountered an error while fetching documents in ${col_name}`);
      //throw err;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
