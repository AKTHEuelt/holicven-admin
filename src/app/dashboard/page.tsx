"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tab = "oversikt" | "bestillinger" | "produkter" | "statistikk" | "innstillinger";

interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  product_name: string;
  product_price: number;
  quantity: number;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("oversikt");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  async function fetchData() {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products")
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(id: number, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-holicven-dark flex items-center justify-center">
        <div className="text-holicven-green text-xl">Laster...</div>
      </div>
    );
  }

  if (!session) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + o.product_price * o.quantity, 0);
  const newOrders = orders.filter((o) => o.status === "ny").length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "oversikt", label: "Oversikt", icon: "📊" },
    { id: "bestillinger", label: "Bestillinger", icon: "📦" },
    { id: "produkter", label: "Produkter", icon: "☕" },
    { id: "statistikk", label: "Statistikk", icon: "📈" },
    { id: "innstillinger", label: "Innstillinger", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: "url('/newspaper.png')", backgroundSize: "100%", backgroundPosition: "center", backgroundRepeat: "repeat" }}>
      <div className="absolute inset-0 bg-white/30"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-[#A2D5AB] border-b-2 border-black px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/HØLICVEN.png" alt="Høl i CV'en" className="h-12 w-auto" />
            <h1 className="text-2xl font-black text-black">
              Admin
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-500 text-black px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logg ut
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 bg-[#A2D5AB] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-bold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#A2D5AB] bg-black border-b-2 border-[#A2D5AB]"
                    : "text-black hover:text-[#A2D5AB] hover:bg-black/10"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {activeTab === "oversikt" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Dashboard Oversikt</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-black shadow-lg">
                <p className="text-gray-600 text-sm mb-2 font-medium">Nye Bestillinger</p>
                <p className="text-5xl font-black text-black">{newOrders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-black shadow-lg">
                <p className="text-gray-600 text-sm mb-2 font-medium">Totalt Antall</p>
                <p className="text-5xl font-black text-black">{orders.length}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-black shadow-lg">
                <p className="text-gray-600 text-sm mb-2 font-medium">Total Inntekt</p>
                <p className="text-5xl font-black text-black">{totalRevenue.toFixed(0)} kr</p>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-black shadow-lg">
                <p className="text-gray-600 text-sm mb-2 font-medium">Levert</p>
                <p className="text-5xl font-black text-black">
                  {orders.filter((o) => o.status === "levert").length}
                </p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white/95 backdrop-blur rounded-xl border-2 border-black shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-black">
                <h3 className="text-lg font-semibold text-black">Siste Bestillinger</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-black font-medium">{order.customer_name}</p>
                      <p className="text-gray-600 text-sm">{order.product_name}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          order.status === "ny"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : order.status === "levert"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="px-6 py-8 text-gray-500 text-center">Ingen bestillinger ennå</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "bestillinger" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Alle Bestillinger</h2>
            
            <div className="bg-white/95 backdrop-blur rounded-xl border border-black overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Kunde</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Produkt</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Pris</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Dato</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Endre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-gray-600">#{order.id}</td>
                      <td className="px-6 py-4 text-black">
                        <div>{order.customer_name}</div>
                        <div className="text-gray-500 text-sm">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{order.product_name}</td>
                      <td className="px-6 py-4 text-holicven-green font-medium">{order.product_price} kr</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm ${
                            order.status === "ny"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : order.status === "levert"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "avbrutt"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString("no-NO")}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-gray-800 text-black text-sm rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-holicven-green"
                        >
                          <option value="ny">Ny</option>
                          <option value="behandles">Behandles</option>
                          <option value="sendt">Sendt</option>
                          <option value="levert">Levert</option>
                          <option value="avbrutt">Avbrutt</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="px-6 py-12 text-gray-500 text-center">Ingen bestillinger ennå</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "produkter" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Produkter</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white/95 backdrop-blur rounded-xl border border-black p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-holicven-green/20 p-3 rounded-full text-2xl">☕</div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        product.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-600"
                      }`}
                    >
                      {product.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-holicven-green font-bold text-xl">{product.price} kr</span>
                    <span className="text-gray-500 text-sm">{product.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="bg-white/95 backdrop-blur rounded-xl border border-black p-12 text-center">
                <p className="text-gray-500">Ingen produkter ennå. Legg til produkter via API.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "statistikk" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Statistikk</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/95 backdrop-blur rounded-xl border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Bestillinger per Status</h3>
                <div className="space-y-4">
                  {["ny", "behandles", "sendt", "levert", "avbrutt"].map((status) => {
                    const count = orders.filter((o) => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 capitalize">{status}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-holicven-green rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur rounded-xl border border-black p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Populære Produkter</h3>
                <div className="space-y-4">
                  {Object.entries(
                    orders.reduce((acc, o) => ({ ...acc, [o.product_name]: (acc[o.product_name] || 0) + 1 }), {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([product, count]) => (
                      <div key={product} className="flex justify-between items-center">
                        <span className="text-gray-300">{product}</span>
                        <span className="bg-holicven-green/20 text-holicven-green px-3 py-1 rounded-full text-sm">
                          {count}
                        </span>
                      </div>
                    ))}
                  {orders.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Ingen data ennå</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "innstillinger" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Innstillinger</h2>
            
            <div className="bg-white/95 backdrop-blur rounded-xl border border-black p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-black mb-4">Admin Bruker</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Brukernavn</label>
                  <input
                    type="text"
                    defaultValue="admin"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2">Nytt Passord</label>
                  <input
                    type="password"
                    placeholder="Skriv nytt passord for å endre"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-black"
                  />
                </div>
                <button className="bg-holicven-green text-black font-bold px-6 py-3 rounded-lg hover:bg-holicven-green/80 transition">
                  Lagre Endringer
                </button>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-xl border border-black p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-black mb-4">E-post Innstillinger</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">E-post for Varslinger</label>
                  <input
                    type="email"
                    placeholder="admin@holicven.no"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-black"
                  />
                </div>
                <p className="text-gray-500 text-sm">
                  Motta e-post når nye bestillinger kommer inn og varer sendes.
                </p>
                <button className="bg-blue-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-blue-500/80 transition">
                  Lagre E-post
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
