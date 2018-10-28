import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { FlatList, Text, TouchableHighlight, View } from 'react-native';

const MOVIES = gql`
query Movies($tagID: [ID]) {
    taggedEntities(id: $tagID) {
        edges {
            node {
                id
                name
                media {
                    portrait
                }
            }
        }
    }
}`;

const PROGRAMS = gql`
query Programs($channel: [ID], $from: Float, $to: Float) {
    channels(id: $channel, fromTimestamp: $from, toTimestamp: $to) {
        edges {
            node {
                id
                channelName
                programs {
                    id
                    originalName
                    startTimestamp
                    endTimestamp
                }
            }
        }
    }
}`;

type Props = {
    channel: string,
    from: number,
    to: number,
};

export default class extends Component<Props> {

    render() {
        console.log('Channel.render!!!');
        const { channel, from, to } = this.props;

        return (
            <Query query={PROGRAMS} variables={{ channel, from, to }}>
                {({ data, error, loading, fetchMore, variables }) => {
                    if(loading) return null;

                    return (
                        <View style={{ width: '100%', height: '50%', top: '25%' }}>
                            <FlatList
                                data={data.channels.edges[0].node.programs}
                                horizontal
                                keyExtractor={({ id }) => id }
                                renderItem={this._renderChannel}
                                onEndReached={() => {
                                    fetchMore({
                                        variables: {
                                            from: variables.to,
                                            to: variables.to+12*60*60*1000,
                                        },
                                        updateQuery: (prev, { fetchMoreResult }) => {
                                            if (!fetchMoreResult) return prev;

                                            fetchMoreResult.channels.edges[0].node.programs = [
                                                ...prev.channels.edges[0].node.programs,
                                                ...fetchMoreResult.channels.edges[0].node.programs,
                                            ];
                                            
                                            return fetchMoreResult;
                                        }
                                    })
                                }}
                                onEndReachedThreshold={0.1}
                            />
                        </View>
                    );
                }}
            </Query>
        );
    }

    _renderChannel = ({ item, index }) => {
        console.log('index: ', index, item);

        return (
            <TouchableHighlight
                hasTVPreferredFocus={index === 0}
                onPress={() => console.log('onClick:', item.originalName)}
                style={{ height: 150, padding: 20 }}
                underlayColor='red'
            >
                <View style={{ justifyContent: 'center', alignContent: 'center'}}>
                    <Text>{item.originalName}</Text>
                </View>
            </TouchableHighlight>
        );
    }

}