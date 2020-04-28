import React from 'react';
import './app.scss';
import {useService} from "soupe/hook";
import {ServiceA, ServiceB} from "services/greeter.soupe";

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
			<div>Service123</div>
			<div>{a.hello}</div>
			<button onClick={() => a.hello++}>add</button>
		</header>
	);
}

function App() {
	return (
		<div className="App">
			<BundleA/>
			<BundleA/>
			<BundleB/>
			<BundleA/>
			<BundleB/>
		</div>
	);
}

export default App;
