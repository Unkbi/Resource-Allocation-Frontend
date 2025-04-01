"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StoreProvide;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const store_1 = require("./redux/store");
function StoreProvide({ children }) {
    const storeRef = (0, react_1.useRef)();
    if (!storeRef.current) {
        storeRef.current = (0, store_1.makeStore)();
    }
    return React.createElement(react_redux_1.Provider, { store: storeRef.current }, children);
}
