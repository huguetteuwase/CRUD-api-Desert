import { validate, version } from 'uuid';

export const isUuidV4 = (id: string) => {
  if (typeof id !== 'string') return false;
  return validate(id) && version(id) === 4;
};
