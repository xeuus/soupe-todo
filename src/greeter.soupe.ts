import {Bean, delay, leading, observable, pick, Service, timer, wired} from "react-soa";
import {Nav} from "ab-nav";
import {persisted} from "soa-persist";
import {Net} from "./net.soupe";

@Bean
export class Router extends Service {
	navigation: Nav = null;
}

@Bean
export class ServiceA extends Service {
	@wired net = pick(Net);
	@persisted @observable hello: number = 0;

	created() {
		// this.net.mockGET('/v1/stat/active-cities', (request, response) => response.json([2,3,4]));
		this.net.MIDDLEWARE('hello', request => ({
			...request,
			headers: {
				...request.headers,
				'hello': 'world',
			}
		}))
	}

	async whatTheFuck() {
		await delay(200);
		this.hello++;
	}
}

@Bean
export class ServiceB extends Service {
	@wired net = pick(Net);
	@persisted @observable hello: number = 0;

	@timer(1, {count: 10, single: true, stopped: true}) update = () => {
		this.hello += 100;
	};

	run = () => {
		this.startTimer(this.update);
	};

	async whatTheFuck() {
		console.log(await this.net.GET('/v1/stat/active-cities'));
		this.run();
	}
}


@Bean
export class ServiceC extends Service {
	@persisted @observable hello: number = 0;

	messageReceived(hello: any) {
		this.hello++;
	}
}

@Bean
export class ServiceD extends Service {
	@wired router = pick(Router);
	@wired net = pick(Net);

	@leading(500)
	change = async () => {
		console.log(await this.net.GET('/v1/stat/active-cities'));
		this.broadcast('message broker');
		await this.invokeParallel('whatTheFuck', 'aryan')
	};
}