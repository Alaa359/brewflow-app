export type AppNotification = {
  id: string;
  kind: 'order' | 'stock';
  titleKey: string;
  params?: Record<string, string | number>;
  href: string;
  createdAt: string;
};
