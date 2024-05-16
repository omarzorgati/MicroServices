
const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { produceMessage } = require('./kafkaProducer');


const gameProtoPath = 'game.proto';
const stageProtoPath = 'stage.proto';
const userProtoPath = 'user.proto';
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

const db = new sqlite3.Database('./database.db');

// Create a table for games
db.run(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for stages
db.run(`
  CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);

// Create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    email TEXT
  )
`);


const resolvers = {
  Query: {
    game: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM games WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    games: () => {
      
      return new Promise((resolve, reject) => {
        clientGames.searchGames({}, async (err, response) => {
        if (err) {
        reject(err);
        } else {
        await produceMessage('games', response.games);
        resolve(response.games);
        }
        });
        });
    },
    stage: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM stages WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    stages:() => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM stages', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },
    user: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row);
          } else {
            resolve(null);
          }
        });
      });
    },
    users:() => {
      return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    },

    
  },
  Mutation: {
    CreateGame: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO games (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    CreateStage: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO stages (id, title, description) VALUES (?, ?, ?)',
          [id, title, description],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    },
    UpdateGame: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE games SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      });
    
    },
    UpdateStage: (_, { id, title, description }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE stages SET title = ?, description = ? WHERE id = ?',
          [title, description, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, title, description });
            }
          }
        );
      }
    );
    },
    DeleteGame: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM games WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      
      });
    },
    DeleteStage: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM stages WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      
      });
    },
    CreateUser: (_, { id, username, password, email }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)',
          [id, username, password, email],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email });
            }
          }
        );
      });
    
    },
    UpdateUser: (_, { id, username, password, email }) => {
      return new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?',
          [username, password, email, id],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id, username, password, email });
            }
          }
        );
      }
    );
    },
    DeleteUser: (_, { id }) => {
      return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id });
          }
        });
      
      });
    
    },
  },

  
  

};


module.exports = resolvers;
