import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Skin Marketplace
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          View detailed information about CS:GO skins
        </p>
        <div className="space-y-4">
          <Link
            href="/skins/awp-dragon-lore"
            className="inline-block px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            View AWP Dragon Lore
          </Link>
        </div>
        <div className="mt-8 text-gray-500 text-sm">
          <p>Example skin detail page implementation</p>
        </div>
      </div>
    </div>
  );
}
