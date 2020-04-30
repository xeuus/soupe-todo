import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import {createSoupe, SoupeProvider, startTimer, useService} from "soupe";
import {createNavigation, Experiment, NavigationProvider, NavLink, Route, Variant} from "soupe-navigation";
import {createHashHistory} from "history";
import {Router, ServiceA, ServiceB, ServiceC} from "./greeter.soupe";
import {register} from './service-worker';

import './index.sass';
import './greeter.soupe';
import {getSnapshot, restoreSnapshot} from "./soupe-persist/provider";

const history = createHashHistory();
const soupe = createSoupe();
const defaultState = getSnapshot(soupe);
restoreSnapshot(soupe, JSON.parse(localStorage.getItem('data') || '{}'));
['blur', 'visibilitychange', 'pagehide', 'freeze'].forEach((type) => {
	window.addEventListener(type, ()=>{
		console.log(type + ': saving...');
		localStorage.setItem('data', JSON.stringify(getSnapshot(soupe)))
	}, {capture: true});
});
const win = window as any;
soupe.services.forEach(a => {
	win.__services = win.__services || {};
	win.__services[a.constructor.name] = a;
});
const navigation = soupe.pick(Router).navigation = createNavigation(history);
navigation.default = 'home';


function BundleA() {
	const a = useService(ServiceA);
	return (
		<button onClick={() => a.hello++}>
			hello = {a.hello}
		</button>
	)
}

function BundleB() {
	const a = useService(ServiceB);
	return (
		<button onClick={() => startTimer(a.update)}>
			hello = {a.hello}
		</button>
	)
}

function BundleC() {
	const a = useService(ServiceC);
	return (
		<button onClick={() => a.hello++}>
			hello = {a.hello}
		</button>
	)
}

ReactDOM.render(
	<StrictMode>
		<SoupeProvider soupe={soupe}>
			<NavigationProvider navigation={navigation}>
				<div className="tab-container">
					<NavLink name="login-otp" className="link-item">OTP</NavLink>
					<NavLink name="login-password" className="link-item">PASSWORD</NavLink>
					<NavLink name="login-confirm" className="link-item">CONFIRM</NavLink>
					<NavLink name="temp" className="link-item">TEMP</NavLink>
					<div className="link-item" onClick={() => restoreSnapshot(soupe, defaultState)}>Reset</div>
				</div>
				<Experiment name="login">
					<Variant name="user-a">
						<Route name="login-otp" path="/otp/">
							<div className="App">
								<BundleA/>
							</div>
						</Route>
						<Route name="login-password" path="/password/">
							<div className="App">
								<BundleB/>
							</div>
						</Route>
						<Route name="login-confirm" path="/confirm/">
							<div className="App">
								<BundleC/>
							</div>
						</Route>
					</Variant>
				</Experiment>
				<Route name="temp" path="/temp/salam/">
					<div className="App">
						<BundleC/>
					</div>
				</Route>
			</NavigationProvider>
		</SoupeProvider>
	</StrictMode>,
	document.getElementById('root')
);
register();
