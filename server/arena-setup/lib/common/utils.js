"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInsideBox = exports.slerp = exports.deepFreeze = exports.pipe = exports.compose = exports.formatTime = exports.sleep = exports.getRandomIntDifferentThan = exports.getRandom = exports.getRandomInt = void 0;
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}
exports.getRandomInt = getRandomInt;
function getRandom(min, max) {
    return min + (Math.random() * (max - min + 1));
}
exports.getRandom = getRandom;
function getRandomIntDifferentThan(num, min, max) {
    let result = getRandomInt(min, max);
    while (result === num) {
        result = getRandomInt(min, max);
    }
    return result;
}
exports.getRandomIntDifferentThan = getRandomIntDifferentThan;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
exports.sleep = sleep;
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    let minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    let secondsStr = rest < 10 ? `0${rest}` : rest;
    return `${minutesStr}:${secondsStr}`;
}
exports.formatTime = formatTime;
exports.compose = (...fns) => (initialVal) => fns.reduceRight((val, fn) => fn(val), initialVal);
exports.pipe = (...fns) => (initialVal) => fns.reduce((val, fn) => fn(val), initialVal);
exports.deepFreeze = obj => {
    Object.keys(obj).forEach(prop => {
        if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop]))
            exports.deepFreeze(obj[prop]);
    });
    return Object.freeze(obj);
};
function slerp(a, b, t) {
    const out = {};
    var ax = a.x, ay = a.y, az = a.z, aw = a.w, bx = b.x, by = b.y, bz = b.z, bw = b.w;
    var omega, cosom, sinom, scale0, scale1;
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    if (cosom < 0.0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    if ((1.0 - cosom) > 0.000001) {
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    }
    else {
        scale0 = 1.0 - t;
        scale1 = t;
    }
    return {
        x: scale0 * ax + scale1 * bx,
        y: scale0 * ay + scale1 * by,
        z: scale0 * az + scale1 * bz,
        w: scale0 * aw + scale1 * bw
    };
}
exports.slerp = slerp;
function isInsideBox(box_position, box_scale, obj_position) {
    const [wp_x, wp_y, wp_z] = box_position;
    const [ws_x, ws_y, ws_z] = box_scale;
    const { x, y, z } = obj_position;
    let inside_x = false;
    let inside_y = false;
    let inside_z = false;
    if (x < (wp_x + ws_x) && x > (wp_x - ws_x))
        inside_x = true;
    if (y < (wp_y + ws_y) && y > (wp_y - ws_y))
        inside_y = true;
    if (z < (wp_z + ws_z) && z > (wp_z - ws_z))
        inside_z = true;
    if (inside_x && inside_y && inside_z)
        return true;
    return false;
}
exports.isInsideBox = isInsideBox;
