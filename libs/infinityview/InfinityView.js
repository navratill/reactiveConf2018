//
// Copyright (c) 2017, nangu.TV, a.s. All rights reserved.
// nangu.TV, a.s PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
//
// @flow
//

// nadefinovat jak se maji brat data a kam se maji renderovat
// musi to byt trida?
// model se musi renderovat - jen zmena na modelu (ze by model mel byt immutable?)
// layout by ho mohl jen vygenerovat
// w a h elementu se musi propisovat do modelu zpet

// co predpripravene layouty? - carousel/list
// co looping? Je vubec potreba? (ne)
// default velikosti (?) (ano/nepovinne) - pokud je, muze byt preloading stav, v jinem pripade se ceka

// jak delat v listu rozinani aktivniho prvku?
// jak obecne renderovat od nejakeho prvku?
// rict prvek a jeho lokalni zarovnani?
// nebo proste jen napsat layout, ktery to tak na zacatku vygeneruje a pak si donacitat okoli?
// co kdyz ten prvek aktualni chci rozsirit? To by mohl vsechno delat layout tyhle vypocty, tj custom trida

// infinityview musi vedet, kdy si nerikat o dalsi prvky - co kdyz je to tak rychly, ze se request musi vzdy prekopat...umet ho stopnout a jen udelat preload stavy (?)
// -> pokud nejsou preload stavy, proste pockat, az se donacte a pak se to nikdy nestane...

// ma parametr data a error (pokud nastane chyba, tak at si s ni poradi)

import * as React from 'react';

import {
    type LayoutItem,
    type Bounds,
} from './layouts/Layout';

type TProps = {
    renderItem: (item: any, bounds: Bounds) => ?React.Node,
    snapshot: ?Array<LayoutItem>,
}

export default class InfinityView extends React.PureComponent<TProps> {

    constructor(props: TProps) {
        super(props);
    }

    renderSnapshot = (): Array<React.Node> => {
        if (!this.props.snapshot) {
            return [];
        }

        const items: Array<React.Node> = [];

        for (const item: LayoutItem of this.props.snapshot) {
            const { bounds, data } = item;

            let renderedItem = this.props.renderItem && this.props.renderItem(item);
            renderedItem = renderedItem && React.cloneElement(renderedItem, {
                key: item.key,
                style: {
                    position: 'absolute',
                    left: bounds.x ? bounds.x : null,
                    top: bounds.y ? bounds.y : null,
                    width: bounds.width ? bounds.width : '100%',
                    height: bounds.height ? bounds.height : '100%',
                },
            });

            items.push(renderedItem);
        }

        return items;
    }

    render() {
        return null;
    }

}
