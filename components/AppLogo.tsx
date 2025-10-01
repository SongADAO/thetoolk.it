import Link from "next/link";

function AppLogo() {
  return (
    <Link
      className="text-xl font-bold hover:text-blue-600"
      href="/"
      title="Home"
    >
      TheToolk.it
    </Link>
  );
}

export { AppLogo };
