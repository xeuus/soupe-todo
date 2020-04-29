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
export type Container = {
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
export const NavigationContext = createContext<Container>({} as Container);


function deferRoute(b: Blueprint) {
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

function findDefault(nav: Container) {
	for (let i = 0; i < nav.blueprints.length; i++) {
		const blueprint = nav.blueprints[i];
		if (blueprint.name === nav.default) {
			if (!blueprint.experiment) {
				return i;
			}
			const preferredVariant = nav.preference[blueprint.experiment];
			if (!preferredVariant) {
				return i;
			}
			if (blueprint.variant === preferredVariant) {
				return i;
			}
		}
	}
	return -1;
}

function inferRoute(nav: Container, useDefault?: boolean) {
	const index = nav.blueprints.findIndex(blueprint => deferRoute(blueprint) === nav.state.location.pathname);
	if (index < 0 && useDefault) {
		return findDefault(nav)
	}
	return index;
}

function setHistory(method: string, nav: Container, found: Blueprint, params: any) {
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

function Handler() {
	const nav = useContext(NavigationContext);
	const search = useState<string>(nav.history.location.search);
	const [state, setState] = useState<number>(inferRoute(nav, true));
	useEffect(() => {
		const def = findDefault(nav);
		if (def > -1 && def === state) {
			setHistory('replace', nav, nav.blueprints[def], nav.state.location.search)
		}
		let last: string = null;
		const handleLocationChange = (location: Location, action: Action, isFirstRendering = false) => {
			if (last !== location.search) {
				nav.query = deserializeQuery(location.search);
				last = location.search;
				search[1](location.search);
			}
			nav.state = {location, action, isFirstRendering};
			setState(inferRoute(nav));
		};
		handleLocationChange(nav.history.location, nav.history.action, true);
		const release1 = nav.bus.listen((method: string, name: any, params?: { [key: string]: any }) => {
			let found: Blueprint = null;
			for (let i = 0; i < nav.blueprints.length; i++) {
				const blueprint = nav.blueprints[i];
				if (blueprint.name === name) {
					if (!blueprint.experiment) {
						found = blueprint;
						break;
					}
					const preferredVariant = nav.preference[blueprint.experiment];
					if (!preferredVariant) {
						found = blueprint;
						break;
					}
					if (blueprint.variant === preferredVariant) {
						found = blueprint;
						break;
					}
				}
			}
			setHistory(method, nav, found, params);
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
	console.log(nav.query);
	return (
		<>
			{nav.blueprints[state].children}
		</>
	);
}

export function NavigationProvider(props: { navigation: Container; children: ReactNode }) {
	return (
		<NavigationContext.Provider value={props.navigation}>
			{props.children}
			<Handler/>
		</NavigationContext.Provider>
	);
}

export function createNavigation(history: History) {
	const bus = new EventBus();
	const navigation: Container = {
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
