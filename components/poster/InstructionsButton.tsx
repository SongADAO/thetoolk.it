import { FaCircleQuestion } from "react-icons/fa6";

import { LinkButtonMenu } from "@/components/general/LinkButtonMenu";

function InstructionsButton() {
  return (
    <LinkButtonMenu
      href="/instructions/free"
      target="_blank"
      title="Instructions"
    >
      <FaCircleQuestion className="size-6" />
    </LinkButtonMenu>
  );
}

export { InstructionsButton };
