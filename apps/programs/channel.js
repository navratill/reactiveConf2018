// @flow

import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native';

import { InfinityList, ListRequest, ListTypeHorizontal, type LayoutItem } from '../../libs/infinityview';

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

    return programData.channels.edges[0].node.programs.slice(removeFromBeginning, -1);
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
    _list: InfinityList;
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
                            <InfinityList 
                                listType={ListTypeHorizontal}
                                ref={(list) => this._list = list}
                                renderItem={this._renderChannel}
                                requestData={(request: ListRequest) => request.completeWithData(unwrapData(data)) }
                                requestDataAfter={(request: ListRequest) => {
                                    request.update([{loading: true}, {loading: true}, {loading: true}]);

                                    fetchMore({
                                        variables: { channel, from: request.item.data.endTimestamp, to: getTimestamp(4, request.item.data.endTimestamp) },
                                        updateQuery: (previousResult, { fetchMoreResult }) => {
                                            setInterval(() => request.completeWithData(unwrapData(fetchMoreResult, 1)), 2000);
                                        }
                                    });
                                }}
                                requestDataBefore={(request: ListRequest) => fetchMore({
                                    variables: { channel, from: getTimestamp(-4, request.item.data.startTimestamp), to: request.item.data.startTimestamp },
                                    updateQuery: (previousResult, { fetchMoreResult }) => {
                                        request.completeWithData(unwrapData(fetchMoreResult, 1));
                                    }
                                })}
                                requestKey={(data) => data.id}
                                requestSize={() => 400 }
                                requestPadding={() => 5 }
                                style={styles.channel}
                            />
                        );
                    }}
                </Query>
            </View>
        );
    }

    _renderChannel = (item: LayoutItem) => {
        return (
            <TouchableHighlight
                onPress={() => console.log('onProgramSelect:', item.data.originalName)}
                onPressIn={() => this._list.scrollTo(item, { animated: true })}
                style={styles.programContainer}
                underlayColor='#1a1a1a'
            >
                {
                    item.data.loading ? 
                        <View style={styles.program} />
                    : (
                        <View style={styles.program} >
                            <Text numberOfLines={1} style={styles.programName}>{item.data.originalName}</Text>
                            <Text style={styles.programTime}>{timestampToString(item.data.startTimestamp)}</Text>
                        </View>
                    )
                }
            </TouchableHighlight>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#292929', 
        flex: 1,
    },
    channel: {
        height: '20%', 
        top: '40%',
        width: '100%', 
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