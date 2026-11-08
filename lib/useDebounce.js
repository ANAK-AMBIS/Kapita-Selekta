"use client";

import { useEffect, useState } from "react";

/* nilai yang baru ikut berubah setelah `delay` ms tanpa perubahan baru */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
