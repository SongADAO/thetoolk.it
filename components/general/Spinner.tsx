interface Props {
  color?: string;
  opacity?: number;
  size?: number | string;
}

function Spinner({
  color = "white",
  opacity = 100,
  size = 5,
}: Readonly<Props>) {
  return (
    <svg
      className="data-[color=primary]:text-body size-5 animate-spin text-white data-[color=black]:text-black data-[opacity=25]:opacity-25 data-[size=20px]:size-5 data-[size=4]:size-4 data-[size=8]:size-8 motion-reduce:hidden"
      data-color={color}
      data-opacity={opacity}
      data-size={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}

export { Spinner };
