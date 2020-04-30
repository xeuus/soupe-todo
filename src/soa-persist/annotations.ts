import {metadataOf, metadata} from "react-soa";

export function persisted(target: any, key: string) {
	const {persisted = []} = metadataOf(target);
	metadata(target, {
		persisted: [
			...persisted,
			{key}
		]
	});
}