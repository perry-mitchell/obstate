export interface Events {
    before: (update: {
        property: string;
        newValue: unknown;
        currentValue: unknown;
    }) => void;
    update: (update: {
        property: string;
        newValue: unknown;
        oldValue: unknown;
    }) => void;
}
