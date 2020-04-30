import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";

import {Action, History, Location} from "history";
import {EventBus} from "../soupe";
import {deserializeQuery, removeTrailingSlash, serializeQuery} from "./match";

export type RoutingState = {
	location: Location;
	action: Action;
	isFirstRendering: boolean;
}

export type Blueprint = {
	name: string;
	path: string;
	experiment: string;
	variant: string;
	component: any;
	children: any;
}
export type Navigation = {
	history: History;
	state: RoutingState,
	goto(name: string, params?: { [key: string]: any });
	replace(name: string, params?: { [key: string]: any });
	bus: EventBus,
	query: { [key: string]: any };
	blueprints: Blueprint[],
	preference: { [key: string]: string };
	default?: string;
};
export const NavigationContext = createContext<Navigation>({} as Navigation);


export function deferRoute(b: Blueprint) {
	if (!b)
		return '';
	let path = '';
	if (b.experiment) {
		path += '/' + b.experiment
	}
	if (b.variant) {
		path += '/' + b.variant
	}
	path += b.path;
	return `${removeTrailingSlash(path)}/`;
}

function inferRoute(nav: Navigation, useDefault?: boolean): number {
	let index = nav.blueprints.findIndex(blueprint => deferRoute(blueprint) === nav.state.location.pathname);
	if (index < 0 && useDefault) {
		index = findBlueprint(nav, nav.default, true) as number
	}
	return index;
}

function setHistory(method: string, nav: Navigation, found: Blueprint, params: any) {
	if (found) {
		const pathnameInStore = deferRoute(found);
		const searchInStore = typeof params === 'string' ? params : typeof params === 'object' ? serializeQuery(params) : '';
		const history = nav.history;
		const {
			pathname: pathnameInHistory,
			search: searchInHistory,
		} = history.location;
		if (pathnameInHistory !== pathnameInStore || searchInHistory !== searchInStore) {
			history[method]({
				pathname: pathnameInStore,
				search: pathnameInHistory !== pathnameInStore ? searchInStore : extendParams(searchInHistory, params),
			})
		}
	}
}

export function findBlueprint(nav: Navigation, name: string, useIndex?: boolean) {
	for (let i = 0; i < nav.blueprints.length; i++) {
		const blueprint = nav.blueprints[i];
		if (blueprint.name === name) {
			if (!blueprint.experiment) {
				return useIndex ? i : blueprint;
			}
			const preferredVariant = nav.preference[blueprint.experiment];
			if (!preferredVariant) {
				return useIndex ? i : blueprint;
			}
			if (blueprint.variant === preferredVariant) {
				return useIndex ? i : blueprint;
			}
		}
	}
	return useIndex ? -1 : null;
}

function Handler() {
	const nav = useContext(NavigationContext);
	const search = useState<string>(nav.history.location.search);
	const [state, setState] = useState<number>(inferRoute(nav, true));
	useEffect(() => {
		const def = findBlueprint(nav, nav.default, true);

		if(state > -1) {
			if (def > -1 && def === state) {
				setHistory('replace', nav, nav.blueprints[def], nav.state.location.search);
			}
			nav.bus.dispatch('update', nav.blueprints[state].name, {});
		}
		let last: string = null;
		const handleLocationChange = (location: Location, action: Action, isFirstRendering = false) => {
			if (last !== location.search) {
				nav.query = deserializeQuery(location.search);
				last = location.search;
				search[1](location.search);
			}
			nav.state = {location, action, isFirstRendering};
			const ifr = inferRoute(nav);
			if(ifr > -1) {
				setState(ifr);
				nav.bus.dispatch('update', nav.blueprints[ifr].name, {});
			}
		};
		handleLocationChange(nav.history.location, nav.history.action, true);
		const release1 = nav.bus.listen((method: string, name: any, params?: { [key: string]: any }) => {
			if (method !== 'update') {
				const found = findBlueprint(nav, name) as Blueprint;
				setHistory(method, nav, found, params);
			}
		});
		const release2 = nav.history.listen(handleLocationChange);
		return () => {
			release1();
			release2();
		};
		// eslint-disable-next-line
	}, []);
	if (state < 0) {
		return null;
	}
	const b = nav.blueprints[state];
	if(typeof b.component === 'function'){
		return React.createElement(b.component, {});
	}
	return b.children;
}

export function NavigationProvider(props: { navigation: Navigation; children: ReactNode }) {
	return (
		<NavigationContext.Provider value={props.navigation}>
			{props.children}
			<Handler/>
		</NavigationContext.Provider>
	);
}

export function createNavigation(history: History) {
	const bus = new EventBus();
	const navigation: Navigation = {
		blueprints: [],
		query: {},
		history,
		bus,
		state: {
			location: history.location,
			action: history.action,
			isFirstRendering: true,
		},
		goto: (path, params) => bus.dispatch('push', path, params),
		replace: (path, params) => bus.dispatch('replace', path, params),
		preference: {},
	};
	return navigation;
}

function extendParams(search: string, params: { [key: string]: any }) {
	const oldParams = deserializeQuery(search);
	return serializeQuery({
		...oldParams,
		...params,
	});
}
