import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function Box({ children }: Readonly<Props>) {
  return (
    <section className="mx-auto w-full rounded-sm border border-gray-400 bg-gray-50 contain-paint">
      {children}
    </section>
  );
}

export { Box };
