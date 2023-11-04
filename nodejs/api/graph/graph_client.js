const { ApolloClient, InMemoryCache, split, HttpLink, gql } = require('@apollo/client');
const { getMainDefinition } = require('@apollo/client/utilities');
const { GraphQLWsLink } = require('@apollo/client/link/subscriptions');
const fetch = require("cross-fetch");
const { createClient } = require('graphql-ws');
const ws = require('ws');
const { Auth } = require('../auth/auth');
const { Config } = require('../configs/config');

class GraphClient {

  static getGraphClient = async () => {

    /**
     * obtaining oauth token to call database apis
     */
    const oauth_token = await Auth.getServiceToken();
  
    /**
     * HTTP link
     */
    const httpLink = new HttpLink({
      uri: Config['DB_SERVICE_URI']+'/graphql',
      connectionParams: {
        authToken: oauth_token,
      },
      fetch: fetch
    });
  
    /**
     * Web socket link
     */
    const wsLink = new GraphQLWsLink(createClient({
      url: 'ws://'+Config['DB_SERVICE_URI'].replace('http://','').replace('https://','')+'/subscriptions',
      connectionParams: {
        authToken: oauth_token,
      },
      webSocketImpl: ws,
      fetch: fetch
    }));
  
    /**
     * The split function takes three parameters:
     * A function that's called for each operation to execute
     * The Link to use for an operation if the function returns a "truthy" value
     * The Link to use for an operation if the function returns a "falsy" value
     */
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    );
  
    /**
     * Apollo GraphQL client
     */
    return new ApolloClient({
      fetch: fetch,
      ssrMode: true,
      // uri: GRAPH_SERVER,
      link: splitLink,
      cache: new InMemoryCache(),
    });
  
  };

}

exports.GraphClient = GraphClient;
