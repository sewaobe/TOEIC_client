import { ComponentType } from 'react';

export interface AppRoute {
  path: string;
  element: ComponentType;
  guard?: ComponentType;
}

const privateRoutes: AppRoute[] = [];

export default privateRoutes;
