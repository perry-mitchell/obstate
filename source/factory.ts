import { EventEmitter } from "./events.js";
import { Events } from "./types.js";

export function createStateObject<T extends Record<string, unknown>>(base: T): T & EventEmitter<Events> {
    const ee = new EventEmitter<Events>();
    const state = { ...base } as Record<string, unknown>;
    // Prepare base
    for (const key in state) {
        if (state.hasOwnProperty(key)) {
            // if (RESERVED_PROPERTIES.indexOf(key) >= 0) {
            if (typeof ee[key] !== "undefined") {
                throw new Error(`Failed configuring state: Property is reserved and cannot be used: ${key}`);
            }
        }
    }
    // Setup proxy
    const handler = {
        get(target: T & EventEmitter<Events>, property: string) {
            if (typeof ee[property] !== "undefined") {
                return ee[property];
            }
            return state[property];
        },
        set(target: T & EventEmitter<Events>, property: string, value: any) {
            if (typeof ee[property] !== "undefined") {
                if (["function"].indexOf(typeof ee[property]) >= 0) {
                    throw new Error(`Failed updating state: Property is reserved and cannot be used: ${property}`);
                } else {
                    ee[property] = value;
                    return true;
                }
            }
            const oldValue = state[property];
            ee.emit("before", {
                property,
                newValue: value,
                currentValue: oldValue
            });
            state[property] = value;
            ee.emit("update", {
                property,
                newValue: value,
                oldValue
            });
            return true;
        }
    };
    return new Proxy(ee as T & EventEmitter<Events>, handler);
}
