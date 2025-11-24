"use client";

import { Button } from "@heroui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/lib/auth";

interface LogoutButtonProps {
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = "light",
  size = "md",
  showIcon = true,
  showText = true,
  className = "",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro durante logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={className}
      isLoading={isLoading}
      size={size}
      startContent={
        showIcon && !isLoading ? (
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
        ) : null
      }
      variant={variant}
      onPress={handleLogout}
    >
      {showText && "Sair"}
    </Button>
  );
}
