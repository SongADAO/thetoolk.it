import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function BoxSwitches({ children }: Readonly<Props>) {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">{children}</div>
  );
}

export { BoxSwitches };
