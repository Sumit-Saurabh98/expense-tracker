import http from "http";
import express from "express"
import cors from "cors"
import dotenv from "dotenv";
dotenv.config();
import { ApolloServer } from "@apollo/server";
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})]  
})


// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
	"/graphql",
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	}),
	express.json(),
	// expressMiddleware accepts the same arguments:
	// an Apollo Server instance and optional configuration options
	expressMiddleware(server, {
		context: async ({ req, res }) => ({ req, res }),
	})
);

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: process.env.PORT || 4444 }, resolve));

console.log(`🚀 Server ready at http://localhost:4444/graphql`);