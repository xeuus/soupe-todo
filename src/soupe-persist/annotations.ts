import {metadataOf, metadata} from "soupe";

export function Persisted(target: any, key: string) {
	const {persisted = []} = metadataOf(target);
	metadata(target, {
		persisted: [
			...persisted,
			{key}
		]
	});
}