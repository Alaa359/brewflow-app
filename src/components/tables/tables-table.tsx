'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Trash2Icon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DishThumb } from '@/components/ui/dish-thumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createTable,
  deleteTable,
  regenerateQr,
  updateTable,
} from '@/actions/tables';
import { TableForm } from '@/components/tables/table-form';
import { TableQr } from '@/components/tables/table-qr';
import { formatCost } from '@/lib/ingredients';

export type TableListRow = {
  id: string;
  number: number;
  zone: string | null;
  qrCode: string | null;
  orderCount: number;
};

export type TableMenuCategory = { id: string; name: string };

export type TableMenuDish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
};

const ALL_ZONES = '__all__';
const ALL_CATEGORIES = '__all_cats__';

type ViewMode = 'tables' | 'menu';

export function TablesTable({
  tables,
  categories,
  dishes,
  establishmentName,
  error,
  readOnly = false,
}: {
  tables: TableListRow[];
  categories: TableMenuCategory[];
  dishes: TableMenuDish[];
  establishmentName: string;
  error?: string;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('Tables');
  const tCommon = useTranslations('Common');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TableListRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TableListRow | null>(null);
  const [qrTarget, setQrTarget] = useState<TableListRow | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>(ALL_ZONES);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tables');
  const [previewTableId, setPreviewTableId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL_CATEGORIES);

  const deleteOpen =
    deleteTarget !== null &&
    tables.some((table) => table.id === deleteTarget.id);
  const qrRow = qrTarget
    ? (tables.find((table) => table.id === qrTarget.id) ?? null)
    : null;

  const errorMessage =
    error === 'commandes'
      ? t('error.hasOrders')
      : error === 'introuvable'
        ? t('error.notFound')
        : undefined;

  const zones = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((table) => {
      if (table.zone) set.add(table.zone);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tables]);

  const zoneCounts = useMemo(() => {
    const counts = new Map<string, number>();
    tables.forEach((table) => {
      const key = table.zone || t('noZone');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [tables, t]);

  const filteredTables = useMemo(() => {
    if (zoneFilter === ALL_ZONES) return tables;
    if (zoneFilter === t('noZone')) {
      return tables.filter((table) => !table.zone);
    }
    return tables.filter((table) => table.zone === zoneFilter);
  }, [tables, zoneFilter, t]);

  const occupiedCount = tables.filter((table) => table.orderCount > 0).length;
  const activeOrders = tables.reduce((sum, table) => sum + table.orderCount, 0);

  const previewTable =
    tables.find((table) => table.id === previewTableId) ??
    tables.find((table) => table.orderCount > 0) ??
    tables[0] ??
    null;

  const previewDishes = useMemo(() => {
    if (activeCategoryId === ALL_CATEGORIES) return dishes;
    return dishes.filter((dish) => dish.categoryId === activeCategoryId);
  }, [dishes, activeCategoryId]);

  function showToast(message: string) {
    setToastMsg(message);
    window.setTimeout(() => setToastMsg(null), 2600);
  }

  function openMenuPreview(table: TableListRow) {
    setPreviewTableId(table.id);
    setActiveCategoryId(ALL_CATEGORIES);
    setViewMode('menu');
    setQrTarget(null);
  }

  function zonePillClass(active: boolean) {
    return active
      ? 'px-4 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold transition-colors shadow-sm'
      : 'zone-pill px-4 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md font-medium transition-colors';
  }

  function viewBtnClass(active: boolean) {
    return active
      ? 'flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
      : 'flex items-center gap-2 px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium transition-all';
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {t('title')}
            </h1>
            <span className="font-label-caps text-label-caps px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              {establishmentName}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            {t('subtitle', { count: tables.length, name: establishmentName })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex p-1 rounded-xl bg-surface-container shadow-sm">
            <button
              type="button"
              className={viewBtnClass(viewMode === 'tables')}
              onClick={() => setViewMode('tables')}
            >
              <span className="material-symbols-outlined text-[18px]">
                table_bar
              </span>
              <span>{t('views.tables')}</span>
            </button>
            <button
              type="button"
              className={viewBtnClass(viewMode === 'menu')}
              onClick={() => {
                if (!previewTable && tables.length > 0) {
                  setPreviewTableId(tables[0].id);
                }
                setActiveCategoryId(ALL_CATEGORIES);
                setViewMode('menu');
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                menu_book
              </span>
              <span>{t('views.menu')}</span>
            </button>
          </div>

          {!readOnly && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  onClick={() => setCreateOpen(true)}
                >
                  <span className="material-symbols-outlined text-body-md">
                    add
                  </span>
                  <span>{t('addTable')}</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('createDialog.title')}</DialogTitle>
                  <DialogDescription>
                    {t('createDialog.description')}
                  </DialogDescription>
                </DialogHeader>
                <TableForm
                  action={createTable}
                  onSuccess={() => setCreateOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-error-container text-on-error-container relative rounded-xl border border-outline-variant/40 px-4 py-3 pe-11 text-sm font-body-md">
          {errorMessage}
          <Button
            variant="ghost"
            size="icon"
            className="absolute end-1.5 top-1/2 -translate-y-1/2"
            onClick={() => router.replace('/tables')}
          >
            <XIcon />
            <span className="sr-only">{tCommon('actions.close')}</span>
          </Button>
        </div>
      )}

      {viewMode === 'tables' ? (
        <>
          {/* Zone pills + stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-surface-container-low shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={zonePillClass(zoneFilter === ALL_ZONES)}
                onClick={() => setZoneFilter(ALL_ZONES)}
              >
                {t('zones.all', { count: tables.length })}
              </button>
              {zones.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  className={zonePillClass(zoneFilter === zone)}
                  onClick={() => setZoneFilter(zone)}
                >
                  {zone} ({zoneCounts.get(zone) ?? 0})
                </button>
              ))}
              {tables.some((table) => !table.zone) && (
                <button
                  type="button"
                  className={zonePillClass(zoneFilter === t('noZone'))}
                  onClick={() => setZoneFilter(t('noZone'))}
                >
                  {t('noZone')} ({zoneCounts.get(t('noZone')) ?? 0})
                </button>
              )}
            </div>
            <div className="flex items-center gap-5 text-on-surface-variant font-label-caps text-label-caps px-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                <span>
                  {t('stats.activeOrders')} :{' '}
                  <strong className="text-on-surface font-label-numeric text-label-numeric font-bold">
                    {activeOrders}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                <span>
                  {t('stats.occupied')} :{' '}
                  <strong className="text-on-surface font-label-numeric text-label-numeric font-bold">
                    {occupiedCount}/{tables.length}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Table listing */}
          <div className="rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 text-on-surface-variant font-label-md text-label-md tracking-normal">
                    <th className="py-3.5 px-4 font-semibold">
                      {t('columns.table')}
                    </th>
                    <th className="py-3.5 px-4 font-semibold">
                      {t('columns.zone')}
                    </th>
                    <th className="py-3.5 px-4 font-semibold text-center">
                      {t('columns.orders')}
                    </th>
                    <th className="py-3.5 px-4 font-semibold">
                      {t('columns.qrCode')}
                    </th>
                    {!readOnly && (
                      <th className="py-3.5 px-4 font-semibold text-right">
                        {t('columns.actions')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                  {filteredTables.length === 0 ? (
                    <tr>
                      <td
                        colSpan={readOnly ? 4 : 5}
                        className="text-on-surface-variant h-24 text-center py-4 px-4"
                      >
                        {tables.length === 0 ? t('empty') : t('emptyZone')}
                      </td>
                    </tr>
                  ) : (
                    filteredTables.map((table) => {
                      const occupied = table.orderCount > 0;
                      return (
                        <tr
                          key={table.id}
                          className="group hover:bg-surface-container-low/40 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="material-symbols-outlined text-secondary text-body-lg">
                                {table.zone &&
                                table.zone.toLowerCase().includes('terr')
                                  ? 'deck'
                                  : 'chair'}
                              </span>
                              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                                {t('numberLabel', { number: table.number })}
                              </span>
                              <span
                                className={
                                  occupied
                                    ? 'px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-caps text-[10px] font-bold'
                                    : 'px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-[10px] font-medium'
                                }
                              >
                                {occupied ? t('status.occupied') : t('status.free')}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-on-surface-variant font-medium">
                            {table.zone || '—'}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={
                                occupied
                                  ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-high text-primary font-label-numeric text-label-numeric font-bold shadow-xs'
                                  : 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-container-low text-on-surface-variant font-label-numeric text-label-numeric'
                              }
                            >
                              {table.orderCount}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {table.qrCode ? (
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-primary-fixed text-primary hover:text-on-primary-fixed-variant font-label-md text-label-md font-medium transition-all shadow-xs group-hover:shadow-sm"
                                onClick={() => setQrTarget(table)}
                              >
                                <span className="material-symbols-outlined text-body-md text-primary">
                                  qr_code_2
                                </span>
                                <span>{t('viewQr')}</span>
                              </button>
                            ) : !readOnly ? (
                              <form action={regenerateQr.bind(null, table.id)}>
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-all shadow-xs"
                                >
                                  <span className="material-symbols-outlined text-body-md text-primary">
                                    qr_code_2
                                  </span>
                                  <span>{t('generateQr')}</span>
                                </button>
                              </form>
                            ) : (
                              <span className="text-on-surface-variant/70 text-body-sm">
                                —
                              </span>
                            )}
                          </td>
                          {!readOnly && (
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {table.orderCount > 0 && (
                                  <span className="font-body-sm text-[11px] text-on-surface-variant/70 italic hidden lg:inline mr-2">
                                    {t('hasOrders')}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                  title={t('editAria', { number: table.number })}
                                  onClick={() => setEditTarget(table)}
                                >
                                  <span className="material-symbols-outlined text-body-md">
                                    edit
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  className={
                                    table.orderCount > 0
                                      ? 'p-1.5 rounded-lg text-outline-variant/60 cursor-not-allowed'
                                      : 'p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors'
                                  }
                                  disabled={table.orderCount > 0}
                                  title={
                                    table.orderCount > 0
                                      ? t('error.hasOrders')
                                      : t('deleteAria', { number: table.number })
                                  }
                                  onClick={() => setDeleteTarget(table)}
                                >
                                  <span className="material-symbols-outlined text-body-md">
                                    delete
                                  </span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* VIEW: client menu preview */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-surface-container shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-headline-sm">
                  table_restaurant
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {t('preview.title', {
                      number: previewTable?.number ?? '—',
                      zone: previewTable?.zone || t('noZone'),
                    })}
                  </h2>
                  {previewTable && previewTable.orderCount > 0 && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      <span className="font-label-caps text-label-caps text-tertiary font-bold">
                        {t('preview.sessionActive')}
                      </span>
                    </>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('preview.description')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {previewTable?.qrCode && (
                <a
                  href={`/m/${previewTable.qrCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-body-md text-primary">
                    open_in_new
                  </span>
                  <span>{t('openMenu')}</span>
                </a>
              )}
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-colors shadow-sm"
                onClick={() => setViewMode('tables')}
              >
                <span className="material-symbols-outlined text-body-md">
                  arrow_back
                </span>
                <span>{t('preview.back')}</span>
              </button>
            </div>
          </div>

          {tables.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mr-1">
                {t('preview.table')}
              </span>
              {tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  className={
                    previewTable?.id === table.id
                      ? 'px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold shadow-sm'
                      : 'px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-label-md text-label-md font-medium'
                  }
                  onClick={() => setPreviewTableId(table.id)}
                >
                  {table.number}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-surface-container-high">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={
                  activeCategoryId === ALL_CATEGORIES
                    ? 'flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                    : 'flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-all'
                }
                onClick={() => setActiveCategoryId(ALL_CATEGORIES)}
              >
                <span className="material-symbols-outlined text-[17px]">
                  restaurant_menu
                </span>
                <span>{t('preview.allCategories')}</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={
                    activeCategoryId === category.id
                      ? 'flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-semibold shadow-sm transition-all'
                      : 'flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-medium transition-all'
                  }
                  onClick={() => setActiveCategoryId(category.id)}
                >
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-label-caps">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="uppercase tracking-widest text-primary font-bold">
                {activeCategoryId === ALL_CATEGORIES
                  ? t('preview.allCategories')
                  : (categories.find((c) => c.id === activeCategoryId)?.name ??
                    '')}
              </span>
              <span className="opacity-60">
                · {t('preview.dishCount', { count: previewDishes.length })}
              </span>
            </div>
          </div>

          {previewDishes.length === 0 ? (
            <div className="rounded-xl bg-surface-container-lowest shadow-sm p-10 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-outline text-3xl block mb-2">
                restaurant
              </span>
              {t('preview.empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewDishes.map((dish) => {
                const category = categories.find(
                  (c) => c.id === dish.categoryId
                );
                return (
                  <div
                    key={dish.id}
                    className="rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="relative h-40 w-full bg-surface-container-high overflow-hidden">
                      <DishThumb
                        src={dish.imageUrl}
                        alt={dish.name}
                        size="lg"
                        categoryName={category?.name}
                        variant="poster"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      {category && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-label-caps text-white font-bold tracking-wider uppercase">
                          {category.name}
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white gap-2">
                        <div className="min-w-0">
                          <h3 className="font-headline-sm text-headline-sm font-bold leading-tight truncate">
                            {dish.name}
                          </h3>
                          {dish.description && (
                            <p className="font-body-sm text-body-sm text-white/80 line-clamp-1">
                              {dish.description}
                            </p>
                          )}
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-primary-container text-on-primary font-label-numeric text-label-numeric font-bold shadow-sm whitespace-nowrap">
                          {formatCost(dish.price)}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between bg-surface-container-lowest">
                      <span className="inline-flex items-center gap-1 font-label-caps text-[11px] text-tertiary font-semibold">
                        <span className="material-symbols-outlined text-[15px]">
                          check_circle
                        </span>
                        <span>{t('preview.available')}</span>
                      </span>
                      <a
                        href={previewTable?.qrCode ? `/m/${previewTable.qrCode}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all active:scale-95 shadow-xs"
                      >
                        <span>{t('preview.add')}</span>
                        <span className="material-symbols-outlined text-[16px]">
                          add
                        </span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('editDialog.title', { number: editTarget?.number ?? '' })}
            </DialogTitle>
            <DialogDescription>{t('editDialog.description')}</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <TableForm
              key={editTarget.id}
              table={{ number: editTarget.number, zone: editTarget.zone }}
              action={updateTable.bind(null, editTarget.id)}
              onSuccess={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      <Dialog
        open={!!qrRow}
        onOpenChange={(open) => !open && setQrTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('qrDialog.title', { number: qrRow?.number ?? '' })}
              {qrRow?.zone ? ` · ${qrRow.zone}` : ''}
            </DialogTitle>
            <DialogDescription>{t('qrDialog.description')}</DialogDescription>
          </DialogHeader>
          {qrRow?.qrCode && (
            <TableQr token={qrRow.qrCode} onToast={showToast} />
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {qrRow && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-label-md"
                  onClick={() => openMenuPreview(qrRow)}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    menu_book
                  </span>
                  {t('views.menu')}
                </Button>
              )}
              {qrRow && !readOnly && (
                <form action={regenerateQr.bind(null, qrRow.id)}>
                  <Button
                    variant="outline"
                    size="sm"
                    type="submit"
                    className="font-label-md"
                  >
                    {t('regenerateQr')}
                  </Button>
                </form>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary font-label-md"
              onClick={() => window.print()}
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              {t('print')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t('deleteDialog.title', { number: deleteTarget?.number ?? '' })}
            </DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {tCommon('actions.cancel')}
            </Button>
            {deleteTarget && (
              <form action={deleteTable.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  {t('deleteDialog.confirm')}
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed top-24 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl font-label-md text-label-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <span className="material-symbols-outlined text-tertiary-fixed text-body-lg">
            check_circle
          </span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
