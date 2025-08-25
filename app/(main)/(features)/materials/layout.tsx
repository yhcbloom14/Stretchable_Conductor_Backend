export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="materials-module">
      {children}
    </div>
  );
}