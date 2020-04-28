import {Container} from "./container";
import {useContext, useEffect, useRef, useState} from "react";
import {SoupeContext} from "./provider";
import {metadataOf} from "./metadata";
import {debounce} from "./tools";

export function useService<T>(target: { new(container?: Container): T }): T {
	useBus([target]);
	const container = useContext(SoupeContext);
	const meta = metadataOf(target.prototype);
	return container ? container.services[meta.id] : null;
}

export function useBus(types?: { new(container?: Container): any }[]) {
	const container = useContext(SoupeContext);
	const upd = useState(0);
	const ref = useRef({
		updates: 0,
		released: false,
		toRelease: [],
	}).current;
	const update = useRef(debounce(() => {
		if (ref.released)
			return;
		upd[1](a => a + 1)
	}, 20)).current;

	useEffect(() => {
		if (types && types.length > 0) {
			types.forEach(typ => {
				const {id} = metadataOf(typ.prototype);
				const {bus} = metadataOf(container.services[id]);
				const listener = bus.listen(() => {
					if (ref.released || !update)
						return;
					update();
				});
				ref.toRelease.push(listener);
			});
		}
		return () => {
			console.log('disconnected');
			ref.released = true;
			ref.toRelease.forEach(func => func());
		}
		// eslint-disable-next-line
	}, []);

}
