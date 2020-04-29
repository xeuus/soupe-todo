import {Bean, Observable, Order, Pick, Timer, Wired} from "soupe";

@Bean
@Order(10)
export class ServiceA {
	@Observable
	hello: number = 10;
}


@Bean
@Order(22)
export class ServiceB {
	@Wired serviceA = Pick(ServiceA);
	@Observable hello: number = 10;
	@Timer(10)
	update = (date: Date) => {
		const a = Date.now() - date.getTime();
		this.hello++;
		if (a >= 1000) {
			return false;
		}
	}
}
