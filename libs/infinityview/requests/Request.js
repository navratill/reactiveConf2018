//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import Observable from 'zen-observable';

import { type Bounds } from '../layouts/Layout';

/**
 * When layout needs data, it is using Request class for that. Every request is for specific bounds in layout. Request is
 * based on Observable pattern and throw update method multiple updates of data can be sent to layout.
 * @class
 */
export default class Request extends Observable {
    /**
     * Every request is connected to specific bounds.
     * @private
     * @property {Bounds}
     */
    _bounds: Bounds;
    /**
     * Contains data which were received by update method.
     * @private
     * @property {LayoutItem[]}
     */
    _data: any[];
    /**
     * @private
     * @property
     */
    _observers: [];
    /**
     * Getter for request's bounds.
     * @returns Bounds
     */
    get bounds(): Bounds {
        return { ...this._bounds };
    }
    /**
     * Getter for request's data.
     * @returns LayoutItem
     */
    get data(): any[] {
        return [...this._data];
    }

    constructor(bounds: Bounds) {
        super((observer) => {
            this._observers.push(observer);
        });

        this._bounds = bounds;
        this._data = [];
        this._observers = [];
    }
    /**
     * If there is error to receive data for request, call this method. It will pass error message and close request.
     * @param  {any} message
     * @param  {Object<any>} optionalParams
     * @returns void
     */
    error(message: any, optionalParams: Object<any>): void {
        this._observers.map((observer) => { return observer.error(message, optionalParams); });

        this.close();
    }
    /**
     * To cancel request.
     * @returns void
     */
    close(): void {
        this._observers = [];
    }
    /**
     * After final update of data will notify layout that request was completed.
     * @param  {Object<any>} optionalParams
     * @returns void
     */
    complete(optionalParams: Object<any>): void {
        this._observers.map((observer) => { return observer.complete(optionalParams); });
    }
    /**
     * Send updated data to request and call complete immediately. It will replace previous data which were sent by update method.
     * @param  {any[]} data
     * @param  {Object<any>} optionalParams
     * @returns void
     */
    completeWithData(data: any[], optionalParams: Object<any>): void {
        this.update(data, optionalParams);
        this.complete(data, optionalParams);
    }
    /**
     * Send updated data to request. It will replace previous data which were sent by update method. It can be used for
     * preloading data first and after call the same method with final data. Don't forget to call complete method on the end.
     * @param  {any[]} data
     * @param  {Object<any>} optionalParams
     * @returns void
     */
    update(data: any[], optionalParams: Object<any>): void {
        this._observers.map((observer) => {
            return observer.next({
                data,
                ...optionalParams,
            });
        });

        this._data = data;
    }
}
