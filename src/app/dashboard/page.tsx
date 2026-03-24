"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tab = "oversikt" | "bestillinger" | "produkter" | "arrangementer" | "statistikk" | "innstillinger";

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

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  active: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("oversikt");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: 0, category: "kaffe" });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", time: "", location: "" });

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
      const [ordersRes, productsRes, eventsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/products"),
        fetch("/api/events")
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
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

  // Product CRUD
  async function saveProduct(product: Partial<Product>) {
    if (product.id) {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    }
    setEditingProduct(null);
    setNewProduct({ name: "", description: "", price: 0, category: "kaffe" });
    fetchData();
  }

  async function deleteProduct(id: number) {
    if (confirm("Er du sikker på at du vil slette dette produktet?")) {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchData();
    }
  }

  async function toggleProductActive(product: Product) {
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    fetchData();
  }

  // Event CRUD
  async function saveEvent(event: Partial<Event>) {
    if (event.id) {
      await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    }
    setEditingEvent(null);
    setNewEvent({ title: "", description: "", date: "", time: "", location: "" });
    fetchData();
  }

  async function deleteEvent(id: number) {
    if (confirm("Er du sikker på at du vil slette dette arrangementet?")) {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      fetchData();
    }
  }

  async function toggleEventActive(event: Event) {
    await fetch(`/api/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !event.active }),
    });
    fetchData();
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black text-xl">Laster...</div>
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
    { id: "arrangementer", label: "Arrangementer", icon: "📅" },
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
            <h1 className="text-2xl font-black text-black">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
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
        
        {/* OVERSIKT TAB */}
        {activeTab === "oversikt" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Dashboard Oversikt</h2>
            
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
                <p className="text-gray-600 text-sm mb-2 font-medium">Aktive Produkter</p>
                <p className="text-5xl font-black text-black">{products.filter(p => p.active).length}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-black bg-gray-50">
                <h3 className="text-lg font-semibold text-black">Siste Bestillinger</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <p className="text-black font-medium">{order.customer_name}</p>
                      <p className="text-gray-600 text-sm">{order.product_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "ny" ? "bg-yellow-200 text-yellow-800" :
                      order.status === "levert" ? "bg-green-200 text-green-800" :
                      "bg-blue-200 text-blue-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="px-6 py-8 text-gray-500 text-center">Ingen bestillinger ennå</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BESTILLINGER TAB */}
        {activeTab === "bestillinger" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Alle Bestillinger</h2>
            
            <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-black">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Kunde</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Produkt</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Pris</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Dato</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black">Endre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">#{order.id}</td>
                      <td className="px-6 py-4 text-black">
                        <div>{order.customer_name}</div>
                        <div className="text-gray-500 text-sm">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{order.product_name}</td>
                      <td className="px-6 py-4 text-black font-bold">{order.product_price} kr</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "ny" ? "bg-yellow-200 text-yellow-800" :
                          order.status === "levert" ? "bg-green-200 text-green-800" :
                          order.status === "avbrutt" ? "bg-red-200 text-red-800" :
                          "bg-blue-200 text-blue-800"
                        }`}>
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
                          className="bg-black text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-[#A2D5AB]"
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

        {/* PRODUKTER TAB */}
        {activeTab === "produkter" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Produkter</h2>
            
            {/* Legg til nytt produkt */}
            <div className="bg-white rounded-xl border-2 border-black p-6">
              <h3 className="text-lg font-bold text-black mb-4">Legg til nytt produkt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Navn"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <input
                  type="text"
                  placeholder="Beskrivelse"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <input
                  type="number"
                  placeholder="Pris (kr)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                >
                  <option value="kaffe">Kaffe</option>
                  <option value="bønner">Bønner</option>
                  <option value="tilbehør">Tilbehør</option>
                  <option value="abonnement">Abonnement</option>
                </select>
                <button
                  onClick={() => saveProduct(newProduct)}
                  className="bg-[#A2D5AB] text-black font-bold rounded-lg px-6 py-3 hover:bg-[#8bc49a] transition"
                >
                  Legg til
                </button>
              </div>
            </div>

            {/* Produktliste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className={`bg-white rounded-xl border-2 border-black p-6 ${!product.active ? "opacity-60" : ""}`}>
                  {editingProduct?.id === product.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        defaultValue={product.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <textarea
                        defaultValue={product.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white h-20"
                      />
                      <input
                        type="number"
                        defaultValue={product.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) as number })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveProduct(editingProduct)}
                          className="flex-1 bg-[#A2D5AB] text-black font-bold rounded-lg px-4 py-2"
                        >
                          Lagre
                        </button>
                        <button
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 bg-gray-300 text-black font-bold rounded-lg px-4 py-2"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-[#A2D5AB] p-3 rounded-full text-2xl">☕</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.active ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                          {product.active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-black font-bold text-xl">{product.price} kr</span>
                        <span className="text-gray-500 text-sm">{product.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="flex-1 bg-black text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition"
                        >
                          Endre
                        </button>
                        <button
                          onClick={() => toggleProductActive(product)}
                          className="bg-yellow-400 text-black font-medium rounded-lg px-4 py-2 hover:bg-yellow-500 transition"
                        >
                          {product.active ? "Deaktiver" : "Aktiver"}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="bg-red-500 text-white font-medium rounded-lg px-4 py-2 hover:bg-red-600 transition"
                        >
                          Slett
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="bg-white rounded-xl border-2 border-black p-12 text-center">
                <p className="text-gray-500">Ingen produkter ennå. Legg til ditt første produkt over.</p>
              </div>
            )}
          </div>
        )}

        {/* ARRANGEMENTER TAB */}
        {activeTab === "arrangementer" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Arrangementer</h2>
            
            {/* Legg til nytt arrangement */}
            <div className="bg-white rounded-xl border-2 border-black p-6">
              <h3 className="text-lg font-bold text-black mb-4">Legg til nytt arrangement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Tittel"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <input
                  type="text"
                  placeholder="Tid (f.eks. 14:00 - 18:00)"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <input
                  type="text"
                  placeholder="Sted"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                />
                <button
                  onClick={() => saveEvent(newEvent)}
                  className="bg-[#A2D5AB] text-black font-bold rounded-lg px-6 py-3 hover:bg-[#8bc49a] transition"
                >
                  Legg til
                </button>
              </div>
              <div className="mt-4">
                <textarea
                  placeholder="Beskrivelse"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white h-20"
                />
              </div>
            </div>

            {/* Arrangementsliste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.id} className={`bg-white rounded-xl border-2 border-black p-6 ${!event.active ? "opacity-60" : ""}`}>
                  {editingEvent?.id === event.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        defaultValue={event.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <input
                        type="date"
                        defaultValue={event.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        defaultValue={event.time}
                        onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        defaultValue={event.location}
                        onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                      <textarea
                        defaultValue={event.description}
                        onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white h-20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEvent(editingEvent)}
                          className="flex-1 bg-[#A2D5AB] text-black font-bold rounded-lg px-4 py-2"
                        >
                          Lagre
                        </button>
                        <button
                          onClick={() => setEditingEvent(null)}
                          className="flex-1 bg-gray-300 text-black font-bold rounded-lg px-4 py-2"
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-[#A2D5AB] p-3 rounded-full text-2xl">📅</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.active ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                          {event.active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <div className="space-y-2 mb-4">
                        <p className="text-black font-medium">📅 {event.date}</p>
                        <p className="text-gray-600 text-sm">🕐 {event.time}</p>
                        <p className="text-gray-600 text-sm">📍 {event.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="flex-1 bg-black text-white font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition"
                        >
                          Endre
                        </button>
                        <button
                          onClick={() => toggleEventActive(event)}
                          className="bg-yellow-400 text-black font-medium rounded-lg px-4 py-2 hover:bg-yellow-500 transition"
                        >
                          {event.active ? "Deaktiver" : "Aktiver"}
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="bg-red-500 text-white font-medium rounded-lg px-4 py-2 hover:bg-red-600 transition"
                        >
                          Slett
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="bg-white rounded-xl border-2 border-black p-12 text-center">
                <p className="text-gray-500">Ingen arrangementer ennå. Legg til ditt første arrangement over.</p>
              </div>
            )}
          </div>
        )}

        {/* STATISTIKK TAB */}
        {activeTab === "statistikk" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Statistikk</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border-2 border-black p-6">
                <h3 className="text-lg font-bold text-black mb-4">Bestillinger per Status</h3>
                <div className="space-y-4">
                  {["ny", "behandles", "sendt", "levert", "avbrutt"].map((status) => {
                    const count = orders.filter((o) => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 capitalize">{status}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A2D5AB] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-black p-6">
                <h3 className="text-lg font-bold text-black mb-4">Populære Produkter</h3>
                <div className="space-y-4">
                  {Object.entries(
                    orders.reduce((acc, o) => ({ ...acc, [o.product_name]: (acc[o.product_name] || 0) + 1 }), {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([product, count]) => (
                      <div key={product} className="flex justify-between items-center">
                        <span className="text-gray-700">{product}</span>
                        <span className="bg-[#A2D5AB] text-black px-3 py-1 rounded-full text-sm font-bold">
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

        {/* INNSTILLINGER TAB */}
        {activeTab === "innstillinger" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black mb-6">Innstillinger</h2>
            
            <div className="bg-white rounded-xl border-2 border-black p-6 max-w-2xl">
              <h3 className="text-lg font-bold text-black mb-4">Admin Bruker</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">Brukernavn</label>
                  <input
                    type="text"
                    defaultValue="admin"
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">Nytt Passord</label>
                  <input
                    type="password"
                    placeholder="Skriv nytt passord for å endre"
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
                <button className="bg-[#A2D5AB] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#8bc49a] transition">
                  Lagre Endringer
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-black p-6 max-w-2xl">
              <h3 className="text-lg font-bold text-black mb-4">E-post Innstillinger</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">E-post for Varslinger</label>
                  <input
                    type="email"
                    placeholder="admin@holicven.no"
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
                <p className="text-gray-500 text-sm">
                  Motta e-post når nye bestillinger kommer inn og varer sendes.
                </p>
                <button className="bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600 transition">
                  Lagre E-post
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-black p-6 max-w-2xl">
              <h3 className="text-lg font-bold text-black mb-4">Vipps Innstillinger</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">Vipps Merchant ID</label>
                  <input
                    type="text"
                    placeholder=" Ikke konfigurert ennå"
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-2 font-medium">Vipps API Key</label>
                  <input
                    type="password"
                    placeholder="Ikke konfigurert ennå"
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                </div>
                <p className="text-gray-500 text-sm">
                  Sett opp Vipps for å motta betalinger direkte på nettsiden.
                </p>
                <button className="bg-[#A2D5AB] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#8bc49a] transition">
                  Lagre Vipps
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
