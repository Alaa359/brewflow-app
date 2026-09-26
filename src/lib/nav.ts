import type { LucideIcon } from 'lucide-react';
import {
  BarChart3Icon,
  CalendarClockIcon,
  ChefHatIcon,
  CookingPotIcon,
  Grid3x3Icon,
  HistoryIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  StoreIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from 'lucide-react';
import type { Role } from '@/generated/client';

export type NavItem = {
  href: string;
  key: string;
  roles: Role[];
  icon: LucideIcon;
};

export type NavSection = { sectionKey: string; items: NavItem[] };

const OPERATIONS: NavItem[] = [
  { href: '/caisse', key: 'salleHome', roles: ['SERVER'] as Role[], icon: HomeIcon },
  { href: '/caisse/pos', key: 'pos', roles: ['ADMIN', 'SERVER'] as Role[], icon: ShoppingCartIcon },
  { href: '/cuisine', key: 'kitchenHome', roles: ['KITCHEN'] as Role[], icon: ChefHatIcon },
  { href: '/cuisine/kds', key: 'kds', roles: ['KITCHEN', 'ADMIN'] as Role[], icon: CookingPotIcon },
  { href: '/cuisine/historique', key: 'history', roles: ['KITCHEN'] as Role[], icon: HistoryIcon },
  { href: '/tables', key: 'tables', roles: ['ADMIN', 'SERVER'] as Role[], icon: Grid3x3Icon },
];

const MANAGEMENT: NavItem[] = [
  { href: '/accueil', key: 'accueil', roles: ['ADMIN'] as Role[], icon: HomeIcon },
  { href: '/dashboard', key: 'dashboard', roles: ['ADMIN'] as Role[], icon: LayoutDashboardIcon },
  { href: '/rapports', key: 'reports', roles: ['ADMIN'] as Role[], icon: BarChart3Icon },
  { href: '/ingredients', key: 'ingredients', roles: ['ADMIN'] as Role[], icon: PackageIcon },
  { href: '/plats', key: 'dishes', roles: ['ADMIN'] as Role[], icon: UtensilsCrossedIcon },
  { href: '/planning', key: 'planning', roles: ['ADMIN', 'SERVER', 'KITCHEN'] as Role[], icon: CalendarClockIcon },
  { href: '/employes', key: 'employees', roles: ['ADMIN'] as Role[], icon: UsersIcon },
  { href: '/etablissements', key: 'establishments', roles: ['ADMIN'] as Role[], icon: StoreIcon },
];

export const NAV_GROUPS: NavSection[] = [
  { sectionKey: 'operations', items: OPERATIONS },
  { sectionKey: 'management', items: MANAGEMENT },
];

export function navForRole(role: Role): NavSection[] {
  return NAV_GROUPS.map((group) => ({
    sectionKey: group.sectionKey,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
