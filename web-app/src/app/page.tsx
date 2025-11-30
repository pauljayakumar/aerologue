import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Track Flights.
              <br />
              <span className="text-map">Connect in the Sky.</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
              Real-time flight tracking, discover when your flight crosses paths with others,
              and turn your journey into an adventure with games and factoids.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/map"
                className="btn btn-map"
              >
                Open Live Map
              </Link>
              <Link
                href="/register"
                className="btn btn-secondary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-map/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wallet/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 - Map */}
            <div className="card p-6 group hover:border-map/50">
              <div className="w-12 h-12 rounded-xl bg-map/10 flex items-center justify-center mb-4 group-hover:bg-map/20 transition">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Live Flight Tracking</h3>
              <p className="text-secondary">
                Track any flight in real-time on an interactive map. See position,
                altitude, speed, and more.
              </p>
            </div>

            {/* Feature 2 - Crossings */}
            <div className="card p-6 group hover:border-crossing/50">
              <div className="w-12 h-12 rounded-xl bg-crossing/10 flex items-center justify-center mb-4 group-hover:bg-crossing/20 transition">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Flight Crossings</h3>
              <p className="text-secondary">
                Discover when your flight crosses paths with others. Exchange
                greetings with fellow travelers.
              </p>
            </div>

            {/* Feature 3 - Games */}
            <div className="card p-6 group hover:border-games/50">
              <div className="w-12 h-12 rounded-xl bg-games/10 flex items-center justify-center mb-4 group-hover:bg-games/20 transition">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">In-Flight Games</h3>
              <p className="text-secondary">
                Play geography quizzes based on your location. Learn fascinating
                facts about places you fly over.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Wallet Feature */}
            <div className="card p-8 group hover:border-wallet/50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-wallet/10 flex items-center justify-center shrink-0 group-hover:bg-wallet/20 transition">
                  <span className="text-3xl">👛</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Digital Wallet</h3>
                  <p className="text-secondary mb-4">
                    Collect badges, achievements, and digital souvenirs from your flights.
                    Build your aviation profile.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rarity-common text-white">Common</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rarity-rare text-white">Rare</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rarity-legendary text-white">Legendary</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Feature */}
            <div className="card p-8 group hover:border-messages/50">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-messages/10 flex items-center justify-center shrink-0 group-hover:bg-messages/20 transition">
                  <span className="text-3xl">💬</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">In-Flight Chat</h3>
                  <p className="text-secondary">
                    Send greetings to passengers on flights that cross your path.
                    Make connections at 35,000 feet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Explore?</h2>
          <p className="text-secondary mb-8">
            Start tracking flights and discover a new way to experience air travel.
          </p>
          <Link
            href="/map"
            className="btn btn-map"
          >
            <span>Open Live Map</span>
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
