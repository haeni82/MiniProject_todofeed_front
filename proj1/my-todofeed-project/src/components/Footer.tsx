export function Footer() {
  return (
    <footer className="mt-16 glass-panel rounded-t-3xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between text-gray-600">
          <p>© 2025 Glassmodo. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-800 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-gray-800 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
