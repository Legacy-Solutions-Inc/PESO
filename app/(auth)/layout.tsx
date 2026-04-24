export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center bg-background text-foreground">
      {children}
    </div>
  );
}
