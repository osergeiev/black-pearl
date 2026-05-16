'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Toast = { msg: string; color: string };
const Ctx = createContext<{ show: (msg: string, color?: string) => void }>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((msg: string, color = '#5C7CFF') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 text-white text-xs font-extrabold px-4 py-2.5 rounded-full z-[999] text-center max-w-[88%] whitespace-nowrap"
          style={{ background: toast.color }}
        >
          {toast.msg}
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
