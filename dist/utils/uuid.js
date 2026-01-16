"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUuidV4 = void 0;
const uuid_1 = require("uuid");
const isUuidV4 = (id) => {
    if (typeof id !== 'string')
        return false;
    return (0, uuid_1.validate)(id) && (0, uuid_1.version)(id) === 4;
};
exports.isUuidV4 = isUuidV4;
