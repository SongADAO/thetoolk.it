import Link from "next/link";
import { FaCircleQuestion } from "react-icons/fa6";

function InstructionsButton() {
  return (
    <Link
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-gray-500 p-3 text-white outline-none hover:bg-gray-800 xl:flex"
      href="/instructions"
      target="_blank"
      title="Instructions"
    >
      <FaCircleQuestion className="size-6" />
    </Link>
  );
}

export { InstructionsButton };
