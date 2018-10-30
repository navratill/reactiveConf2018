import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from "react-apollo";
import { FlatList, Image, TouchableHighlight, TouchableOpacity, View } from 'react-native';

const MOVIES = gql`
query Movies($tagID: ID!) {
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

type Props = {
    tag: String,
}

export default class extends Component<Props> {

    render() {
        const { tag } = this.props;

        return (
            <View style={{ backgroundColor: '#292929', flex: 1 }}>
            <Query query={MOVIES} variables={{ tagID: tag }}>
                {({ data, error, loading }) => {
                    if(loading) return null;
                    if(error) return null;

                    return (
                        <View style={{ width: '100%', height: '50%', top: '25%' }}>
                            <FlatList
                                data={data.taggedEntities.edges}
                                horizontal
                                keyExtractor={({ node: { id }}) => id }
                                renderItem={this._renderMovie}
                            />
                        </View>
                    );
                }}
            </Query>
            </View>
        );
    }

    _renderMovie = ({ item: { node: { name, media } }, index, separators }) => {
        return (
            <TouchableHighlight
                style={{ width: 350, height: '100%', padding: 5, }}
                onPress={() => console.log('onClick:', name)}
            >
                <Image 
                    style={{ width: '100%', height: '100%' }}
                    source={{ uri: media.portrait }}
                />
            </TouchableHighlight>
        );
    }

}
