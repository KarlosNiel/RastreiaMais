"use client";

import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SystemSettingsModal } from "@/components/user/SystemSettingsModal";
import { UserProfileModal } from "@/components/user/UserProfileModal";
import { MeResponse } from "@/lib/auth";
import { useAuth } from "@/lib/hooks/useAuth";

interface UserMenuProps {
  user: MeResponse["user"] | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch {
      // fallback
    }
  };

  if (!user) {
    return null;
  }

  const userName = user.first_name || user.username || "Usuário";

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger className="bg-transparent">
          <Button
            isIconOnly
            aria-label="Menu do usuário"
            className="rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-colors"
            size="sm"
            variant="light"
          >
            <UserIcon
              className="size-5 text-gray-700 dark:text-white"
              strokeWidth={2}
            />
          </Button>
        </DropdownTrigger>

        <DropdownMenu aria-label="Menu do usuário" variant="flat">
          <DropdownItem
            key="profile-header"
            isReadOnly
            className="h-14 gap-2 opacity-100 cursor-default data-[hover=true]:bg-transparent"
            textValue="Informações do perfil"
          >
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-foreground">
                {userName}
              </p>
              <p className="text-xs text-foreground-500">
                {user.email || user.username}
              </p>
            </div>
          </DropdownItem>

          <DropdownItem
            key="view-profile"
            startContent={<UserIcon className="h-4 w-4" />}
            onPress={() => setIsProfileOpen(true)}
          >
            Ver Perfil
          </DropdownItem>

          <DropdownItem
            key="settings"
            startContent={<Cog6ToothIcon className="h-4 w-4" />}
            onPress={() => setIsSettingsOpen(true)}
          >
            Configurações
          </DropdownItem>

          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
            onPress={handleLogout}
          >
            Sair
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
