import React from 'react';

import './app.scss';
import {startTimer, useService} from "./soupe";
import {ServiceA, ServiceB} from "./greeter.soupe";

const logo = require('./logo.svg');

function BundleA() {
	const a = useService(ServiceA);
	return (
		<header className="app-header">
			<div>Service</div>
			<div>{a.hello}</div>
			<button onClick={() => a.hello++}>add</button>
		</header>
	);
}

function BundleB() {
	const a = useService(ServiceB);
	return (
		<header className="app-header">
			<div>Service</div>
			<div>{a.hello}</div>
			<button onClick={() => startTimer(a.update)}>add</button>
		</header>
	);
}

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo"/>
				<BundleA/>
				<BundleB/>
				<p>
					Edit <code>src/App.tsx</code> and save to reload.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
