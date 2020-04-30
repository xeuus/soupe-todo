import {Soa} from "./provider";
import {metadataOf} from "./metadata";
export function startTimer(timer: any) {
	(timer as any).start();
}

export function stopTimer(timer: any) {
	(timer as any).start();
}

export async function invoke(context: Soa, target: any, name: string, ...args: any[]) {
	const {id} = metadataOf(target.prototype);
	const service = context.services[id];
	return await service[name].apply(service, args);
}

export async function invokeAll(context: Soa, type: 'linear' | 'parallel' | 'all' | 'race', name: string, ...args: any[]) {
	const pm = context.services.reduce((acc, service) => {
		const {order = 0, id} = metadataOf(service);
		if (typeof service[name] === 'function') {
			acc.push([id, order, service]);
		}
		return acc;
	}, []).sort((a: any, b: any) => a[1] - b[1]);
	const result: any = {};
	if (type === 'linear') {
		for (let obj of pm) {
			result[obj[0]] = await obj[2][name].apply(obj[2], args);
		}
	} else if (type === 'parallel') {
		const a = await Promise.all(pm.map(obj => obj[2][name].apply(obj[2], args)));
		pm.forEach((obj, i) => {
			result[obj[0]] = a[i];
		})
	} else if (type === 'race') {
		return await Promise.race(pm.map(obj => obj[2][name].apply(obj[2], args)));
	} else if (type === 'all') {
		for (let obj of pm) {
			obj[2][name].apply(obj[2], args);
		}
	}
	return result;
}

export class Service {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(soupe: Soa) {
	}

	get context(): Soa {
		return (this as any).__context__;
	}

	startTimer(timer: any) {
		startTimer(timer);
	}

	stopTimer(timer: any) {
		stopTimer(timer);
	}

	broadcast(...args: any[]) {
		this.context.channel.dispatch(...args);
	}

	created(...args: any[]) {
	}

	messageReceived(...args: any[]) {
	}

	async invoke(target: any, name: string, ...args: any[]) {
		return await invoke(this.context, target, name, ...args);
	}

	async invokeAll(name: string, ...args: any[]) {
		await invokeAll(this.context, 'all', name, ...args);
	}

	async invokeParallel(name: string, ...args: any[]) {
		return await invokeAll(this.context, 'parallel', name, ...args);
	}

	async invokeRace(name: string, ...args: any[]) {
		return await invokeAll(this.context, 'race', name, ...args);
	}

	async invokeLinear(name: string, ...args: any[]) {
		return await invokeAll(this.context, 'linear', name, ...args);
	}
}