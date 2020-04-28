import {EventBus} from "./tools";

export const config = {
	counter: 0,
	services: [] as any[],
};

export type TimerOptions = { immediate: boolean; name: string };
export type Metadata = Partial<{
	id: number;
	order: number;
	observables: { key: string }[];
	persisted: { key: string }[];
	timers: { key: string; ms: number, options?: TimerOptions }[];
	bus: EventBus;
}>;

export function metadataOf(target: any): Metadata {
	return target.__metadata__ || {};
}

export function metadata(target: any, value: Metadata) {
	Object.defineProperty(target, '__metadata__', {
		configurable: true,
		enumerable: false,
		writable: false,
		value: {
			...metadataOf(target),
			...value,
		}
	});
}
