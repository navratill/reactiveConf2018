//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import * as React from 'react';

import Layout, { type Bounds, type LayoutItem } from '../infinityview/layouts/Layout';
import InfinityScrollView, { type ScrollToOptions } from '../infinityview/InfinityScrollView';
import ListLayout, { type ListItem, ListRequest, ListTypeHorizontal, ListTypeVertical } from './layouts/ListLayout';

type TProps = {
    listType: ListType,
    renderItem: Function;
    requestData: Function,
    requestDataAfter?: Function,
    requestDataBefore?: Function,
    requestKey: (data: any) => string,
    requestPadding: (data: any) => number,
    requestSize: (data: any) => number,
}

export type {
    LayoutItem,
    ListItem,
};
export {
    ListRequest,
    ListTypeHorizontal, 
    ListTypeVertical,
};

export default class InfinityList extends React.PureComponent<TProps> {

    _layout: ListLayout;
    _scrollView: ?React.ElementRef<typeof InfinityScrollView>;

    static defaultProps = {
        listType: ListTypeVertical,
    }

    constructor(props: TProps) {
        super(props);

        this._layout = new ListLayout(props.listType);
        this._layout.requestData = this.props.requestData;
        this._layout.requestDataAfter = this.props.requestDataAfter;
        this._layout.requestDataBefore = this.props.requestDataBefore;
        this._layout.requestKey = this.props.requestKey;
        this._layout.requestPadding = this.props.requestPadding;
        this._layout.requestSize = this.props.requestSize;
    }

    scrollTo = (item: LayoutItem, options: ScrollToOptions): void => {
        // TODO: remove one axe from bounds
        this._scrollView && this._scrollView.scrollTo(item, options);
    }

    findItem = (callback: (data: any, key: string) => boolean): ?LayoutItem => {
        return this._layout.findItem(callback);
    }

    highlight = (item: ?ListItem): void => {
        this._layout.highlight(item);
    }

    invalidate = (): void => {
        this._layout.invalidate();
    }

    _onScrollView = (scrollView: ?React.ElementRef<typeof InfinityScrollView>) => {
        this._scrollView = scrollView;
    }

    render() {
        return (
            <InfinityScrollView
                {...this.props}
                layout={this._layout}
                ref={this._onScrollView}
            />
        );
    }

};