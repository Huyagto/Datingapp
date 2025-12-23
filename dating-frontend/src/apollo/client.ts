import { ApolloClient, InMemoryCache, split } from "@apollo/client";
import { HttpLink } from "@apollo/client/link/http";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HTTP_URL = "https://panicled-chia-mustached.ngrok-free.dev/graphql";
const WS_URL   = "wss://panicled-chia-mustached.ngrok-free.dev/graphql";

const httpLink = new HttpLink({ uri: HTTP_URL });

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: WS_URL,
    keepAlive: 10000,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await AsyncStorage.getItem("token");
      return {
        authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" &&
      def.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
