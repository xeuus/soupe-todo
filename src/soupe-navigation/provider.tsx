import React, {createContext, ReactNode} from "react";
import {Container} from "./container";

export const SNavContext = createContext<Container>({} as Container);
export const SNavConsumer = SNavContext.Consumer;

export function SoupeProvider(props: { container: Container; children: ReactNode }) {
    return (
        <SNavContext.Provider value={props.container}>
            {props.children}
        </SNavContext.Provider>
    );
}
