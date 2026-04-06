import { useState } from 'react';

export default function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-flex ml-1">
      <button
        type="button"
        className="w-3.5 h-3.5 rounded-full border border-current opacity-40 hover:opacity-80 transition-opacity
                   inline-flex items-center justify-center text-[8px] font-bold leading-none cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((s) => !s)}
      >
        i
      </button>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5
                         bg-neutral-900 text-neutral-200 text-[10px] leading-snug
                         rounded-lg px-2.5 py-1.5 whitespace-normal w-52 shadow-lg
                         pointer-events-none font-normal normal-case tracking-normal">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
        </span>
      )}
    </span>
  );
}
