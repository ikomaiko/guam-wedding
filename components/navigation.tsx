export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <button className="p-2">Home</button>
          <button className="p-2">Timeline</button>
          <button className="p-2">Checklist</button>
          <button className="p-2">Guests</button>
        </div>
      </div>
    </nav>
  );
}