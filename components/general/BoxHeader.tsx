import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function BoxHeader({ children }: Readonly<Props>) {
  return <header className="bg-gray-300 px-4 py-2">{children}</header>;
}

export { BoxHeader };
