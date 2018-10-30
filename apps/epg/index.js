import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';

const apolloClient = new ApolloClient({
    // link: new HttpLink({ uri: 'http://sales420.nangu.tv:3000/graphql' }),
    link: new HttpLink({ uri: 'http://graphql01.gtm-stage.orange.sk:3000/graphql' }),
    cache: new InMemoryCache(),
});

export default class extends Component {

    render = () => {
        return (
            <ApolloProvider client={apolloClient}>
            </ApolloProvider>
        );
    }
}
