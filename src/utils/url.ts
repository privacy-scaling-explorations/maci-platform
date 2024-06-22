export const mergeParams = (prev: object, next: object = {}): string =>
  new URLSearchParams({ ...prev, ...next }).toString();
