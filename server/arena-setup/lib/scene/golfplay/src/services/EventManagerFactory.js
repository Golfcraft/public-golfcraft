"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventManager = void 0;
const createEventManager = () => {
    let callbacks = {
        '*': []
    };
    return {
        onEvent: (type, fn) => {
            callbacks[type] = callbacks[type] || [];
            const eventCallbacks = callbacks[type];
            eventCallbacks.push(fn);
            return () => eventCallbacks.splice(eventCallbacks.indexOf(fn), 1);
        },
        trigger: (event) => {
            var _a, _b;
            ((_a = callbacks['*']) === null || _a === void 0 ? void 0 : _a.length) && callbacks['*'].forEach((fn) => fn(event));
            ((_b = callbacks[event.type]) === null || _b === void 0 ? void 0 : _b.length) && callbacks[event.type].forEach((fn) => fn(event));
        },
        dispose: () => {
            callbacks = {};
        }
    };
};
exports.createEventManager = createEventManager;
