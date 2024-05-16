const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const gameProtoPath = 'game.proto';
const gameProtoDefinition = protoLoader.loadSync(gameProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const gameProto = grpc.loadPackageDefinition(gameProtoDefinition).game;
const db = new sqlite3.Database('./database.db'); 

// Create a table for games
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id STRING PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);


const gameService = {
  getGame: (call, callback) => {
    const { game_id } = call.request;
    
    db.get('SELECT * FROM games WHERE id = ?', [game_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        const game = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        callback(null, { game });
      } else {
        callback(new Error('Game not found'));
      }
    });
  },
  searchGames: (call, callback) => {
    db.all('SELECT * FROM games', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        const games = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        }));
        callback(null, { games });
      }
    });
  },
  CreateGame: (call, callback) => {
    const { game_id, title, description } = call.request;
    db.run(
      'INSERT INTO games (id, title, description) VALUES (?, ?, ?)',
      [game_id, title, description],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const game = {
            id: game_id,
            title,
            description,
          };
          callback(null, { game });
        }
      }
    );
  },
  updateGame: (call, callback) => {
    const { game_id, title, description } = call.request;
    db.run(
      'UPDATE games SET title = ?, description = ? WHERE id = ?',
      [title, description, game_id],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const game = {
            id : game_id,
            title,
            description,
          };
          callback(null, { game });
        }
      }
    );
  },
  deleteGame: (call, callback) => {
    const { game_id } = call.request;
    db.run(
      'DELETE FROM games WHERE id = ?',
      [game_id],
      function (err) {
        if (err) {
          callback(err);
        } else {
          callback(null, {});
        }
      }
    );
  },
};



const server = new grpc.Server();
server.addService(gameProto.GameService.service, gameService);
const port = 50051;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Game microservice running on port ${port}`);
