//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import _ from 'lodash';
import * as React from 'react';
import {
    Animated,
    LayoutAnimation,
    View,
} from 'react-native';

import Layout, {
    type Coordinates,
    type Dimensions,
    type LayoutItem,
    type Bounds,
} from './layouts/Layout';
import InfinityView from './InfinityView';
import {
    ListTypeHorizontal,
    ListTypeVertical,
} from './InfinityList';

export type ScrollToOptions = {
    animated?: boolean,
    item?: {
        pivot: Coordinates,
    },
}

type TProps = {
    dimensions: Dimensions,
    layout: Layout,
    listType: string,
    onLayout?: Function,
    onScrollEnd?: Function,
    pivot: Coordinates,
    renderItem: (item: LayoutItem) => React.Node,
    style: Object,
}

type TState = {
    top: number,
    left: number,
    position: Animated.ValueXY,
    snapshot: Array<any>,
}

export default class InfinityScrollView extends React.Component<TProps, TState> {

    static defaultProps = {
        dimensions: {
            height: 20000,
            width: 20000,
        },
        listType: ListTypeVertical,
    }

    _layoutHorizontal: boolean
    _layout: Layout;
    /**
     * @constructor
     * @param  {TProps} props
     */
    constructor(props: TProps) {
        super(props);

        this._layout = props.layout;
        this._layout.onSnapshot = this.onSnapshot;
        this._layoutHorizontal = props.listType === ListTypeHorizontal;

        const animation = new Animated.ValueXY({ x: 0, y: 0 });
        animation.addListener(this._onAnimation);

        this.state = {
            top: 0,
            left: 0,
            position: animation,
            snapshot: [],
        };
    }

    get infinityViewContainerStyle(): Object[] {
        return [
            { overflow: 'hidden' },
            this.props.style,
        ];
    }
    /**
     * @returns Object
     */
    get infinityViewStyle(): Object {
        return {
            left: this.state.left,
            top: this.state.top,
            ...this.props.dimensions,
            overflow: 'visible',
        };
    }
    /**
     * @param  {[LayoutItem]} snapshot
     * @returns void
     */
    onSnapshot = (snapshot: Array<LayoutItem>): void => {
        this.setState({
            snapshot,
        });
    }
    /**
     * Scrolling to LayoutItem's bounds. If options contains item's pivot, it is scrolled to position, where
     * ScrollView's pivot and item's pivot are at the same position. If item's pivot is not set in options, ScrollView
     * is possitioned that whole item is visible.
     * @param  {LayoutItem} item
     * @param  {?ScrollToOptions} options
     */
    scrollTo = (item: LayoutItem, options: ?ScrollToOptions) => {
        const viewportBounds = this._layout.viewportBounds;
        const viewportOffset = this._layout.viewportOffset;
        const optionsAnimated = options && options.animated;
        const optionsItem = options && options.item;

        let { x, y } = viewportBounds;
        if (optionsItem && optionsItem.pivot) { // should move item to pivot?
            const { x: pivotX, y: pivotY } = { x: 0, y: 0, ...optionsItem.pivot };

            x -= (x + this.props.pivot.x * viewportBounds.width) - (item.bounds.x + item.bounds.width * pivotX);
            y -= (y + this.props.pivot.y * viewportBounds.height) - (item.bounds.y + item.bounds.height * pivotY);
        } else { // if item is not fully visible in viewport, move viewport
            x = _.clamp(x, x - ((x + viewportBounds.width) - (item.bounds.x + item.bounds.width)), item.bounds.x);
            y = _.clamp(y, y - ((y + viewportBounds.height) - (item.bounds.y + item.bounds.height)), item.bounds.y);
        }

        // if the viewport should be moved
        if (x !== viewportBounds.x || y !== viewportBounds.y) {
            // should reset offset of viewport?
            const offsetWidthMultiplier = this._layoutHorizontal ? 0.1 : 0;
            const offsetHeightMultiplier = this._layoutHorizontal ? 0 : 0.1;
            const offsetBoundary = {
                width: this.props.dimensions.width * offsetWidthMultiplier,
                height: this.props.dimensions.height * offsetHeightMultiplier,
            };
            const offset = this._calculateOffset(
                { x, y },
                { x: offsetBoundary.width, y: offsetBoundary.height, width: this.props.dimensions.width - offsetBoundary.width, height: this.props.dimensions.height - offsetBoundary.height },
                0.5,
            );

            // apply offet to viewport
            x += offset.x; y += offset.y;
            viewportOffset.x -= offset.x; viewportOffset.y -= offset.y;

            // TODO: this should be done during animation multiple-times
            // update layout's viewport
            this._layout.updateViewport({ ...viewportBounds, x, y }, viewportOffset);

            const top = this._layoutHorizontal ? 0 : -y;
            const left = this._layoutHorizontal ? -x : 0;
            if (optionsAnimated) {
                this._animateTo(left, top);
            } else {
                this.setState({
                    top,
                    left,
                });
            }
        }
    }
    /**
     * @private
     * @param  {number} x
     * @param  {number} y
     */
    _animateTo = (x: number, y: number) => {
        LayoutAnimation.easeInEaseOut();

        this.setState({
            top: y,
            left: x,
        });
    }
    /**
     * If coordinates are outside of the bounds, it will calculates offset by which it should be shifted.
     * Step of offset is counted as dimension * factor. By default, factor is 0.5.
     * @private
     * @param  {Coordinates} coordinates
     * @param  {Bounds} bounds
     * @param  {number=0.5} factor
     * @returns Coordinates
     */
    _calculateOffset = (coordinates: Coordinates, bounds: Bounds, factor: number = 0.5): Coordinates => {
        const [offsetX, offsetY] = [bounds.width * factor, bounds.height * factor];

        let [x, y] = [0, 0];
        if (coordinates.x < bounds.x) x = offsetX;
        if (coordinates.x > bounds.width) x = -offsetX;
        if (coordinates.y < bounds.y) y = offsetY;
        if (coordinates.y > bounds.height) y = offsetY;

        return { x, y };
    }
    /**
     * @private
     * @param  {number} {x
     * @param  {number} y}
     * @returns void
     */
    _onAnimation = ({ x, y }: Coordinates): void => {
        console.log(`animation -> x: ${x}, y: ${y}`);
    }
    /**
     * @private
     * @returns void
     */
    _onScrollEnd = (): void => {
        this.props.onScrollEnd && this.props.onScrollEnd();
    }

    render() {
        return (
            <View
                onLayout={({ nativeEvent: { layout } }) => {
                    const bounds: Bounds = {
                        ...layout,
                        x: this._layoutHorizontal ? (this.props.dimensions.width - layout.width) / 2 : 0,
                        y: this._layoutHorizontal ? 0 : (this.props.dimensions.height - layout.height) / 2,
                    };
                    // update layout's viewport
                    this._layout.updateViewport(bounds);

                    this.setState({
                        left: this._layoutHorizontal ? -bounds.x : 0,
                        top: this._layoutHorizontal ? 0 : -bounds.y,
                    });
                    this.props.onLayout && this.props.onLayout({ nativeEvent: { layout } });
                }}
                style={this.infinityViewContainerStyle}
            >
                <InfinityView
                    renderItem={this.props.renderItem}
                    snapshot={this.state.snapshot}
                    style={this.infinityViewStyle}
                />
            </View>
        );
    }
}
