export default function TripHeader({
  title,
}: {
  title: string;
}) {
  return (
    <header className="border-b border-slate-800 pb-3 mb-4">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>
    </header>
  );
}