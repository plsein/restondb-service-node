/**
 * Imports
 */
const serverless = require('serverless-http');
const express = require('express');
const { expressjwt } = require("express-jwt");  // https://github.com/MichielDeMey/express-jwt-permissions
const { ApolloServer } = require('@apollo/server');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { expressMiddleware } = require('@apollo/server/express4');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { Config } = require('./configs/config');
const { Routes } = require('./routes/routes');
const { Auth } = require('./auth/auth');
const { appLog, reqLogger } = require('./configs/logger');
const { errorHandler, initMiddleware } = require('./middlewares/middleware');

(async() => {

  /**
   * Get token to access db service
   */
  let oauthToken = await Auth.getServiceToken();

  /**
   * Configure gateway
   */
  const graphGateway = new ApolloGateway({
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest: async ({ request, context }) => {
          let token = await Auth.getServiceToken();
          request.http.headers.set("Authorization", `Bearer ${token}`);
        }
      });
    },
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [{ name: 'graphql', url: Config['DB_SERVICE_URI']+'/graphql' }],
      introspectionHeaders: { Authorization: `Bearer ${oauthToken}`}
    }),
  });
  const graphServer = new ApolloServer({ gateway: graphGateway });
  
  /**
   * Start GraphQL Server
   */
  await graphServer.start();

  /**
   * Configure the application
   */
  let app = express();
  app.use(reqLogger);
  app.use(cors({
    origin: "*",
    credentials: true,
    exposedHeaders: "*",
    allowedHeaders: "*",
    methods: "*", // "OPTIONS,GET,HEAD,PUT,PATCH,POST,DELETE",
  }));
  /**
   * Proxy to db service
  */
  app.use(
    '/',
    createProxyMiddleware(Config['PROXY_ON_PATH']+'/**', {
      target: Config['PROXY_TO_URI'],
      changeOrigin: true,
      pathRewrite: {
        '^' + Config['PROXY_ON_PATH'] + '/' : '/',  // Removing proxy path from request
      },
    }),
  );
  app.use([initMiddleware, express.json({ extended: true })]);  // initMiddleware
  // app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(
    expressjwt({secret: Config['JWT_AUTH_SECRET'], algorithms: ["HS256"]})
      .unless({ method: "OPTIONS", path: [
        // { url: "/token", methods: ["GET", "POST"] },
        "/token",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/user-register",
        "/token-validation",
        "/graphiql",
        "/graphql/stream",
        Config['PROXY_ON_PATH'] + '/*'  // Comment this line if you want to enable jwt on proxy path
      ]})
  );
  app.use('/graphql', expressMiddleware(graphServer, {
    context: async ({ req }) => ({ key: '' })
  }));
  app.use(errorHandler);
  Routes.setRoutes(app);
  
  /**
   * App Initialization
   */
  module.exports.handler = serverless(app);
  appLog.info("Server starting on port: " + (Config['APP_PORT'] || 8000));
  app.listen(Config['APP_PORT'] || 8000);

})();
