import { eq, pick } from 'lodash';
import * as EDITOR from '../actions/editor';
import * as MODE from '../constants/Mode';
import * as SHAPE from '../constants/Shape';
import { StateStorage } from './state-storage';

const storage = new StateStorage(
    'nekoboard/editor',
    {
        mode: MODE.DEFAULT,
        shape: SHAPE.DEFAULT,
        fill: false,
        fillColor: '#ffffff',
        fontSize: 16,
        stroke: true,
        strokeColor: '#000000',
        strokeWidth: 1,
        styleHistory: [],
        edit: null,
        snap: true,
        ox: 0,
        oy: 0,
    },
    [
        'mode',
        'shape',
        'fill',
        'fillColor',
        'fontSize',
        'stroke',
        'strokeColor',
        'strokeWidth',
        'styleHistory',
        'snap',
    ]
);

const StyleKeys = [
    'fill',
    'fillColor',
    'fontSize',
    'stroke',
    'strokeColor',
    'strokeWidth',
];

export const editor = storage.apply((state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
    case EDITOR.SET_MODE:
        return {
            ...state,
            mode: action.mode,
        };
    case EDITOR.SET_SHAPE:
        return {
            ...state,
            shape: action.shape,
        };
    case EDITOR.PUSH_HISTORY:
        if (
                state.styleHistory.length > 0 &&
                    eq(pick(state, StyleKeys), state.styleHistory[0])
            ) return state;

        return {
            ...state,
            styleHistory: [
                pick(state, StyleKeys),
                ...state.styleHistory,
            ].slice(0, 10),
        };
    case EDITOR.SET_STYLE:
        return {
            ...state,
            ...pick(action, StyleKeys),
        };
    case EDITOR.SET_SNAP:
        return {
            ...state,
            snap: action.snap,
        };
    case EDITOR.BEGIN_EDIT:
        if (state.mode === MODE.EDIT) {
            // eslint-disable-next-line default-case
            switch (state.shape) {
            case SHAPE.TEXT:
            case SHAPE.PIECE:
                return state;
            }
        } else if (state.mode === MODE.ERASE || !action.id) {
            return state;
        }

        return {
            ...state,
            edit: action.id,
            ...pick(action, ['ox', 'oy']),
        };
    case EDITOR.END_EDIT:
    case EDITOR.CANCEL_EDIT:
        return {
            ...state,
            edit: null,
        };
    }

    return state;
});
