import React, {createContext, ReactNode, useContext} from "react";
import {ABContext} from "./provider";

type Context = {
	experiment: string;
	variant: string;
}
const RouteContext = createContext<Partial<Context>>({});


export function Experiment(props: { children?: ReactNode; name: string }) {
	return (
		<RouteContext.Provider value={{
			experiment: props.name,
		}}>
			{props.children}
		</RouteContext.Provider>
	);
}

export function Variant(props: { children?: ReactNode; name: string }) {
	const context = useContext(RouteContext);
	return (
		<RouteContext.Provider value={{
			...context,
			variant: props.name,
		}}>
			{props.children}
		</RouteContext.Provider>
	);
}

export function Route(props: { children?: ReactNode; name: string; path: string, component?: any }) {
	const context = useContext(RouteContext);
	const nav = useContext(ABContext);
	nav.blueprints.push({
		name: props.name,
		path: props.path,
		experiment: context.experiment,
		variant: context.variant,
		component: props.component,
		children: props.children,
	});
	return null;
}
