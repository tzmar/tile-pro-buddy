import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShoppingItem, Priority } from '@/types/job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { genId } from '@/data/constants';
import { useNavigate } from 'react-router-dom';
import { formatPula } from '@/lib/currency';

export default function ShoppingList() {
  const { shoppingList, setShoppingList } = useApp();
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const addItem = () => {
    if (!newName.trim()) return;
    const item: ShoppingItem = { id: genId(), name: newName.trim(), estimatedPrice: parseFloat(newPrice) || 0, priority: newPriority, purchased: false };
    setShoppingList(prev => [...prev, item]);
    setNewName(''); setNewPrice('');
  };

  const togglePurchased = (id: string) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, purchased: !i.purchased } : i));
  };

  const deleteItem = (id: string) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const unpurchased = shoppingList.filter(i => !i.purchased);
  const purchased = shoppingList.filter(i => i.purchased);
  const totalNeeded = unpurchased.reduce((s, i) => s + i.estimatedPrice, 0);

  const priorityColor = (p: Priority) => {
    switch (p) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  const sortByPriority = (items: ShoppingItem[]) => {
    const order = { high: 0, medium: 1, low: 2 };
    return [...items].sort((a, b) => order[a.priority] - order[b.priority]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Shopping List</h2>
      </div>

      {unpurchased.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Investment Needed</p>
            <p className="text-2xl font-bold text-primary">{formatPula(totalNeeded)}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Add Item</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Tool name" value={newName} onChange={e => setNewName(e.target.value)} />
          <div className="flex gap-2">
            <Input placeholder="Price (P)" type="number" min={0} value={newPrice} onChange={e => setNewPrice(e.target.value)} className="flex-1" />
            <Select value={newPriority} onValueChange={(v: Priority) => setNewPriority(v)}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addItem} className="w-full gap-2" disabled={!newName.trim()}>
            <PlusCircle className="h-4 w-4" /> Add
          </Button>
        </CardContent>
      </Card>

      {unpurchased.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">To Buy ({unpurchased.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {sortByPriority(unpurchased).map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                <Checkbox checked={false} onCheckedChange={() => togglePurchased(item.id)} />
                <span className="text-sm flex-1">{item.name}</span>
                <Badge variant={priorityColor(item.priority)} className="text-[10px] h-5">{item.priority}</Badge>
                {item.estimatedPrice > 0 && <span className="text-xs font-medium">{formatPula(item.estimatedPrice)}</span>}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {purchased.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-success">Purchased ({purchased.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {purchased.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-success/5">
                <Checkbox checked onCheckedChange={() => togglePurchased(item.id)} />
                <span className="text-sm flex-1 line-through text-muted-foreground">{item.name}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {shoppingList.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No items in your shopping list</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
