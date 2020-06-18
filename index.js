const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_KEY, { useNewUrlParser: true });
const db = mongoose.connection;

const movieSchema = new mongoose.Schema({
  title: String,
  releaseDate: Date,
  rating: Number,
  status: String,
  actor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Actor',
  },
});

const actorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const Movie = mongoose.model('Movie', movieSchema);
const Actor = mongoose.model('Actor', actorSchema);

// gql`` parses your string into an AST
const typeDefs = gql`
  scalar Date

  enum Status {
    WATCHED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Actor {
    id: ID!
    name: String!
  }

  type Movie {
    id: ID!
    title: String!
    releaseDate: Date
    rating: Int
    status: Status
    actor: Actor
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }

  input ActorInput {
    name: String
  }

  input MovieInput {
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    actor: ActorInput
  }
  type Mutation {
    addMovie(movie: MovieInput): [Movie]
  }
`;

const actors = [
  {
    id: 'gordonyu',
    name: 'Gordon Yu',
  },
  {
    id: 'gordonliu',
    name: 'Gordon Liu',
  },
];

const resolvers = {
  Query: {
    movies: async () => {
      const allMovies = await Movie.find();
      return allMovies;
    },
    movie: async (obj, { id }, context) => {
      const foundMovie = await Movie.findById(id);
      return foundMovie;
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'It is just a date',
    parseValue(value) {
      return new Date(value);
    },
  }),
  Movie: {
    actor: async (obj, { args }, context) => {
      const foundActor = await Actor.findById(obj.actor);
      return foundActor;
    },
  },
  Mutation: {
    addMovie: async (obj, { movie }, { userId }) => {
      if (userId) {
        const newActor = await Actor.create({ name: movie.actor.name });
        const newMovie = await Movie.create({
          ...movie,
          actor: newActor._id,
        });

        return [newMovie];
      }
      const Movies = await Movie.find();
      return Movies;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => {
    const fakeUser = {
      userId: 'hello',
    };
    return {
      ...fakeUser,
    };
  },
});

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('database connected');
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server started at ${url}`);
});
