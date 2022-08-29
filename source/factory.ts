import { EVENTS_PROPERTIES, EventEmitter } from "./events.js";
import { Events } from "./types.js";

export function createStateObject<T extends Record<string, unknown>>(
    base: T
): T & EventEmitter<Events> {
    const ee = new EventEmitter<Events>();
    const state = { ...base } as Record<string, unknown>;
    // Prepare base
    for (const key in state) {
        if (state.hasOwnProperty(key)) {
            if (EVENTS_PROPERTIES.indexOf(key) >= 0) {
                throw new Error(
                    `Failed configuring state: Property is reserved and cannot be used: ${key}`
                );
            }
        }
    }
    // Setup proxy
    const handler = {
        defineProperty(
            target: T & EventEmitter<Events>,
            property: string,
            descriptor: PropertyDescriptor
        ) {
            return true;
        },
        getOwnPropertyDescriptor(target: T & EventEmitter<Events>, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                const descriptor = Reflect.getOwnPropertyDescriptor(ee, property) || {
                    value: handler.get(ee as T & EventEmitter<Events>, property)
                };
                Object.defineProperty(ee, property, descriptor);
                return descriptor;
            } else {
                const descriptor = Reflect.getOwnPropertyDescriptor(state, property) || {
                    value: handler.get(state as T & EventEmitter<Events>, property)
                };
                Object.defineProperty(state, property, descriptor);
                return descriptor;
            }
        },
        deleteProperty(target: T & EventEmitter<Events>, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                delete ee[property];
                return true;
            } else if (property in state) {
                delete state[property];
                return true;
            }
            return false;
        },
        get(target: T & EventEmitter<Events>, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                return ee[property];
            }
            return state[property];
        },
        has(target: T & EventEmitter<Events>, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                return property in ee;
            }
            return property in state;
        },
        ownKeys(target: T & EventEmitter<Events>) {
            return [
                ...new Set([
                    ...Object.getOwnPropertySymbols(state),
                    ...Object.getOwnPropertyNames(state)
                ])
            ];
        },
        set(target: T & EventEmitter<Events>, property: string, value: any) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                if (["function"].indexOf(typeof ee[property]) >= 0) {
                    throw new Error(
                        `Failed updating state: Property is reserved and cannot be used: ${property}`
                    );
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
