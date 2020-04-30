import React, {PureComponent, StrictMode} from 'react';
import ReactDOM from 'react-dom';
import {createSoa, Observer, pick, SoaProvider, useService, wired} from "react-soa";
import {createNav, Experiment, NavProvider, NavLink, Route, Variant} from "ab-nav";
import {automaticPersist, getSnapshot, restoreSnapshot} from "soa-persist/provider";
import {Router, ServiceA, ServiceB, ServiceC, ServiceD} from "./greeter.soupe";
import {createHashHistory} from "history";
import {register} from './service-worker';

import './index.sass';
import './greeter.soupe';
import './net.soupe';

const history = createHashHistory();
const soupe = createSoa();
const defaultState = getSnapshot(soupe);
automaticPersist(soupe, localStorage.getItem('data'), (data) => localStorage.setItem('data', data));
const navigation = soupe.pick(Router).navigation = createNav(history, {default: 'login-otp'});


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
		<button onClick={a.run}>
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

@Observer([ServiceB]) export class BundleD extends PureComponent {
	@wired svcB = pick(ServiceB);
	@wired svc = pick(ServiceD);

	render() {
		return (
			<button onClick={this.svc.change}>
				go back {this.svcB.hello}
			</button>
		)
	}
}

ReactDOM.render(
	<StrictMode>
		<SoaProvider soa={soupe}>
			<NavProvider navigation={navigation}>
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
						<BundleD/>
					</div>
				</Route>
			</NavProvider>
		</SoaProvider>
	</StrictMode>,
	document.getElementById('root')
);

register();
