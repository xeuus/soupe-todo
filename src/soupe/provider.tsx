import React, {createContext, ReactNode} from "react";
import {Container} from "./container";
import {config, metadataOf} from "./metadata";

export const SoupeContext = createContext<Container>({} as Container);
export const SoupeConsumer = SoupeContext.Consumer;

export function SoupeProvider(props: { container: Container; children: ReactNode }) {
	return (
		<SoupeContext.Provider value={props.container}>
			{props.children}
		</SoupeContext.Provider>
	);
}

export function startTimer(timer: any) {
	(timer as any).start();
}

export function stopTimer(timer: any) {
	(timer as any).start();
}

export function createContainer(services?: any): Container {
	const cache: any = {};

	function importAll(r: any) {
		r.keys().forEach((key: any) => cache[key] = r(key));
	}

	importAll(services);
	const container: Container = {};
	container.services = config.services
		.map(cls => {
			const {order = 0} = metadataOf(cls.prototype);
			return [order, Object.create(cls.prototype)];
		})
		.sort((a, b) => a[0] - b[0])
		.map(a => a[1]);
	for (let i = 0; i < container.services.length; i ++) {
		singletonService(container, container.services[i]);
	}
	return container;
}

function singletonService(container: Container, service: any) {
	const {bus, observables = [], timers = []} = metadataOf(service);
	Object.defineProperty(service, '__context__', {
		value: container,
		configurable: false,
		enumerable: false,
		writable: false,
	});
	service.constructor(container);
	timers.forEach((data, i) => {
		const {key, ms, options} = data;
		let timer: any = null;
		let startDate: Date = null;

		function recall() {
			timer = setTimeout(() => {
				const response = service[key].call(service, startDate);
				if (response !== false)
					recall();
			}, ms)
		}

		Object.defineProperty(service[key], 'stop', {
			writable: false,
			enumerable: true,
			value: function () {
				clearTimeout(timer);
			},
			configurable: true,
		});

		Object.defineProperty(service[key], 'start', {
			writable: false,
			enumerable: true,
			value: function () {

				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
				startDate = new Date();
				recall();
			},
			configurable: true,
		});
		if (!options || options.immediate) {
			startDate = new Date();
			recall();
		}
	});

	observables.forEach((data: any) => {
		const {key} = data;
		const alias = `$$${key}`;
		Object.defineProperty(service, alias, {
			configurable: true,
			writable: false,
			enumerable: false,
			value: service[key],
		});
		if (!!service.created) {
			service.created.call(service);
		}
		Object.defineProperty(service, key, {
			configurable: true,
			enumerable: true,
			get: () => {
				return service[alias];
			},
			set: (value: any) => {
				if (service[alias] !== value) {
					Object.defineProperty(service, alias, {
						configurable: true,
						writable: false,
						enumerable: false,
						value: value,
					});
					bus.dispatch(key, value);
				}
			}
		});
	});
}
