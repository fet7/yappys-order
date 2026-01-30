import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Coffee,
  Boxes,
  Flame,
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
} from 'lucide-react';

const DRINKS = [
  {
    id: 'iced-latte',
    label: 'Iced Latte',
    icon: <Boxes className="w-5 h-5" />,
    price: 5.5,
  },
  {
    id: 'latte',
    label: 'Hot Latte',
    icon: <Coffee className="w-5 h-5" />,
    price: 5.0,
  },
  {
    id: 'cappuccino',
    label: 'Cappuccino',
    icon: <Sparkles className="w-5 h-5" />,
    price: 4.5,
  },
  {
    id: 'americano',
    label: 'Americano',
    icon: <Flame className="w-5 h-5" />,
    price: 4.0,
  },
];

export default function Order() {
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const current = next.get(id) || 0;
      const newValue = current + delta;

      if (newValue <= 0) {
        next.delete(id);
      } else {
        next.set(id, newValue);
      }
      return next;
    });
  };

  const totalItems = Array.from(cart.values()).reduce((a, b) => a + b, 0);
  const totalPrice = Array.from(cart.entries()).reduce((sum, [id, qty]) => {
    const drink = DRINKS.find((d) => d.id === id);
    return sum + (drink?.price || 0) * qty;
  }, 0);

  const sendOrder = async () => {
    const items = Array.from(cart.entries())
      .map(([id, qty]) => {
        const drink = DRINKS.find((d) => d.id === id);
        return `${qty}x ${drink?.label}`;
      })
      .join(', ');

    const promise = addDoc(collection(db, 'orders'), {
      drink: items,
      itemCount: totalItems,
      createdAt: serverTimestamp(),
    });

    toast.promise(promise, {
      loading: 'Sending order...',
      success: 'Barista is on it! ☕',
      error: 'Failed to place order.',
    });

    setCart(new Map());
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <div className="h-32 bg-primary dark:bg-accent/70 flex items-end p-6 rounded-b-4xl shadow-lg shrink-0">
        <div className="flex justify-between items-end w-full">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              Yappy’s
            </h1>
            <p className="text-primary-foreground/60 italic text-sm font-medium">
              <code>to brighten your day</code>
            </p>
          </div>
          {totalItems > 0 && (
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full mb-1 h-8 w-8"
              onClick={() => setCart(new Map())}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <main className="p-6 -mt-4 space-y-4 flex-1 pb-40 overflow-y-auto">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
          Menu
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {DRINKS.map((drink) => {
            const quantity = cart.get(drink.id) || 0;
            return (
              <Card
                key={drink.id}
                className={`transition-all duration-200 border-2 ${
                  quantity > 0 ? 'border-accent bg-accent/5' : 'border-border'
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl transition-colors ${
                        quantity > 0
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {drink.icon}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{drink.label}</p>
                      <p className="text-sm text-muted-foreground">
                        ${drink.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-background rounded-full p-1 border border-border shadow-sm">
                    {quantity > 0 ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(drink.id, -1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold w-4 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(drink.id, 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-4 font-bold"
                        onClick={() => updateQuantity(drink.id, 1)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Cart Summary & Order Button */}
      {totalItems > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-background/95 backdrop-blur-md border-t border-border animate-in slide-in-from-bottom duration-300 z-50">
          <div className="max-w-md mx-auto space-y-4">
            <div className="flex justify-between items-center text-sm font-bold px-2">
              <span className="text-muted-foreground uppercase tracking-widest">
                Total Items: {totalItems}
              </span>
              <span className="text-lg">${totalPrice.toFixed(2)}</span>
            </div>
            <Button
              size="lg"
              className="w-full text-lg font-medium shadow-xl  gap-3"
              onClick={sendOrder}
            >
              <ShoppingCart className="w-6 h-6" />
              Place Order
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
