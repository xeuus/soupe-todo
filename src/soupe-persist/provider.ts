import {metadataOf, Soupe} from "soupe";


export function getSnapshot(soupe: Soupe) {
	return soupe.services.reduce((acc, service) => {
		const {persisted = [], id} = metadataOf(service);
		if (persisted.length > 0) {
			const obj: any = {};
			persisted.forEach((meta) => {
				const {key} = meta;
				obj[key] = service[key];
			});
			acc[id] = obj;
		}
		return acc;
	}, {} as any);
}

export function restoreSnapshot(soupe: Soupe, d: any) {
	soupe.services.forEach((service) => {
		const {id, persisted = []} = metadataOf(service);
		if (persisted.length > 0) {
			const data = d[id];
			if (data) {
				persisted.forEach((meta) => {
					const {key} = meta;
					if (typeof data[key] !== 'undefined') {
						service[key] = data[key];
					}
				});
			}
		}
	});
}