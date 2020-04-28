import {Bean, Observable, Order, Pick, Timer} from "soupe/annotations";

@Bean
@Order(10)
export class ServiceA {
	@Observable
	hello: number = 10;

	created() {

	}
}


@Bean
@Order(22)
export class ServiceB {

	b = Pick(ServiceB, this);

	@Observable
	hello: number = 10;

	@Timer(1000)
	update = (date: Date) => {
		console.log(this.b)
		const a = Date.now() - date.getTime();
		this.hello++;
		if (a > 10000) {
			return false;
		}
	}
}
