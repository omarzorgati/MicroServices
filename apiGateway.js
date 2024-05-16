const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require ('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { consumeMessages } = require('./kafkaConsumer');


const gameProtoPath = 'game.proto';
const stageProtoPath = 'Stage.proto';
const userProtoPath = 'user.proto';

const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const db = new sqlite3.Database('./database.db'); 

// Create a table for games
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id STRING PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for stages
db.run(`
  CREATE TABLE IF NOT EXISTS stages (
    id STRING PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id STRING PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT
  )
`);



const app = express();
app.use(bodyParser.json());

const gameProtoDefinition = protoLoader.loadSync(gameProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const stageProtoDefinition = protoLoader.loadSync(stageProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const gameProto = grpc.loadPackageDefinition(gameProtoDefinition).game;
  const stageProto = grpc.loadPackageDefinition(stageProtoDefinition).stage;
  const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
  const clientGames = new gameProto.GameService('localhost:50051', grpc.credentials.createInsecure());
  const clientStages = new stageProto.StageService('localhost:50052', grpc.credentials.createInsecure());
  const userGames = new userProto.UserService('localhost:50053', grpc.credentials.createInsecure());

const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
    app.use(
        cors(),
        bodyParser.json(),
        expressMiddleware(server),
      );
  });


  app.get('/games', (req, res) => {
    clientGames.searchGames({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.games);
      }
    });
  });
//kafka
  app.post('/games', async (req, res) => {
    const game = req.body;
    await consumeMessages('games_topic', game);
    res.send({ message: 'Game created', data: game });
    });
    app.post('/stages', async (req, res) => {
      const stage = req.body;
      await consumeMessages('stages_topic', stage);
      res.send({ message: 'stage created', data: stage });
      });
      app.post('/users', async (req, res) => {
        const user = req.body;
        await consumeMessages('users_topic', user);
        res.send({ message: 'user created', data: user });
        });
  
  app.get('/games/:game_id', (req, res) => {
    clientGames.getGame({ game_id: req.params.game_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.game);
      }
    });
  });
  
  app.post('/games', (req, res) => {
    const game = req.body;
    clientGames.CreateGame(game, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.put('/games/:game_id', (req, res) => {
    const game = { ...req.body,game_id: req.params.game_id };
    clientGames.updateGame(game, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.delete('/games/:game_id', (req, res) => {
    clientGames.deleteGame({ game_id: req.params.game_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    });
  });
  
  // Stages
  app.get('/stages', (req, res) => {
    clientStages.searchStages({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.stages);
      }
    });
  });
  
  app.get('/stages/:stage_id', (req, res) => {
    clientStages.getStage({ stage_id: req.params.stage_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.post('/stages', (req, res) => {
    const stage = req.body;
    clientStages.CreateStage(stage, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.put('/stages/:stage_id', (req, res) => {
    const stage = { ...req.body, stage_id: req.params.stage_id };
    clientStages.updateStage(stage, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.delete('/stages/:stage_id', (req, res) => {
    clientStages.deleteStage({ stage_id: req.params.stage_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    });
  });
  
  // Users
  app.get('/users', (req, res) => {
    userGames.searchUsers({}, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response.users);
      }
    });
  });
  
  app.get('/users/:user_id', (req, res) => {
    userGames.getUser({ user_id: req.params.user_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.post('/users', (req, res) => {
    const user = req.body;
    userGames.CreateUser(user, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  app.put('/users/:user_id', (req, res) => {
    const user = { ...req.body, user_id: req.params.user_id };
    userGames.updateUser(user, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(response);
      }
    });
  });
  
  app.delete('/users/:user_id', (req, res) => {
    userGames.deleteUser({ user_id: req.params.user_id }, (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(204);
      }
    });
  });
  

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
