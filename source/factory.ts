import { EVENTS_PROPERTIES, EventEmitter } from "./events.js";
import { Events } from "./types.js";

/**
 * Create a new state object (+ management interface)
 * @param base The base record (object) to use for the state manager.
 *  The type is used for downstream modifications to the state.
 * @returns A managed state object with an event listener interface.
 * @example
 *  // Create a new object and modify it
 *  const state = createStateObject({
 *      count: 1,
 *      ts: Date.now()
 *  });
 *  state.on("update", ({ property, newValue }) => {
 *      console.log("Updated:", property, newValue);
 *  });
 *  state.count += 1;
 *  // The above logs:
 *  //  Updated: count 2
 */
export function createStateObject<T extends Record<string, unknown>>(
    base: T
): T & EventEmitter<Events> {
    type StateTarget = T & EventEmitter<Events>;
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
        defineProperty(target: StateTarget, property: string, descriptor: PropertyDescriptor) {
            return true;
        },
        getOwnPropertyDescriptor(target: StateTarget, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                const descriptor = Reflect.getOwnPropertyDescriptor(ee, property) || {
                    value: handler.get(ee as StateTarget, property)
                };
                Object.defineProperty(ee, property, descriptor);
                return descriptor;
            } else {
                const descriptor = Reflect.getOwnPropertyDescriptor(state, property) || {
                    value: handler.get(state as StateTarget, property)
                };
                Object.defineProperty(state, property, descriptor);
                return descriptor;
            }
        },
        deleteProperty(target: StateTarget, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                delete ee[property];
                return true;
            } else if (property in state) {
                delete state[property];
                return true;
            }
            return false;
        },
        get(target: StateTarget, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                return ee[property];
            }
            return state[property];
        },
        has(target: StateTarget, property: string) {
            if (EVENTS_PROPERTIES.indexOf(property) >= 0) {
                return property in ee;
            }
            return property in state;
        },
        ownKeys(target: StateTarget) {
            return [
                ...new Set([
                    ...Object.getOwnPropertySymbols(state),
                    ...Object.getOwnPropertyNames(state)
                ])
            ];
        },
        set(target: StateTarget, property: string, value: any) {
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
    return new Proxy(ee as StateTarget, handler);
}
