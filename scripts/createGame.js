const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const opts = {useUnifiedTopology: true};

MongoClient.connect(url, opts, (err, db) => {
  if (err) throw err;
  const dbo = db.db('mydb');
  const game = {name: 'waste', playerCount: 4};
  dbo.collection('games').insertOne(game, (err, res) => {
    if (err) throw err;
      console.log('Game created.');
      db.close();
  });
});
