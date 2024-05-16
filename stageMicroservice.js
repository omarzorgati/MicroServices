const sqlite3 = require('sqlite3').verbose();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const stageProtoPath = 'Stage.proto';
const stageProtoDefinition = protoLoader.loadSync(stageProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const stageProto = grpc.loadPackageDefinition(stageProtoDefinition).stage;
const db = new sqlite3.Database('./database.db'); 

// Create a table for stages
db.run(`
  CREATE TABLE IF NOT EXISTS stages (
    id STRING PRIMARY KEY,
    title TEXT,
    description TEXT
  )
`);


const stageService = {
  getStage: (call, callback) => {
    const { stage_id } = call.request;
    
    db.get('SELECT * FROM stages WHERE id = ?', [stage_id], (err, row) => {
      if (err) {
        callback(err);
      } else if (row) {
        const stage = {
          id: row.id,
          title: row.title,
          description: row.description,
        };
        callback(null, { stage });
      } else {
        callback(new Error('Stage not found'));
      }
    });
  },
  searchStages: (call, callback) => {
    db.all('SELECT * FROM stages', (err, rows) => {
      if (err) {
        callback(err);
      } else {
        const stages = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
        }));
        callback(null, { stages });
      }
    });
  },
  CreateStage: (call, callback) => {
    const { stage_id, title, description } = call.request;
    db.run(
      'INSERT INTO stages (id, title, description) VALUES (?, ?, ?)',
      [stage_id, title, description],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const stage = {
            id: stage_id,
            title,
            description,
          };
          callback(null, { stage });
        }
      }
    );
  },
  updateStage: (call, callback) => {
    const { stage_id, title, description } = call.request;
    db.run(
      'UPDATE stages SET title = ?, description = ? WHERE id = ?',
      [title, description, stage_id],
      function (err) {
        if (err) {
          callback(err);
        } else {
          const stage = {
            id : stage_id,
            title,
            description,
          };
          callback(null, { stage });
        }
      }
    );
  },
  deleteStage: (call, callback) => {
    const { stage_id } = call.request;
    db.run(
      'DELETE FROM stages WHERE id = ?',
      [stage_id],
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
server.addService(stageProto.StageService.service, stageService);
const port = 50052;
server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
  
    console.log(`Server is running on port ${port}`);
    server.start();
  });
console.log(`Stage microservice running on port ${port}`);
