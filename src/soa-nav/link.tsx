import React, {AnchorHTMLAttributes, useContext, useEffect, useState} from "react";
import {ABContext} from "./index";

export function NavLink(props: { name: string; activeClassName?: string; } & AnchorHTMLAttributes<HTMLAnchorElement>) {
	const {name, children, className, activeClassName = 'active', ...rest} = props;
	const nav = useContext(ABContext);
	const [active, setActive] = useState(false);
	useEffect(() => {
		return nav.bus.listen((method: string, name: any) => {
			setActive(props.name === name)
		});
		// eslint-disable-next-line
	}, []);
	return (
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		<a href="#" className={`${className} ${active ? activeClassName : ''}`} onClick={(e) => {
			e.preventDefault();
			nav.goto(name);
		}} {...rest}>{children}</a>
	)
}

export function Link(props: { name: string; } & AnchorHTMLAttributes<HTMLAnchorElement>) {
	const {name, children, ...rest} = props;
	const nav = useContext(ABContext);
	return (
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		<a href="#" onClick={(e) => {
			e.preventDefault();
			nav.goto(name);
		}} {...rest}>{children}</a>
	)
}