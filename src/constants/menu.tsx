import { IconDashboard } from '@tabler/icons-react';

export type MenuItem = {
  text: string;
  path: string;
  icon?: JSX.Element;
  betaIcon?: JSX.Element;
  tourId?: string;
};

export const MenuItems: MenuItem[] = [
  {
    text: 'Variables',
    path: '/config/variables',
    icon: <IconDashboard />
  }
];
