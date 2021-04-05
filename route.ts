import express from 'express';
import bodyParser from 'body-parser';

// MongoDB setup.
const MongoClient = require('mongodb').MongoClient;
const mongoUrl = 'mongodb://localhost:27017/';
const opts = {useUnifiedTopology: true};

// App creation.
const app = express();
const port = 5004;
const clientRoot = __dirname + '/client/';
const jsonParser = bodyParser.json();

// Include the JS client.
app.use('/js', express.static('client/components'));

// Serve the JS client
app.get('/', (req, res) => {
  res.sendFile(clientRoot + 'index.html');
});
app.get('/:gameId', (req, res) => {
  console.log(req.params.gameId);
  res.sendFile(clientRoot + 'index.html');
});

// Game creation.
app.get('/game/create', (req, res) => {
  const gameId = generateGameId();
  createGame(gameId);
  res.send({gameId});
});

// Player joins a game.
app.post('/game/join', jsonParser, async (req, res) => {
  const gameId = req.body.gameId;
  const nick = req.body.nick;
  const playerId = generatePlayerId();
  const players = await joinGame(gameId, nick, playerId);
  res.send({playerId, players});
});

// Game update.
app.post('/game/update', jsonParser, async (req, res) => {
  const update = await getGameUpdate(req.body.gameId);
  res.send(update);
});

function generateGameId(): number {
  return Math.floor(Math.random() * 1000000000);
}

function generatePlayerId(): number {
  return Math.floor(Math.random() * 1000000000);
}

function createGame(gameId: number): void {
  MongoClient.connect(mongoUrl, opts, (err: Error, db: any) => {
    if (err) throw err;
    const dbo = db.db('mydb');
    const game = {gameId, started: false};
    dbo.collection('games').insertOne(game, (err: Error, res: any) => {
      if (err) throw err;
      console.log(`Game ${gameId} created.`);
        db.close();
    });
  });
}

async function joinGame(gameId: number, nick: string, playerId: number) {
  let players = [];
  let client = null;
  try {
    client = await MongoClient.connect(mongoUrl, opts);
  } catch (err) {
    throw err;
  }
  const db = client.db('mydb');
  const gameQuery = {gameId};
  try {
    const collection = db.collection('games');
    const res = await collection.findOne(gameQuery);
    players = res.players || [];
    players.push({nick, playerId});
    await collection.updateOne(gameQuery, {$set: {gameId, started: false, players}});
  } catch (err) {
    throw err;
  } finally {
    client.close();
  };
  return players.map((player: any) => player.nick);
}

async function getGameUpdate(gameId: number) {
  let players = [];
  let client = null;
  try {
    client = await MongoClient.connect(mongoUrl, opts);
  } catch (err) {
    throw err;
  }
  const db = client.db('mydb');
  const gameQuery = {gameId};
  try {
    const collection = db.collection('games');
    const res = await collection.findOne(gameQuery);
    players = res?.players || null;
  } catch (err) {
    throw err;
  } finally {
    client.close();
  };
  const update = {players: null};
  if (players) {
    update.players = players.map((player: any) => player.nick);
  }
  return update;
}

app.listen(port, () => {
  console.log(`Server running at localhost:${port}/`);
});
