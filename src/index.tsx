import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import * as serviceWorker from './service-worker';
import './greeter.soupe';
import {createContainer, SoupeProvider} from "soupe";

const container = createContainer();

ReactDOM.render(
	<StrictMode>
		<SoupeProvider container={container}>
			<App/>
		</SoupeProvider>
	</StrictMode>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
