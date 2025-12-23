import { NavigationContainer } from "@react-navigation/native";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./src/apollo/client";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {

  return (
    <SafeAreaProvider>
    <ApolloProvider client={client}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ApolloProvider>
    </SafeAreaProvider>
  );
}
