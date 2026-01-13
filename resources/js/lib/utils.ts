import { type InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function isSameUrl(
    currentPath: string,
    href: NonNullable<InertiaLinkProps['href']>,
): boolean {
    const resolvedHref = resolveUrl(href);
    return currentPath === resolvedHref;
}
