import Link from "next/link";

import { AppHeaderUser } from "@/components/AppHeaderUser";

function AppHeader() {
  return (
    <div className="flex items-center justify-between bg-gray-200 p-2">
      <h1>
        <Link href="/" title="Home">
          TheToolk.it
        </Link>
      </h1>
      <AppHeaderUser />
    </div>
  );
}

export { AppHeader };
