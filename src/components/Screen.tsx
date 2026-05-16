export function Screen({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">{children}</div>;
}
