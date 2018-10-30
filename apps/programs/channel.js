import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { FlatList, Text, TouchableHighlight, View } from 'react-native';

const timestampToString = (timestamp: number): string => {
    const date = new Date(timestamp);
    var h = date.getHours();
    var m = date.getMinutes();

    h = ( h < 10 ) ? '0' + h : h;
    m = ( m < 10 ) ? '0' + m : m;

    return `${date.getDate()}/${date.getMonth()} ${h}:${m}`;
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
    from: number,
    to: number,
};

export default class extends Component<Props> {

    _from: number;
    _to: number;

    constructor(props) {
        super(props);

        this._from = props.from;
        this._to = props.to;
    }

    render() {
        const { channel } = this.props;

        return (
            <Query query={PROGRAMS} variables={{ channel, from: this._from, to: this._to }}>
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
                                    this._from = this._to;
                                    this._to = this._to+12*60*60*1000;
                                
                                    fetchMore({
                                        variables: { channel, from: this._from, to: this._to },
                                        updateQuery: (prev, { fetchMoreResult }) => {
                                            if (!fetchMoreResult || !fetchMoreResult.channels.edges[0].node.programs) return prev;

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
        return (
            <TouchableHighlight
                hasTVPreferredFocus={index === 0}
                onPress={() => console.log('onClick:', item.originalName)}
                style={{ height: 150, padding: 20 }}
                underlayColor='red'
            >
                <View style={{ justifyContent: 'center', alignContent: 'center'}}>
                    <Text>{item.originalName}</Text>
                    <Text>{timestampToString(item.startTimestamp)}</Text>
                </View>
            </TouchableHighlight>
        );
    }

}