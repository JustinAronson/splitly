"use client"
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: "http://localhost:8000/graphql/",
    fetchOptions: {
        mode: 'no-cors',
        },
    cache: new InMemoryCache(),
});

export default client;