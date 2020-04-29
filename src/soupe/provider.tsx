import React, {createContext, ReactNode} from "react";
import {config, metadataOf} from "./metadata";

export type Container = {
	services?: any[];
};
export const SoupeContext = createContext<Container>({} as Container);
export const SoupeConsumer = SoupeContext.Consumer;

export function SoupeProvider(props: { soupe: Container; children: ReactNode }) {
    return (
        <SoupeContext.Provider value={props.soupe}>
            {props.children}
        </SoupeContext.Provider>
    );
}

export function createSoupe(services?: any): Container {
    if (!!services) {
        const cache: any = {};
        services.keys().forEach((key: any) => cache[key] = services(key));
    }
    const container: Container = {};
    container.services = config.services.map(cls => Object.create(cls.prototype));
    for (let i = 0; i < container.services.length; i++) {
        singletonService(container, container.services[i]);
    }
    return container;
}

function singletonService(container: Container, service: any) {
    const {bus, observables = [], timers = [], wired = []} = metadataOf(service);
    Object.defineProperty(service, '__context__', {
        value: container,
        configurable: false,
        enumerable: false,
        writable: false,
    });
    service.constructor(container);
    wired.forEach(data => {
        const {id} = metadataOf(service[data.key].prototype);
        service[data.key] = container.services[id];
    });
    timers.forEach((data, i) => {
        const {key, ms, options} = data;
        let timer: any = null;
        let startDate: Date = null;

        function recall() {
            timer = setTimeout(() => {
                const response = service[key].call(service, startDate);
                if (response !== false)
                    recall();
            }, ms)
        }

        Object.defineProperty(service[key], 'stop', {
            writable: false,
            enumerable: true,
            value: function () {
                clearTimeout(timer);
            },
            configurable: true,
        });

        Object.defineProperty(service[key], 'start', {
            writable: false,
            enumerable: true,
            value: function () {

                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                startDate = new Date();
                recall();
            },
            configurable: true,
        });
        if (!options || options.immediate) {
            startDate = new Date();
            recall();
        }
    });

    observables.forEach((data: any) => {
        const {key} = data;
        const alias = `$$${key}`;
        Object.defineProperty(service, alias, {
            configurable: true,
            writable: false,
            enumerable: false,
            value: service[key],
        });
        Object.defineProperty(service, key, {
            configurable: true,
            enumerable: true,
            get: () => {
                return service[alias];
            },
            set: (value: any) => {
                if (service[alias] !== value) {
                    Object.defineProperty(service, alias, {
                        configurable: true,
                        writable: false,
                        enumerable: false,
                        value: value,
                    });
                    bus.dispatch(key, value);
                }
            }
        });
    });
}
