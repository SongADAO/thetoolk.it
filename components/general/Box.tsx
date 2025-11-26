import { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function Box({ children }: Readonly<Props>) {
  return (
    <section className="bg-gray-25 mx-auto w-full border border-gray-400 border-r-black border-b-black shadow-sm contain-paint">
      {children}
    </section>
  );
}

export { Box };
