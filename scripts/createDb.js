const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const opts = {useUnifiedTopology: true};

MongoClient.connect(url, opts, (err, db) => {
  if (err) throw err;
  console.log('DB created.');
  db.close();
});
