export function px(value: number): string {
    return `${value}px`;
}

export function arrayShallowEquals<T>(a: readonly T[], b: readonly T[]): boolean {
    return a.length === b.length && a.every((item, index) => item === b[index]);
}
