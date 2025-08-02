import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface DynamicTooltipProps {
  x: number;
  y: number;
  children: ReactNode;
  visible: boolean;
  forcedOnTop?: boolean;
  forceOnLeft?: boolean;
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({
  x,
  y,
  children,
  visible,
  forcedOnTop = false,
  forceOnLeft = false,
}) => {
  const [position, setPosition] = useState({
    top: `${y + 5}px`,
    left: `${x + 5}px`,
    right: "auto",
    bottom: "auto",
  });

  useEffect(() => {
    if (!visible) return;

    // Calculate the best position for the tooltip
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // We need to check where there's more space
    // First render it, then measure it in the next frame
    setTimeout(() => {
      const tooltipEl = document.querySelector(
        ".dynamic-tooltip"
      ) as HTMLElement;
      if (!tooltipEl) return;

      const tooltipWidth = tooltipEl.offsetWidth;
      const tooltipHeight = tooltipEl.offsetHeight;

      // Check if tooltip goes outside the window on right side
      const exceedsRight = x + tooltipWidth + 100 > windowWidth;
      // Check if tooltip goes outside the window on bottom
      const exceedsBottom = y + tooltipHeight + 250 > windowHeight;

      // If both forceOnLeft and forcedOnTop are true, position to the top-left
      if (forceOnLeft && forcedOnTop) {
        setPosition({
          top: `${y - tooltipHeight - 20}px`,
          left: `${x - tooltipWidth - 20}px`,
          right: "auto",
          bottom: "auto",
        });
      }
      // If forceOnLeft is true, always position to the left of the cursor
      else if (forceOnLeft) {
        setPosition({
          top: exceedsBottom ? `${y - tooltipHeight - 20}px` : `${y + 20}px`,
          left: `${x - tooltipWidth - 20}px`,
          right: "auto",
          bottom: "auto",
        });
      }
      // If forcedOnTop is true, always position above regardless of available space
      else if (forcedOnTop) {
        setPosition({
          top: `${y - tooltipHeight - 20}px`,
          left: exceedsRight ? `${x - tooltipWidth - 20}px` : `${x + 20}px`,
          right: "auto",
          bottom: "auto",
        });
      }
      // Set position based on available space
      else if (exceedsRight && exceedsBottom) {
        // Position tooltip to the top-left (above and to the left of cursor)
        setPosition({
          top: `${y - tooltipHeight - 20}px`,
          left: `${x - tooltipWidth - 20}px`,
          right: "auto",
          bottom: "auto",
        });
      } else if (exceedsRight) {
        // Position tooltip to the left of cursor
        setPosition({
          top: `${y + 20}px`,
          left: `${x - tooltipWidth - 20}px`,
          right: "auto",
          bottom: "auto",
        });
      } else if (exceedsBottom) {
        // Position tooltip above the cursor
        setPosition({
          top: `${y - tooltipHeight - 20}px`,
          left: `${x + 20}px`,
          right: "auto",
          bottom: "auto",
        });
      } else {
        // Default position (below and to the right of cursor)
        setPosition({
          top: `${y + 20}px`,
          left: `${x + 20}px`,
          right: "auto",
          bottom: "auto",
        });
      }
    }, 10); // Slightly increased timeout for more reliable rendering
  }, [x, y, visible, forcedOnTop, forceOnLeft]);

  if (!visible) return null;

  return (
    <div
      className="absolute bg-white p-2 rounded shadow-md border border-gray-300 z-10 text-xs dynamic-tooltip"
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
        maxWidth: "300px",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

export default DynamicTooltip;