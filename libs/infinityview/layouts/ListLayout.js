//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import Layout, {
    type Bounds,
    type LayoutItem,
    hasBoundsIntersect,
} from './Layout';
import ListRequest, { ListRequestOptions } from '../requests/ListRequest';

export const ListTypeHorizontal: string = 'HORIZONTAL';
export const ListTypeVertical: string = 'VERTICAL';
export type ListType = ListTypeHorizontal | ListTypeVertical;

export type ListItem = LayoutItem & {
    size: number,
    next: ListItem,
    previous: ListItem,
};

export {
    ListRequest,
};
export default class ListLayout extends Layout {
    /**
     * @property
     */
    requestData: () => void;
    /**
     * @property
     */
    requestDataAfter: ?() => void;
    /**
     * @property
     */
    requestDataBefore: ?() => void;
    /**
     * @property
     */
    requestPadding: ?() => number;
    /**
     * @property
     */
    requestSize: (data: any) => number;
    /**
     * @property @private
     */
    _item: ?ListItem;
    /**
     * @property @private
     */
    _request: ?ListRequest;
    /**
     * @property @private
     */
    _requestAfter: ?ListRequest;
    /**
     * @property @private
     */
    _requestBefore: ?ListRequest;
    /**
     * @property @private
     */
    _type: ListType;
    /**
     * @returns boolean
     */
    get isHorizontal(): boolean {
        return this._type === ListTypeHorizontal;
    }
    /**
     * @returns boolean
     */
    get isVertical(): boolean {
        return this._type === ListTypeVertical;
    }
    /**
     * @returns number
     */
    get padding(): number {
        if (this.requestPadding) {
            return this.requestPadding();
        }

        return 10;
    }
    /**
     * @returns Bounds
     */
    /* get viewportBoundsWithMargin(): Bounds {
        // TODO: Tady je potreba urezat viewportbounds podle toho jaky typ listu to je
        const viewportBoundsWithMargin = super.viewportBoundsWithMargin;

        if (this.isVertical) {
            viewportBoundsWithMargin.x = 0;
            viewportBoundsWithMargin.width = this.viewportBounds.width;
        }
        if (this.isHorizontal) {
            viewportBoundsWithMargin.y = 0;
            viewportBoundsWithMargin.height = this.viewportBounds.height;
        }

        return viewportBoundsWithMargin;
    } */
    /**
     * @private
     * @returns ListItem
     */
    get _firstItem(): ?ListItem {
        return this._find((item: ?ListItem) => {
            return item.previous === null;
        });
    }
    /**
     * @private
     * @returns ListItem
     */
    get _lastItem(): ?ListItem {
        return this._find((item: ?ListItem) => {
            return item.next === null;
        });
    }
    /**
     * @constructor
     * @param {ListType} type
     */
    constructor(type: ListType = ListTypeVertical) {
        super();

        this._type = type;
    }
    /**
     * Returns the layouted item of the first ListItems in the cache that satisfies the provided testing function.
     * Otherwise null is returned.
     * @param  {(data:any,key:string)=>boolean} callback
     * @returns LayoutItem
     */
    findItem(callback: (data: any, key: string) => boolean): ?LayoutItem {
        const listItem = this._find((item: ListItem) => {
            return callback(item.data, item.key);
        });

        return listItem && this.layoutItem(listItem);
    }
    /**
     * Drop all cached data and request everythig again.
     * @returns void
     */
    invalidate(): void {
        this._cancelAllRequests();
        this._item = null;

        super.invalidate();
    }
    /**
     * Request items which are part of bounds. If there is not enought data, request them.
     * @param  {Bounds} bounds
     * @returns LayoutItem
     */
    requestItemsAt(bounds: Bounds): ?LayoutItem[] {
        if (!this._item) return this._requestData();

        const item = this._find((listItem: ListItem) => {
            return hasBoundsIntersect(listItem.bounds, bounds);
        });

        if (!item) { // all cached data in ListLayout are not in viewport bounds
            // TODO: tady musim ceknout, na jakem konci chybi data a requestnout je nebo to muzu cely invalidovat
            return null;
        }

        this._item = item;

        return [item, ...this._getNextItems(item, bounds), ...this._getPreviousItems(item, bounds)];
    }
    /**
     * Search accross all ListItems which are cached in ListLayout and return first which callbacks response is true.
     * @private
     * @param  {(item:ListItem)=>boolean} callback
     * @returns ListItem
     */
    _find(callback: (item: ListItem) => boolean): ?ListItem {
        let nextItem: ?ListItem = this._item;
        let previousItem: ?ListItem = this._item && this._item.previous;

        while (nextItem || previousItem) {
            if (nextItem && callback(nextItem)) return nextItem;
            if (previousItem && callback(previousItem)) return previousItem;

            nextItem = nextItem && nextItem.next;
            previousItem = previousItem && previousItem.previous;
        }

        return null;
    }
    /**
     * @param  {(item:ListItem)=>void} callback
     * @returns void
     */
    _map(callback: (item: ListItem) => void): void {
        this._find((item: ListItem) => {
            callback(item);
            return false;
        });
    }
    /**
     * @param  {ListItem} item
     * @param  {Bounds} bounds
     * @returns ListItem
     */
    _getNextItems(item: ListItem, bounds: Bounds): ListItem[] {
        if (!item.next) {
            this._requestDataAfter(item);
        } else if (hasBoundsIntersect(item.next.bounds, bounds)) {
            return [item.next, ...this._getNextItems(item.next, bounds)];
        }

        return [];
    }
    /**
     * @param  {ListItem} item
     * @param  {Bounds} bounds
     * @returns ListItem
     */
    _getPreviousItems(item: ListItem, bounds: Bounds): ListItem[] {
        if (!item.previous) {
            this._requestDataBefore(item);
        } else if (hasBoundsIntersect(item.previous.bounds, bounds)) {
            return [item.previous, ...this._getPreviousItems(item.previous, bounds)];
        }

        return [];
    }
    /**
     * @returns void
     */
    _requestData = (): void => {
        if (this._request) return;

        this._request = this._createRequest((items: ListItem[], options: ?ListRequestOptions) => {
            const optionsItemIndex = options && options.itemIndex;
            const viewportBoundsWithOffset = this.viewportBoundsWithOffset;

            // TODO: doplnit upravy pres options
            // especially pivot option
            this._item = items[optionsItemIndex || 0];

            const { x, y } = this._item.bounds;
            for (const item of items) {
                item.bounds.x += viewportBoundsWithOffset.x - x;
                item.bounds.y += viewportBoundsWithOffset.y - y;
            }

            this.update();
        }, () => {
            this._request = null;
        });

        this.requestData && this.requestData(this._request);
    }
    /**
     * @param  {ListItem} afterItem
     * @returns void
     */
    _requestDataAfter = (afterItem: ListItem): void => {
        if (this._requestAfter) return;

        this._requestAfter = this._createRequest((items: ListItem[]) => {
            for (const [itemIndex, item] of items.entries()) {
                if (!itemIndex) {
                    item.previous = afterItem;
                    afterItem.next = item;
                }

                item.bounds.x = this.isVertical ? afterItem.bounds.x : item.previous.bounds.x + item.previous.bounds.width + this.padding;
                item.bounds.y = this.isHorizontal ? afterItem.bounds.y : item.previous.bounds.y + item.previous.bounds.height + this.padding;
            }

            // if some data were returned, update snapshot
            items.length && this.update();
        }, () => {
            this._requestAfter = null;
        });
        this._requestAfter.item = afterItem;

        this.requestDataAfter && this.requestDataAfter(this._requestAfter);
    }
    /**
     * @param  {ListItem} beforeItem
     * @returns void
     */
    _requestDataBefore = (beforeItem: ListItem): void => {
        if (this._requestBefore) return;

        this._requestBefore = this._createRequest((items: ListItem[]) => {
            for (const [itemIndex, item] of items.reverse().entries()) {
                if (!itemIndex) {
                    item.next = beforeItem;
                    beforeItem.previous = item;
                }

                item.bounds.x = this.isVertical ? beforeItem.bounds.x : item.next.bounds.x - item.bounds.width - this.padding;
                item.bounds.y = this.isHorizontal ? beforeItem.bounds.y : item.next.bounds.y - item.bounds.height - this.padding;
            }

            // if some data were returned, update snapshot
            items.length && this.update();
        }, () => {
            this._requestBefore = null;
        });
        this._requestBefore.item = beforeItem;

        this.requestDataBefore && this.requestDataBefore(this._requestBefore);
    }
    /**
     * @param  {(items:[ListItem],options:?ListRequestOptions)=>void} onUpdate
     * @param  {()=>void} onComplete
     * @returns ListRequest
     */
    _createRequest = (onUpdate: (items: [ListItem], options: ?ListRequestOptions) => void, onComplete: () => void): ListRequest => {
        const listRequest = new ListRequest();
        listRequest.subscribe({
            next: ({ data, options }: { data: any[], options: ?ListRequestOptions}) => {
                const items: ListItem[] = [];

                for (const [itemIndex, itemData] of data.entries()) {
                    const lastItem: ?ListItem = itemIndex && items[itemIndex - 1];
                    const itemSize = this.requestSize ? this.requestSize(itemData) : 0;

                    const item: ListItem = {
                        bounds: {
                            x: lastItem && this.isHorizontal ? lastItem.bounds.x + lastItem.bounds.width + this.padding : 0,
                            y: lastItem && this.isVertical ? lastItem.bounds.y + lastItem.bounds.height + this.padding : 0,
                            width: this.isHorizontal ? itemSize : this.viewportBounds.width,
                            height: this.isVertical ? itemSize : this.viewportBounds.height,
                        },
                        data: itemData,
                        key: this.requestKey && this.requestKey(itemData),
                        previous: lastItem,
                        size: itemSize,
                    };

                    if (lastItem) lastItem.next = item;

                    items.push(item);
                }

                onUpdate(items, options);
            },
            complete: onComplete,
        });

        return listRequest;
    }
    /**
     * @returns void
     */
    _cancelAllRequests = (): void => {
        this._cancelRequest(this._request);
        this._cancelRequest(this._requestAfter);
        this._cancelRequest(this._requestBefore);

        this._request = this._requestAfter = this._requestBefore = null;
    }
    /**
     * @param  {ListRequest} request
     * @returns void
     */
    _cancelRequest = (request: ?ListRequest): void => {
        request && request.close();
    }
}
