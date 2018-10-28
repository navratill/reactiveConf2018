//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import React from 'react';
import { View } from 'react-native';

import InfinityView from './InfinityView.js';

export default class extends InfinityView<{
    ...View.propTypes
}> {

    render() {
        return (
            <View
                {...this.props}
            >
                { this.renderSnapshot() }
            </View>
        );
    }

}