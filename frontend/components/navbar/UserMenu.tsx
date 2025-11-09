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
  ArrowRightOnRectangleIcon 
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/hooks/useAuth";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro durante logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.first_name || user.username || "Usuário";
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          aria-label="Menu do usuário"
          className="rounded-lg border-none border-gray-300 dark:border-gray-700 hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
        >
          <Avatar
            size="sm"
            name={userInitials}
            className="cursor-pointer w-5 h-5"
            showFallback
            fallback={<UserIcon className="h-4 w-4 dark:text-white" />}
          />
        </Button>
      </DropdownTrigger>
      
      <DropdownMenu aria-label="Menu do usuário" variant="flat">
        <DropdownItem
          key="profile"
          className="h-14 gap-2"
          textValue="Informações do perfil"
        >
          <div className="flex flex-col">
            <p className="font-semibold">{userName}</p>
            <p className="text-small text-default-500">{user.email || user.username}</p>
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
          color="danger"
          startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
          onPress={handleLogout}
        >
          Sair
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}