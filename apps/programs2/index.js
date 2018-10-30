import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';

import Channel from './channel';

const apolloClient = new ApolloClient({
    // link: new HttpLink({ uri: 'http://sales420.nangu.tv:3000/graphql' }),
    link: new HttpLink({ uri: 'http://graphql01.gtm-stage.orange.sk:3000/graphql' }),
    cache: new InMemoryCache(),
});

const getTimestamp = (shiftHour: number): number => {
    return new Date().getTime()+(shiftHour*60*60*1000);
}

export default class extends Component {

    render = () => {
        return (
            <ApolloProvider client={apolloClient}>
                <Channel 
                    channel="Q2hhbm5lbDprYW5hbDFfbWFya2l6YV9hYnI="
                    from={getTimestamp(-12)}
                    to={getTimestamp(12)}    
                />
            </ApolloProvider>
        );
    }
}
