"use client";

import { usePathname, useRouter } from "next/navigation";
import { use } from "react";
import {
  FaGear,
  FaPenToSquare,
  FaRightFromBracket,
  FaRightToBracket,
} from "react-icons/fa6";

import { ButtonMenu } from "@/components/general/ButtonMenu";
import { LinkButtonMenu } from "@/components/general/LinkButtonMenu";
import { AuthContext } from "@/contexts/AuthContext";

function AppHeaderUser() {
  const { user, signOut } = use(AuthContext);
  const pathname = usePathname();

  const router = useRouter();

  async function handleSignOut(): Promise<void> {
    await signOut("local");
    router.push("/auth/signin");
  }

  if (!user) {
    return (
      <div className="flex flex-row items-end gap-2">
        <LinkButtonMenu
          href="/auth/signin"
          isActive={pathname === "/auth/signin"}
          title="Sign In"
        >
          <FaRightToBracket className="size-6" />
          Sign in
        </LinkButtonMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-end gap-2">
      <LinkButtonMenu
        href="/pro"
        isActive={pathname === "/pro"}
        title="Create a Post"
      >
        <FaPenToSquare className="size-6" />
        Post
      </LinkButtonMenu>
      <LinkButtonMenu
        href="/account"
        isActive={pathname === "/account"}
        title="Manage Account"
      >
        <FaGear className="size-6" />
      </LinkButtonMenu>
      <ButtonMenu onClick={handleSignOut} title="Sign out" type="button">
        <FaRightFromBracket className="size-6" />
      </ButtonMenu>
    </div>
  );
}

export { AppHeaderUser };
