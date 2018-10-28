//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

import {
    type Coordinates,
    type LayoutItem,
} from '../layouts/Layout';
import Request from './Request';

export type ListRequestOptions = {
    itemIndex: ?number,
    itemOffset: ?Coordinates,
    itemPivot: ?Coordinates,
}

export default class ListRequest extends Request {

    item: ?LayoutItem;

    update(data: any[], options: ?ListRequestOptions): void {
        super.update(data, options);
    }

}
