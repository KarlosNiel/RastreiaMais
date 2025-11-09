"use client";

import { Button } from "@heroui/react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
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
  className = ""
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
      variant={variant}
      size={size}
      onPress={handleLogout}
      isLoading={isLoading}
      startContent={showIcon && !isLoading ? <ArrowRightOnRectangleIcon className="h-4 w-4" /> : null}
      className={className}
    >
      {showText && "Sair"}
    </Button>
  );
}