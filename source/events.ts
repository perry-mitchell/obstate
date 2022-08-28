import {
    default as EventEmitter3,
    EventListener,
    EventNames,
    ValidEventTypes
} from "eventemitter3";

export const EVENTS_PROPERTIES: ReadonlyArray<string> = Object.freeze([
    "_events",
    "_eventsCount",
    "addListener",
    "emit",
    "eventNames",
    "listeners",
    "listenerCount",
    "off",
    "on",
    "once",
    "removeAllListeners",
    "removeListener"
]);

export class EventEmitter<T extends ValidEventTypes> extends EventEmitter3<T> {
    emit<E extends EventNames<T>>(eventName: E, ...args: Parameters<EventListener<T, E>>): boolean {
        super.emit<E>(eventName, ...args);
        super.emit<E>("*" as E, ...(<Parameters<EventListener<T, E>>>[eventName, ...args]));
        return true;
    }
}
