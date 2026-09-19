'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ChevronsUpDownIcon,
  LanguagesIcon,
  LogOutIcon,
  StoreIcon,
  UserIcon,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { ROLE_HOME } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CurrentUser } from '@/lib/auth/dal';

export function UserMenu({ user }: { user: CurrentUser }) {
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const tRoles = useTranslations('Roles');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 rounded-xl px-2 py-1.5"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {tRoles(user.role)}
            </span>
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {tCommon('role')} &middot; {tRoles(user.role)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={ROLE_HOME[user.role] ?? '/'}>
            <DropdownMenuItem>
              <UserIcon className="h-4 w-4" />
              {t('profile')}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <StoreIcon className="h-4 w-4" />
            {t('siteSettings')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LanguagesIcon className="h-4 w-4" />
            {t('language')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={logout}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="w-full justify-start"
          >
            <LogOutIcon className="h-4 w-4" />
            {t('logout')}
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}