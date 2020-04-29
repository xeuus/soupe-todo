import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import {register} from './service-worker';
import {createSoupe, SoupeProvider} from "soupe";
import {createNavigation, Experiment, NavigationProvider, Route, Variant} from "soupe-navigation";
import './index.sass';
import './greeter.soupe';

import {createBrowserHistory} from "history";

const history = createBrowserHistory();
const soupe = createSoupe();
const navigation = createNavigation(history);
navigation.default = 'home';
ReactDOM.render(
	<StrictMode>
		<SoupeProvider soupe={soupe}>
			<NavigationProvider navigation={navigation}>
				<div className="tab-container">
					<div className="item" onClick={() => {
						navigation.goto('home', {name: 'hello'});
					}}>
						Home
					</div>
					<div className="item" onClick={() => {
						navigation.goto('add-bill', {name: 'jake'});
					}}>
						Help
					</div>
					<div className="item" onClick={() => {
						navigation.goto('calendar', {ok: 'why'});
					}}>
						Calendar
					</div>
					<div className="item" onClick={() => {
						navigation.goto('login-otp', {temp: 6685});
					}}>
						Otp
					</div>
					<div className="item" onClick={() => {
						navigation.goto('temp', {temp: 6685});
					}}>
						Temp
					</div>
				</div>
				<Experiment name="login">
					<Variant name="user-a">
						<Route name="login-otp" path="/otp/">
							<div className="App">
								a: hello from otp
								<button onClick={() => {
									navigation.replace('login-otp', {hello: 22});
								}}>
									meke fun
								</button>
							</div>
						</Route>
						<Route name="login-password" path="/password/">
							<div className="App">
								a: hello from password
							</div>
						</Route>
						<Route name="login-confirm" path="/confirm/">
							<div className="App">
								a: hello from confirm
							</div>
						</Route>
					</Variant>
					<Variant name="user-b">
						<Route name="login-otp" path="/otp/">
							<div className="App">
								b: hello from otp
							</div>
						</Route>
						<Route name="login-password" path="/password/">
							<div className="App">
								b: hello from password
							</div>
						</Route>
						<Route name="login-confirm" path="/confirm/">
							<div className="App">
								b: hello from confirm
							</div>
						</Route>
					</Variant>
				</Experiment>
				<Experiment name="home">
					<Route name="home" path="/">
						<div className="App">
							home page
						</div>
					</Route>
					<Route name="add-bill" path="/add-bill/">
						<div className="App">
							add bill
						</div>
					</Route>
					<Route name="calendar" path="/calendar/">
						<div className="App">
							calendar
						</div>
					</Route>
				</Experiment>

				<Route name="temp" path="/temp/salam/">
					<div className="App">
						temp
					</div>
				</Route>
			</NavigationProvider>
		</SoupeProvider>
	</StrictMode>,
	document.getElementById('root')
);
register();
