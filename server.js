const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');

const postsData = [
  { id: 1, message: 'Hello, GraphQL!', date: '2022-01-31' },
  { id: 2, message: 'Learning GraphQL is fun!', date: '2022-01-31' },
];

const channelsData = [
  { id: 1, name: 'Channel 1' },
  { id: 2, name: 'Channel 2' },
];

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: { type: GraphQLString },
    message: { type: GraphQLString },
    date: { type: GraphQLString },
  },
});

const ChannelType = new GraphQLObjectType({
  name: 'Channel',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
  },
});

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    posts: {
      type: new GraphQLList(PostType),
      args: {
        channel: { type: GraphQLString },
      },
      resolve: (parent, args) => {
        return postsData;
      },
    },
    channels: {
      type: new GraphQLList(ChannelType),
      resolve: (parent, args) => {
        return channelsData;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Adjust origin based on your React app's URL
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

const server = createServer(app);

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
  },
  {
    server,
    path: '/graphql',
  }
);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/graphql`);
});