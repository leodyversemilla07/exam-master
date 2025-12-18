import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import type { PageProps } from "./index";

declare module "@inertiajs/react" {
    export function usePage<
        T extends PageProps = PageProps
    >(): InertiaPageProps<T> & {
        props: T;
    };
}

export {};
