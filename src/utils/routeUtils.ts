import { apiVersion as version } from "../config/config";

export const makeApiRoute = (path: string, apiVersion?: string) => {
  return `${apiVersion || version}${path}`;
};
