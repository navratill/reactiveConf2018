import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from 'react-apollo';
import { FlatList, Text, TouchableHighlight, View } from 'react-native';

import { InfinityList, ListTypeHorizontal, ListRequest } from '../../libs/infinityview';

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
    _list: InfinityList;
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
                        <View style={{ width: '100%', height: '20%', top: '40%' }}>
                            <InfinityList
                                listType={ListTypeHorizontal}
                                pivot={{ x: 0.5, y: 0 }}
                                ref={(list) => this._list = list}
                                requestPadding={() => 20 }
                                requestKey={(item) => item.id }
                                requestData={(request: ListRequest) => {
                                    request.update(data.channels.edges[0].node.programs);
                                }}
                                requestDataAfter={(request: ListRequest) => {
                                    console.log('data after?');
                                    fetchMore({
                                        variables: { channel, from: this._to, to: this._to+12*60*60*1000 },
                                        updateQuery: (prev, { fetchMoreResult }) => {
                                            request.update(fetchMoreResult.channels.edges[0].node.programs);
                                        }
                                    })
                                }}
                                requestDataBefore={(request: ListRequest) => {
                                    console.log('data before?');
                                    fetchMore({
                                        variables: { channel, from: this._from-12*60*60*1000, to: this._from },
                                        updateQuery: (prev, { fetchMoreResult }) => {
                                            request.update(fetchMoreResult.channels.edges[0].node.programs);
                                        }
                                    })
                                }}
                                requestSize={({ startTimestamp, endTimestamp }) => 500 } //((endTimestamp-startTimestamp)/60/1000)*10 }
                                renderItem={this._renderChannel}
                                style={{ height: '100%', backgroundColor: 'green' }}
                            />
                        </View>
                    );
                }}
            </Query>
        );
    }

    _renderChannel = (item) => {
        return (
            <TouchableHighlight
                onPress={() => console.log('onClick:', item.originalName)}
                onPressIn={() => {
                    this._list.highlight(item);
                    this._list.scrollTo(item, { animated: true });
                }}
                style={{ height: '100%', width: 400, padding: 2 }}
            >
                <View 
                    style={{height: '100%', justifyContent: 'center', alignContent: 'center', padding: 20,  backgroundColor: '#3d3d3d', borderRadius: 6}}
                >
                    <Text 
                        numberOfLines={1} 
                        style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}
                    >
                        {item.data.originalName}
                    </Text>
                    <Text 
                        style={{ color: 'white', fontSize: 15 }}
                    >
                        {timestampToString(item.data.startTimestamp)}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    // _renderChannel = (item) => {
    //     return (
    //         <TouchableHighlight
    //             hasTVPreferredFocus={false}
    //             onPressIn={() => {
    //                 this._list.highlight(item);
    //                 this._list.scrollTo(item, { animated: true });
    //             }}
    //             onPress={() => console.log('onClick:', item.data.originalName)}
    //             underlayColor={item.highlighted ? 'blue' : 'yellow'}
    //         >
    //             <View style={{ justifyContent: 'center', alignContent: 'center', backgroundColor: item.highlighted ? 'blue' : 'red'}}>
    //                 <Text numberOfLines={1}>{item.data.originalName}</Text>
    //                 <Text>{timestampToString(item.data.startTimestamp)}</Text>
    //             </View>
    //         </TouchableHighlight>
    //     );
    // }

}