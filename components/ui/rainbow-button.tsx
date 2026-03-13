import React from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function RainbowButton({
  children,
  className,
  ...props
}: RainbowButtonProps) {
  return (
    <>
      <style>{`
        :root {
          --rainbow-1: hsl(0, 100%, 63%);
          --rainbow-2: hsl(270, 100%, 63%);
          --rainbow-3: hsl(210, 100%, 63%);
          --rainbow-4: hsl(195, 100%, 63%);
          --rainbow-5: hsl(90, 100%, 63%);
        }
        
        .magic-rainbow-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 1.5rem;
          padding: 0.5rem 2rem;
          font-weight: bold;
          color: white;
          background: linear-gradient(#121213, #121213) padding-box,
                      linear-gradient(90deg, var(--rainbow-1), var(--rainbow-5), var(--rainbow-3), var(--rainbow-4), var(--rainbow-2)) border-box;
          border: 1px solid transparent;
          background-size: 200% auto;
          animation: rainbow-border 3s linear infinite;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .magic-rainbow-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(0, 196, 204, 0.3);
        }

        .magic-rainbow-btn:active {
          transform: scale(0.95);
        }

        .magic-rainbow-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(90deg, var(--rainbow-1), var(--rainbow-5), var(--rainbow-3), var(--rainbow-4), var(--rainbow-2));
          background-size: 200% auto;
          animation: rainbow-border 3s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .magic-rainbow-btn::after {
          content: "";
          position: absolute;
          inset: -10px;
          z-index: -1;
          background: linear-gradient(90deg, var(--rainbow-1), var(--rainbow-5), var(--rainbow-3), var(--rainbow-4), var(--rainbow-2));
          background-size: 200% auto;
          filter: blur(15px);
          opacity: 0.3;
          border-radius: inherit;
          animation: rainbow-border 3s linear infinite;
        }

        @keyframes rainbow-border {
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
      <button
        className={cn("magic-rainbow-btn", className)}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    </>
  );
}
