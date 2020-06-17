const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
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
    releaseDate: String
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
    releaseDate: '10-10-1983',
    rating: 5,
  },
  {
    id: 'sgdasigsakgadios',
    title: '36th Chamber',
    releaseDate: '10-10-1983',
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
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server started at ${url}`);
});
