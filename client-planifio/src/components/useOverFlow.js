import { useState, useEffect, useRef } from "react";

export default function useOverflow() {
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;
      const hasOverflow =
        containerRef.current.scrollWidth > containerRef.current.clientWidth;
      setIsOverflowing(hasOverflow);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return { isOverflowing, containerRef };
}