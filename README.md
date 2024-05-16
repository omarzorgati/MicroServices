# Game Stage Microservice
Game Stage Microservice is a microservices-based application built with Node.js, gRPC, GraphQL, and REST, 
using SQLite as the database. It consists of three entities: User, Game, and Stage. 
This README file provides an overview of the project and other relevant information.

## Table of Contents
Features
Technologies
Getting Started
Prerequisites
Usage
API Endpoints
Database
Contributing

## Features
Microservices architecture with gRPC, GraphQL, and REST
CRUD operations for User, Game, and Stage entities
Communication between services using gRPC and RESTful APIs
GraphQL endpoint for flexible querying and data manipulation

## Technologies
Node.js
gRPC
GraphQL
RESTful APIs
SQLite

# Getting Started

## Prerequisites :
Node.js 
npm 
SQLite 
graphql 

## Installation :
download all files
Install the dependencies

## Usage : 
Start the microservices:
Start all microservices and the gateway in this order :
nodemon gameMicroservice.js
nodemon stageMicroservice.js
nodemon userMicroservice.js
nodemon apiGateway.js
The microservices should now be running, and you can access them using the provided endpoints.

## API Endpoints :
GET /game: Retrieves all games from the database.
GET /games/:id: Retrieves a specific game by its ID.
GET /stages/:id: Retrieves a specific stage by its ID.
GET /stages: Retrieves all stages from the database.
POST /game: Creates a new game in the database.
POST /stages: Creates a new stage in the database.
PUT /game/:id: Updates a specific game by its ID.
PUT /stage/:id: Updates a specific stage by its ID.
DELETE /game/:id: Deletes a specific game by its ID.
DELETE /stage/:id: Deletes a specific stage by its ID.
GET /games: Retrieves all games from the database.
GET /users: Retrieves all users from the database.
GET /users/:id: Retrieves a specific user by its ID.
POST /user: Creates a new user in the database.
DELETE /user/:id: Deletes a specific user by its ID.

## Database :
The project uses SQLite as the database system. The SQLite database file can be found in the database directory.you can delete the database file and it will be recreated when starting the project.

## Contributing :
Contributions are welcome! If you find any issues or have suggestions for improvement, please submit an issue or a pull request. For major changes, please open an issue first to discuss potential changes.
