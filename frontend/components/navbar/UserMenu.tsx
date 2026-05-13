"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Avatar,
} from "@heroui/react";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/auth";
import { MeResponse } from "@/lib/auth";

interface UserMenuProps {
  user: MeResponse["user"] | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro durante logout:", error);
    }
  };

  if (!user) {
    return null;
  }

  const userName = user.first_name || user.username || "Usuário";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger className="bg-transparent">
        <Button
          isIconOnly
          aria-label="Menu do usuário"
          className="rounded-lg border-none border-gray-300 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
          size="sm"
          variant="light"
        >
          <UserIcon className="size-5 text-gray-700 dark:text-white" strokeWidth={2} />
        </Button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Menu do usuário" variant="flat">
        <DropdownItem
          key="profile"
          isReadOnly
          className="h-14 gap-2 opacity-100 cursor-default data-[hover=true]:bg-transparent"
          textValue="Informações do perfil"
        >
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground">{userName}</p>
            <p className="text-xs text-foreground-500">
              {user.email || user.username}
            </p>
          </div>
        </DropdownItem>

        <DropdownItem
          key="view-profile"
          startContent={<UserIcon className="h-4 w-4" />}
        >
          Ver Perfil
        </DropdownItem>

        <DropdownItem
          key="settings"
          startContent={<Cog6ToothIcon className="h-4 w-4" />}
        >
          Configurações
        </DropdownItem>

        <DropdownItem
          key="logout"
          startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
          onPress={handleLogout}
        >
          Sair
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
