import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import type { Order } from '../types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Coffee, ListChecks } from 'lucide-react';

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [exitingId, setExitingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Order,
      );
      setOrders(newOrders);
    });
    return () => unsub();
  }, []);

  const completeOrder = async (id: string) => {
    // 1. Mark for exit
    setExitingId(id);

    // 2. Wait for the exit animation to finish
    setTimeout(async () => {
      // 3. Update local state - this triggers the grid "slide"
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setExitingId(null);

      try {
        await deleteDoc(doc(db, 'orders', id));
        toast.success('Order served!');
      } catch (error) {
        toast.error('Sync error');
      }
    }, 300); // Matches the duration-300 below
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <nav className="bg-background border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground">
            <Coffee size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Barista Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/20">
          <ListChecks size={16} />
          <span>{orders.length} Orders</span>
        </div>
      </nav>

      {/* Grid Container */}
      <main className="flex-1 p-6 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-muted-foreground">
            <Coffee size={80} />
            <p className="mt-4 text-xl font-medium">No active orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((o, index) => {
              const isExiting = exitingId === o.id;

              return (
                <div
                  key={o.id}
                  className={`
                    bg-card rounded-2xl shadow-sm border-t-8 border-accent flex flex-col
                    transition-all duration-300 ease-in-out
                    ${
                      isExiting
                        ? 'opacity-0 scale-90 -translate-y-10'
                        : 'animate-in fade-in zoom-in-95 duration-300'
                    }
                  `}
                >
                  <div className="p-4 border-b border-border flex justify-between items-center">
                    <span className="text-xs font-mono text-muted-foreground font-bold">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">
                        {index === 0 ? 'Next Up' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex items-center justify-center min-h-35">
                    <h2 className="text-2xl font-black text-card-foreground text-center leading-tight">
                      {o.drink}
                    </h2>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-b-2xl border-t border-border">
                    <Button
                      disabled={isExiting}
                      className="w-full bg-primary text-primary-foreground hover:opacity-90 h-12 gap-2 text-md font-bold rounded-xl shadow-sm active:scale-95"
                      onClick={() => completeOrder(o.id)}
                    >
                      <CheckCircle2 size={18} />
                      {isExiting ? 'Removing...' : 'Complete'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
