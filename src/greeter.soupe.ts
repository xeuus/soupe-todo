import {Bean, Observable, Pick, Timer, Wired} from "soupe";
import {Navigation} from "soupe-navigation";
import {Persisted} from "./soupe-persist";

@Bean
export class Router {
	navigation: Navigation = null;
}

@Bean
export class ServiceA {
	@Persisted @Observable hello: number = 0;
}


@Bean
export class ServiceB {
	@Wired serviceA = Pick(ServiceA);
	@Observable hello: number = 0;
	@Timer(20)
	update = (date: Date) => {
		const a = Date.now() - date.getTime();
		this.hello++;
		if (a > 200) {
			return false;
		}
	}
}


@Bean
export class ServiceC {
	@Persisted @Observable hello: number = 0;
}
