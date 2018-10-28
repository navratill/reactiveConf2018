//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import _ from 'lodash';

export type Coordinates = {
    x: number,
    y: number,
};
export type Dimensions = {
    width: number,
    height: number,
};
export type Bounds = Coordinates & Dimensions;
export type LayoutItem = {
    data: any,
    bounds: Bounds,
    highlighted: boolean,
    key: string,
    template: boolean,
};
export type Margin = {
    bottom: number,
    left: number,
    right: number,
    top: number,
};
export type Viewport = {
    bounds: Bounds,
    margin: Margin,
    offset: Coordinates,
};
/**
 * Check if two bounds intersect.
 * @param  {Bounds} boundsA
 * @param  {Bounds} boundsB
 * @returns boolean
 */
export const hasBoundsIntersect = (boundsA: Bounds, boundsB: Bounds): boolean => {
    return boundsA.x < boundsB.x + boundsB.width && boundsA.x + boundsA.width > boundsB.x &&
        boundsA.y < boundsB.y + boundsB.height && boundsA.y + boundsA.height > boundsB.y;
};
/**
 * Every custom layout is based on Layout class. It provides viewport's settings, getters which creates output data
 * and define whole layout's life cycle. Also Layout class manages viewport's shifts, which can be used for example
 * in InfinityScrollView. Layout after re-calculates items bounds output.
 * @class
 */
export default class Layout {
    /**
     * Callback where generated snapshot is sent.
     * @property
     * @param  {?LayoutItem[]} snapshot
     */
    onSnapshot: (snapshot: ?LayoutItem[]) => void;
    /**
     * Callback for requesting key for specific data.
     * @property
     * @param  {any} data
     * @returns string
     */
    requestKey: (data: any) => string;
    /**
     * Highlighted item, will
     * @property @private
     * @type {?LayoutItem}
     */
    _highlightedItem: ?LayoutItem;
    /**
     * @property @private
     * @type {?LayoutItem[]}
     */
    _renderedItems: ?LayoutItem[];
    /**
     * @property @private
     * @type {Viewport}
     */
    _viewport: Viewport;
    /**
     * Request all items which belongs to viewport bounds and create immutalble copy of them.
     * @returns ?LayoutItem[]
     */
    get items(): ?LayoutItem[] {
        const items = this.requestItemsAt(this.viewportBoundsWithMarginAndOffset);

        return items && items.map(this.layoutItem);
    }
    /**
     * @returns Bounds
     */
    get viewportBounds(): Bounds {
        return { ...this._viewport.bounds };
    }
    /**
     * Dynamically recalculates viewport bounds. In this bounds snapshot is generated. In general this method extends viewport and create snapshot bigger than viewport itself for better performance during scrolling.
     * @returns Bounds
     */
    get viewportBoundsWithMargin(): Bounds {
        return {
            x: this._viewport.bounds.x - this._viewport.margin.left,
            y: this._viewport.bounds.y - this._viewport.margin.top,
            width: this._viewport.bounds.width + this._viewport.margin.left + this._viewport.margin.right,
            height: this._viewport.bounds.height + this._viewport.margin.bottom + this._viewport.margin.top,
        };
    }
    /**
     * Dynamically recalculates viewport bounds. Adding offsets to snapshot bounds.
     * @returns Bounds
     */
    get viewportBoundsWithMarginAndOffset(): Bounds {
        const viewportBoundsWithMargin = this.viewportBoundsWithMargin;
        return {
            ...viewportBoundsWithMargin,
            x: viewportBoundsWithMargin.x + this._viewport.offset.x,
            y: viewportBoundsWithMargin.y + this._viewport.offset.y,
        };
    }
    /**
     * Dynamically recalculates viewport bounds to real measurements (includes offset).
     * @returns Bounds
     */
    get viewportBoundsWithOffset(): Bounds {
        return {
            ...this._viewport.bounds,
            x: this._viewport.bounds.x + this._viewport.offset.x,
            y: this._viewport.bounds.y + this._viewport.offset.y,
        };
    }
    /**
     * @returns Coordinates
     */
    get viewportOffset(): Coordinates {
        return { ...this._viewport.offset };
    }
    /**
     * Constructor defines empty viewport
     */
    constructor() {
        this._viewport = { offset: { x: 0, y: 0 } };
    }
    /**
     * Returns the layouted item of the first LayoutItem in the cache that satisfies the provided testing function.
     * Otherwise null is returned.
     * @param  {(data:any,key:string)=>boolean} callback
     * @returns LayoutItem
     */
    findItem(callback: (data: any, key: string) => boolean): ?LayoutItem {
        return null;
    }
    /**
     * Mark item as highlighted. It will not request any data, just will regenerate snapshot with highlighted item.
     * @param  {?LayoutItem} item
     * @returns void
     */
    highlight(item: ?LayoutItem): void {
        this._highlightedItem = item;

        this.update();
    }
    /**
     * Restart of Layout Life-Cycle from the beggining. It will dropp all cached data and request them again.
     * @returns void
     */
    invalidate(): void {
        // drop cached snapshot data
        this._renderedItems = null;

        this.update();
    }
    /**
     * Add layout's offset to item and make item immutable.
     * @param  {LayoutItem} item
     * @returns LayoutItem
     */
    layoutItem = (item: LayoutItem): LayoutItem => {
        const data = { ...item.data };
        const key = item.key ? item.key : this.requestKey && this.requestKey(data);

        return Object.freeze({
            bounds: {
                ...item.bounds,
                x: item.bounds.x - this._viewport.offset.x,
                y: item.bounds.y - this._viewport.offset.y,
            },
            data,
            highlighted: this._highlightedItem && this._highlightedItem.key === key,
            key,
        });
    }
    /**
     * Method will request LayoutItems for snapshot again. It doesn't mean that some data will be requested outside of Layout.
     * @param  {Bounds} bounds
     * @returns LayoutItem
     */
    requestItemsAt(bounds: Bounds): ?LayoutItem[] {
        return null;
    }
    /**
     * Resend snapshot to onSnapshot callback. Snapshot will not be regenerated if shouldUpdate method will return true.
     * @returns void
     */
    update(): void {
        const items = this.items;

        // are items same as renderItems? If yes, skip update
        if (items && _.differenceWith(items, this._renderedItems, _.isEqual).length) {
            this._renderedItems = items;

            this.onSnapshot && this.onSnapshot(this._renderedItems);
        }
    }
    /**
     * Updates layout's viewport and triggers update method if this._viewport has enough information (especially bounds).
     * @param  {?Bounds=null} bounds
     * @param  {?Coordinates=null} offset
     * @param  {?Margin=null} margin
     * @returns void
     */
    updateViewport(bounds: ?Bounds = null, offset: ?Coordinates = null, margin: ?Margin = null): void {
        if (offset) this._viewport.offset = offset;
        if (margin) this._viewport.margin = margin;
        if (bounds) {
            this._viewport.bounds = bounds;

            if (!this._viewport.margin) {
                this._viewport.margin = { bottom: bounds.height, left: bounds.width, right: bounds.width, top: bounds.height };
            }
            // if bounds and margin is set, we can try to update layout
            this.update();
        }
    }
}
