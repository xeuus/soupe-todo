import {Bean, Order, Ordered, timeout} from "react-soa";
import {HttpRequest, HttpResponse, NetworkingLayer} from "netlayer";


@Bean @Order(Ordered.HIGHEST_PRECEDENCE)
export class Net extends NetworkingLayer {
	baseUrl = '/api';
	timeout = 2000;
	internetDelay = 40;
	defaultDriver = async (request: HttpRequest): Promise<HttpResponse> => {
		const response = await timeout(
			fetch(this.baseUrl + request.url, {
				method: request.method,
				headers: {
					'content-type': 'application/json',
					...request.headers,
				},
				redirect: 'follow',
				body: ['PUT', 'POST'].includes(request.method) ? JSON.stringify(request.payload) : undefined,
			}),
			request.timeout || this.timeout,
			{
				status: 408,
				statusText: 'request timeout',
				payload: {},
			}
		);
		const obj = {
			status: response.status,
			statusText: response.statusText,
			payload: await response.json(),
		};
		if (response.status >= 400) {
			throw obj;
		}
		return obj;
	};
	driver = this.mockDRIVER(this.defaultDriver);
}