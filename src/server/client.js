import Config from 'config';
import EventEmitter from 'events';
import { pick } from 'lodash';
import { createClient } from './redis';
import * as Board from '../actions/board';
import * as Shape from '../actions/shape';
import { BOARD_KEYS, SHAPE_KEYS } from '../constants/keys';
import { generate as genId } from '../utility/id';

const DefaultBoard = Config.get('board');

export class Client extends EventEmitter {
    constructor(boardId) {
        super();

        this.id = genId();

        this.boardId = boardId;
        this.boardKey = `nekoboard:${boardId}`;
        this.shapeListKey = `nekoboard:${boardId}:shapes`;
        this.redis = createClient();

        this.touch();

        this.initSubscriber();
        this.sendInitialState();
    }

    initSubscriber() {
        const subscriber = this.subscriber = createClient();

        subscriber.subscribe(this.boardKey);
        subscriber.on('message', (channel, message) => {
            if (channel !== this.boardKey) return;

            const {
                action,
                sender,
            } = JSON.parse(message);
            if (sender === this.id) return;

            this.emit('action', action);
        });
    }

    sendInitialState() {
        const redis = this.redis;

        redis.getAsync(this.boardKey)
            .then((board) => board && JSON.parse(board) || {
                ...DefaultBoard,
                id: this.boardId,
            })
            .then((board) => this.emit('action', Board.update(board)));
        redis.lrangeAsync(this.shapeListKey, 0, -1)
            .then((shapes) => shapes && Promise.all(
                shapes.map((shapeKey) => redis.getAsync(shapeKey))
            ))
            .then((shapes) => this.emit('action', Shape.list(
                shapes.map((shape) => JSON.parse(shape))
            )));
    }

    end() {
        this.redis.end();
        this.subscriber.end();
        this.removeAllListeners();
    }

    touch() {
        this.redis.set(`nekoboard:${this.boardId}:timestamp`, Date.now());
    }

    publish(action) {
        this.touch();

        this.redis.publish(this.boardKey, JSON.stringify({
            action,
            sender: this.id,
        }));
    }

    updateBoard(board) {
        const picked = pick(board, BOARD_KEYS);

        this.redis.getAsync(this.boardKey)
            .then((prev) => ({
                ...(prev && JSON.parse(prev)),
                ...picked,
                id: this.boardId,
            }))
            .then((next) =>
                this.redis.set(this.boardKey, JSON.stringify(next))
            );

        this.publish(Board.update(picked));
    }

    shapeKeyOf(shapeId) {
        return `nekoboard:${this.boardId}:shape:${shapeId}`;
    }

    addShape(shape) {
        const picked = {
            ...pick(shape, SHAPE_KEYS),
            timestamp: Date.now(),
        };
        const shapeKey = this.shapeKeyOf(picked.id);

        this.redis.set(shapeKey, JSON.stringify(picked));
        this.redis.lpush(this.shapeListKey, shapeKey);

        this.publish(Shape.add(picked));
    }

    updateShape(shape) {
        const picked = {
            ...pick(shape, SHAPE_KEYS),
            timestamp: Date.now(),
        };
        const shapeKey = this.shapeKeyOf(picked.id);

        this.redis.getAsync(shapeKey)
            .then((prev) => this.redis.set(shapeKey, JSON.stringify({
                ...(prev && JSON.parse(prev)),
                ...picked,
            })));

        this.publish(Shape.update(picked));
    }

    removeShape(shapeId) {
        const shapeKey = this.shapeKeyOf(shapeId);

        this.redis.lrem(this.shapeListKey, 0, shapeKey);

        this.publish(Shape.remove(shapeId));
    }
}
