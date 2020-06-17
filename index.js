const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

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
    actor: [Actor]
    status: Status
  }

  type Query {
    movies: [Movie]
    movie(id: ID): Movie
  }
`;

const movies = [
  {
    id: 'sdfasdgioasasik',
    title: '5 Deadly Venoms',
    releaseDate: new Date('10-12-1983'),
    rating: 5,
  },
  {
    id: 'sgdasigsakgadios',
    title: '36th Chamber',
    releaseDate: new Date('10-10-1983'),
    rating: 5,
    actor: [
      {
        id: 'asdgdasgdas',
        name: 'Gordon Liu',
      },
    ],
  },
];

const resolvers = {
  Query: {
    movies: () => movies,
    movie: (obj, { id }, context) => {
      const foundMovie = movies.find(movie => movie.id === id);
      return foundMovie;
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'It is just a date',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server started at ${url}`);
});
