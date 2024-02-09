export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[90vh] flex justify-center items-center">
      <div className="w-full sm:max-w-sm border border-gray-200 rounded-sm p-8">
        {children}
      </div>
    </div>
  );
}
