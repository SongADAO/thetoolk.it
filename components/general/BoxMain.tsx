import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function BoxMain({ children }: Readonly<Props>) {
  return <div className="p-4">{children}</div>;
}

export { BoxMain };
