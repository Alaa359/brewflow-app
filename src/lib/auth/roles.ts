export const ROLE_HOME: Record<string, string> = {
  ADMIN: '/dashboard',
  SERVER: '/caisse',
  KITCHEN: '/cuisine',
};

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  SERVER: 'Serveur',
  KITCHEN: 'Cuisinier',
};

export function roleHome(role: string): string {
  return ROLE_HOME[role] ?? '/';
}
