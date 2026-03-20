// src/app/page.tsx
"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #A2D5AB;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #A2D5AB;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #A2D5AB;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #A2D5AB;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #888;
  text-transform: uppercase;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #A2D5AB;
  margin-bottom: 1rem;
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
`;

const Th = styled.th`
  background-color: #A2D5AB;
  color: #000;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #444;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #333;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${({ $status }) => {
    switch ($status) {
      case "ny": return "#FFD700";
      case "behandles": return "#FFA500";
      case "sendt": return "#4169E1";
      case "levert": return "#32CD32";
      case "avbrutt": return "#DC143C";
      default: return "#888";
    }
  }};
  color: ${({ $status }) => ["sendt", "levert", "behandles"].includes($status) ? "#fff" : "#000"};
`;

const Select = styled.select`
  background-color: #1a1a1a;
  color: #fff;
  border: 1px solid #A2D5AB;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
`;

const Footer = styled.footer`
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
  color: #666;
  text-align: center;
`;

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

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.product_price * o.quantity, 0);
  const newOrders = orders.filter(o => o.status === "ny").length;

  return (
    <PageContainer>
      <Header>
        <Title>Høl i CV'en Admin</Title>
        <StatCard style={{ backgroundColor: "#A2D5AB", color: "#000" }}>
          <StatNumber style={{ color: "#000" }}>{newOrders}</StatNumber>
          <StatLabel>Nye bestillinger</StatLabel>
        </StatCard>
      </Header>

      <Stats>
        <StatCard>
          <StatNumber>{orders.length}</StatNumber>
          <StatLabel>Totalt antall bestillinger</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalRevenue.toFixed(0)} kr</StatNumber>
          <StatLabel>Total inntekt</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{orders.filter(o => o.status === "levert").length}</StatNumber>
          <StatLabel>Levert</StatLabel>
        </StatCard>
      </Stats>

      <SectionTitle>Bestillinger</SectionTitle>
      
      {loading ? (
        <p>Laster...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: "#888" }}>Ingen bestillinger ennå.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Kunde</Th>
              <Th>Produkt</Th>
              <Th>Pris</Th>
              <Th>Antall</Th>
              <Th>Status</Th>
              <Th>Dato</Th>
              <Th>Endre status</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <Tr key={order.id}>
                <Td>#{order.id}</Td>
                <Td>
                  <div>{order.customer_name}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>{order.customer_email}</div>
                </Td>
                <Td>{order.product_name}</Td>
                <Td>{order.product_price} kr</Td>
                <Td>{order.quantity}</Td>
                <Td>
                  <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                </Td>
                <Td style={{ fontSize: "0.85rem", color: "#888" }}>
                  {new Date(order.created_at).toLocaleDateString("no-NO")}
                </Td>
                <Td>
                  <Select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                    <option value="ny">Ny</option>
                    <option value="behandles">Behandles</option>
                    <option value="sendt">Sendt</option>
                    <option value="levert">Levert</option>
                    <option value="avbrutt">Avbrutt</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <Footer>
        Høl i CV'en Admin Panel - Driftet av Studio 51
      </Footer>
    </PageContainer>
  );
}
