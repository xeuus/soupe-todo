import {metadataOf, optional, Soa} from "react-soa";


export function getSnapshot(soupe: Soa) {
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

export function restoreSnapshot(soupe: Soa, d: any) {
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

export function automaticPersist(soupe: Soa, data: any, onSave: (data: any) => any) {
	if (!!data) {
		optional(() => restoreSnapshot(soupe, JSON.parse(data)));
	}
	let saved = false;
	['visibilitychange', 'pagehide', 'freeze'].forEach((type) => {
		window.addEventListener(type, () => {
			if (!saved) {
				if (type === 'visibilitychange' && document.visibilityState === 'visible') return;
				onSave(JSON.stringify(getSnapshot(soupe)));
				saved = true;
			}
		}, {capture: true});
	});
}