const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Game {
    id: String!
    title: String!
    description: String!
  }

  type Stage {
    id: String!
    title: String!
    description: String!
  }

  type User {
    id: String!
    username: String!
    password: String!
    email: String!
  }

  type Query {
    game(id: String!): Game
    games: [Game]
    stage(id: String!): Stage
    stages: [Stage]
    user(id: String!): User
    users: [User]
  
  }
  type Mutation {
    CreateGame(id: String!, title: String!, description:String!): Game
    CreateStage(id: String!, title: String!, description:String!): Stage
    UpdateGame(id: String!, title: String!, description:String!): Game
    UpdateStage(id: String!, title: String!, description:String!): Stage
    DeleteGame(id: String!): Game
    DeleteStage(id: String!): Stage
    CreateUser(id: String!, username: String!, password: String!, email: String!): User
    UpdateUser(id: String!, username: String!, password: String!, email: String!): User
    DeleteUser(id: String!): User
  
  
  }
`;

module.exports = typeDefs