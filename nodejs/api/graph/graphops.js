const { Auth } = require("../auth/auth");
const { GraphClient } = require('../graph/graph_client');

class GraphOps {

  /**
   * Function to read data using GraphQL queries
   * @param {*} gqlQuery GraphQL query statement
   * @param {*} gqlVariables query parameter values (optional)
   * @param {*} gqlOperationName query operation name (optional)
   * @param {*} gqlContext GraphQL context (optional)
   * @param {*} gqlExtensions GraphQL extensions (optional)
   * @returns JSON
   */
  static graphqlQuery = async (gqlQuery, gqlVariables={}, gqlOperationName={}, gqlContext={}, gqlExtensions={}) => {
    const oauth_token = await Auth.getServiceToken();
    gqlContext['headers'] = { Authorization: `Bearer ${oauth_token}` };
    const operation = {
      query: gqlQuery,
      variables: gqlVariables,
      operationName: gqlOperationName,
      context: gqlContext,
      extensions: gqlExtensions
    };
    const graphClient = await GraphClient.getGraphClient();
    return await graphClient.query(operation);
  };

  /**
   * Function to insert, update or delete data using GraphQL queries
   * @param {*} gqlQuery GraphQL query statement
   * @param {*} gqlVariables query parameter values (optional)
   * @param {*} gqlOperationName query operation name (optional)
   * @param {*} gqlContext GraphQL context (optional)
   * @param {*} gqlExtensions GraphQL extensions (optional)
   * @returns
   */
  static graphqlMutate = async (gqlQuery, gqlVariables={}, gqlOperationName={}, gqlContext={}, gqlExtensions={}) => {
    const oauth_token = await Auth.getServiceToken();
    gqlContext['headers'] = { Authorization: `Bearer ${oauth_token}` };
    const operation = {
      mutation: gqlQuery,
      variables: gqlVariables,
      operationName: gqlOperationName,
      context: gqlContext,
      extensions: gqlExtensions
    };
    const graphClient = await GraphClient.getGraphClient();
    return await graphClient.mutate(operation);
  };

}

exports.GraphOps = GraphOps;
