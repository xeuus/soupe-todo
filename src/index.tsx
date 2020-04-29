import React, {StrictMode} from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import {App} from './app';
import {register} from './service-worker';
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
register();
