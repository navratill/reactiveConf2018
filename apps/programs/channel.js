// @flow

import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import { InfinityList, ListRequest, ListTypeHorizontal } from '../../libs/infinityview';

const getTimestamp = (shiftHour: number, originalTimestamp: ?number): number => {
    const timestamp = originalTimestamp ? originalTimestamp : new Date().getTime();
    return timestamp+(shiftHour*60*60*1000);
}

const timestampToString = (timestamp: number): string => {
    const date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();

    return `${date.getDate()}/${date.getMonth()} ${hours < 10 ? '0'+hours : hours}:${minutes < 10 ? '0'+minutes : minutes}`;
}

const unwrapData = (programData: any, removeFromBeginning: number = 0) => {
    if(!programData.channels.edges[0].node.programs) return [];

    return programData.channels.edges[0].node.programs.splice(removeFromBeginning);
}

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
};

export default class extends Component<Props> {

    _from: number;
    _to: number;

    constructor(props) {
        super(props);

        this._from = getTimestamp(-4);
        this._to = getTimestamp(4);
    }

    render() {
        const { channel } = this.props;

        return (
            <View style={styles.container}>
                <Query query={PROGRAMS} variables={{ channel, from: this._from, to: this._to }}>
                    {({ data, error, loading, fetchMore, variables }) => {
                        if(loading) return null;

                        return (
                            <View style={{ width: '100%', height: '20%', top: '40%' }}>
                                <FlatList
                                    data={unwrapData(data)}
                                    horizontal
                                    keyExtractor={({ id }) => id }
                                    renderItem={this._renderChannel}
                                    onEndReached={() => {
                                        this._from = this._to;
                                        this._to = getTimestamp(4, this._to);
                                    
                                        fetchMore({
                                            variables: { channel, from: this._from, to: this._to },
                                            updateQuery: (prev, { fetchMoreResult }) => {
                                                if (!fetchMoreResult) return prev;

                                                fetchMoreResult.channels.edges[0].node.programs = [
                                                    ...unwrapData(prev),
                                                    ...unwrapData(fetchMoreResult, 1),
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
            </View>
        );
    }

    _renderChannel = ({ item, index }) => {
        return (
            <TouchableHighlight
                onPress={() => console.log('onClick:', item.originalName)}
                style={styles.programContainer}
                underlayColor='#1a1a1a'
            >
                <View style={styles.program} >
                    <Text numberOfLines={1} style={styles.programName}>{item.originalName}</Text>
                    <Text style={styles.programTime}>{timestampToString(item.startTimestamp)}</Text>
                </View>
            </TouchableHighlight>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#292929', 
        flex: 1,
    },
    programContainer: {
        borderRadius: 6,
        height: '100%', 
        padding: 5,
        width: 400, 
    },
    program: {
        alignContent: 'center', 
        backgroundColor: '#3d3d3d', 
        borderRadius: 6,
        height: '100%', 
        justifyContent: 'center', 
        padding: 20,  
    },
    programName: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
    },
    programTime: {
        color: 'white',
        fontSize: 15,
    }
});