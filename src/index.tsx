import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import * as serviceWorker from './service-worker';
import {createContainer, SoupeProvider} from "soupe";

const container = createContainer(require.context('.', true, /\.soupe\.ts$/));
ReactDOM.render(
	<React.StrictMode>
		<SoupeProvider container={container}>
			<App/>
		</SoupeProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

serviceWorker.register();
