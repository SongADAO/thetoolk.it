import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function Box({ children }: Readonly<Props>) {
  return (
    <section className="mx-auto w-full rounded bg-gray-100 contain-paint">
      {children}
    </section>
  );
}

export { Box };
