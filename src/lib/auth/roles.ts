export const ROLE_HOME: Record<string, string> = {
  ADMIN: '/dashboard',
  SERVER: '/caisse',
  KITCHEN: '/cuisine',
};

export function roleHome(role: string): string {
  return ROLE_HOME[role] ?? '/';
}
