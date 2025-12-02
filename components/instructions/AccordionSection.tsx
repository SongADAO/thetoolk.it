import type { ReactNode } from "react";
import { FaAngleDown } from "react-icons/fa6";

interface AccordionSectionProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}

function AccordionSection({
  title,
  children,
  isOpen,
  onToggle,
}: AccordionSectionProps) {
  return (
    <section className="mb-4">
      <button
        className="flex w-full items-center justify-between rounded-t-xs border border-gray-300 bg-gray-100 p-4 text-left hover:bg-gray-200"
        onClick={onToggle}
        type="button"
      >
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <span
          className="transform text-2xl text-gray-600 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <FaAngleDown />
        </span>
      </button>
      {isOpen ? (
        <div className="rounded-b-xs border-x border-b border-gray-300 bg-white p-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export { AccordionSection };
