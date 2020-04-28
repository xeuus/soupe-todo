import {config, metadata, metadataOf, TimerOptions} from "./metadata";
import {Container} from "./container";
import {SoupeContext} from "./provider";
import {debounce, EventBus} from "./tools";

// -----
export function Bean(target: any) {
	const id = config.counter++;
	config.services[id] = target;
	metadata(target.prototype, {id, bus: new EventBus()});
	return target;
}

// -----
export function Observer(types?: { new(container?: Container): any }[]) {
	return function (target: any) {
		const original = target;
		const func = function (props: any, container: Container) {
			const component = this;

			const toRelease: any[] = [];
			if (component.screenWillLoad) {
				component.screenWillLoad = component.screenWillLoad.bind(component);
			}
			component.released = false;
			this.delayedRefresh = debounce(() => {
				if (this.released)
					return;
				this.forceUpdate(() => {
					if (this.serviceDidUpdate) {
						this.serviceDidUpdate.apply(this)
					}
				});
			}, 20);

			const originalComponentDidMount = this.componentDidMount;

			this.componentDidMount = function (...args: any[]) {
				if (types && types.length > 0) {
					types.forEach(typ => {
						const {id} = metadataOf(typ.prototype);
						const {bus} = metadataOf(container.services[id]);
						const listener = bus.listen((id: string, value: any) => {
							if (this.released)
								return;
							this.delayedRefresh && this.delayedRefresh(this);
						});
						toRelease.push(listener);
					});
				}
				if (originalComponentDidMount) {
					originalComponentDidMount.apply(this, args);
				}
			};

			const originalComponentWillUnmount = this.componentWillUnmount;
			this.componentWillUnmount = function (...args: any[]) {
				this.released = true;
				if (originalComponentWillUnmount) {
					originalComponentWillUnmount.apply(this, args)
				}
				toRelease.forEach(func => func());
			};

			return original.call(this, props, container);
		};
		func.contextType = SoupeContext;
		func.prototype = original.prototype;
		return func as any;
	}
}

export function Observable(target: any, key: string) {
	const {observables = []} = metadataOf(target);
	metadata(target, {
		observables: [
			...observables,
			{key}
		]
	});
}

export function Persisted(target: any, key: string) {
	const {persisted = []} = metadataOf(target);
	metadata(target, {
		persisted: [
			...persisted,
			{key}
		]
	});
}

export function Timer(ms: number, options?: TimerOptions) {
	return function (target: any, key: string) {
		const {timers = []} = metadataOf(target);
		metadata(target, {
			timers: [
				...timers,
				{key, ms, options}
			],
		});
	}
}

// -----
export const Ordered = {
	HIGHEST_PRECEDENCE: -999999999,
	LOWEST_PRECEDENCE: 999999999,
};

export function Order(order: number) {
	return function (target: any) {
		metadata(target.prototype, {
			order,
		});
		return target;
	}
}

// -----
export function Pick<T>(target: { new(container?: Container): T }, base: any): T {
	const meta = metadataOf(target.prototype);
	if(!!base.__context__) {
		return base.__context__.services[meta.id];
	}
	if(!!base.context) {
		return base.context.services[meta.id];
	}
	return null;
}
