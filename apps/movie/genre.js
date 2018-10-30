// @flow

import gql from 'graphql-tag';
import React, { Component } from 'react';
import { Query } from "react-apollo";
import { FlatList, Image, StyleSheet, TouchableHighlight, TouchableOpacity, View } from 'react-native';

const MOVIES = gql`
query Movies($tagID: ID!) {
    taggedEntities(id: $tagID, type: MOVIE, first: 10) {
        edges {
            node {
                id
                name
                media {
                    portrait(width: 350, height: 622)
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
            <View style={styles.container}>
                <Query query={MOVIES} variables={{ tagID: tag }}>
                    {({ data, error, loading }) => {
                        if(loading) return null;
                        if(error) return null;

                        return (
                            <View style={{ width: '100%', height: '50%', top: '25%' }}>
                                <FlatList
                                    data={data.taggedEntities.edges}
                                    horizontal
                                    keyExtractor={(item, index) => `${item.id}-${index}` }
                                    renderItem={this._renderMovie}
                                />
                            </View>
                        );
                    }}
                </Query>
            </View>
        );
    }

    _renderMovie = ({ item: { node: { name, media } } }) => {
        if(!media.portrait) return null;

        return (
            <TouchableHighlight
                style={styles.movie}
                onPress={() => console.log('onMovieSelect:', name)}
            >
                <Image 
                    style={{ width: '100%', height: '100%' }}
                    source={{ uri: media.portrait }}
                />
            </TouchableHighlight>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#292929',
        flex: 1,
    },
    movie: {
        height: 622, // 9:16
        padding: 5,
        width: 350,
    }
});