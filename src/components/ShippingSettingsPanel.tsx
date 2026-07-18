import { useEffect, useState } from 'react';
import { Save, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { shippingMethodsService, ShippingMethod } from '../utils/shippingMethodsService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

export function ShippingSettingsPanel() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    try {
      setMethods(await shippingMethodsService.getAll());
    } catch (error) {
      console.error('Failed to load shipping settings:', error);
      toast.error('Could not load shipping settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMethods(); }, []);

  const updateMethod = (code: ShippingMethod['code'], changes: Partial<ShippingMethod>) => {
    setMethods((current) => current.map((method) => method.code === code ? { ...method, ...changes } : method));
  };

  const save = async () => {
    if (methods.some((method) => !method.name.trim() || !method.estimated_delivery.trim() || method.price < 0)) {
      toast.error('Each shipping option needs a name, valid price, and delivery estimate');
      return;
    }
    setSaving(true);
    try {
      await Promise.all(methods.map((method) => shippingMethodsService.update(method)));
      toast.success('Shipping options saved. Checkout prices are updated.');
      await loadMethods();
    } catch (error) {
      console.error('Failed to save shipping settings:', error);
      toast.error('Could not save shipping options');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Options & Pricing</CardTitle>
        <CardDescription>Control which delivery services customers can choose at checkout. Prices and free-shipping thresholds are in USD.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? <p className="text-sm text-gray-500">Loading shipping options…</p> : methods.map((method) => (
          <div key={method.code} className="rounded-lg border p-5">
            <div className="mb-4 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-full bg-blue-50 p-2"><Truck className="h-5 w-5 text-[#003366]" /></div><div><p className="font-medium text-[#003366]">{method.code}</p><p className="text-xs text-gray-500">Checkout option</p></div></div><div className="flex items-center gap-3"><Label htmlFor={`${method.code}-active`}>Available</Label><Switch id={`${method.code}-active`} checked={method.is_active} onCheckedChange={(is_active) => updateMethod(method.code, { is_active })} /></div></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><div className="grid gap-2"><Label>Name</Label><Input value={method.name} onChange={(event) => updateMethod(method.code, { name: event.target.value })} /></div><div className="grid gap-2"><Label>Price (USD)</Label><Input type="number" min="0" step="0.01" value={method.price} onChange={(event) => updateMethod(method.code, { price: Number(event.target.value) })} /></div><div className="grid gap-2"><Label>Free above (USD)</Label><Input type="number" min="0" step="0.01" value={method.free_shipping_threshold ?? ''} placeholder="No free threshold" onChange={(event) => updateMethod(method.code, { free_shipping_threshold: event.target.value === '' ? null : Number(event.target.value) })} /></div><div className="grid gap-2"><Label>Estimated delivery</Label><Input value={method.estimated_delivery} onChange={(event) => updateMethod(method.code, { estimated_delivery: event.target.value })} /></div><div className="grid gap-2 md:col-span-2 lg:col-span-4"><Label>Description</Label><Textarea value={method.description || ''} onChange={(event) => updateMethod(method.code, { description: event.target.value })} /></div></div>
          </div>
        ))}
        <div className="flex justify-end"><Button className="bg-[#003366] hover:bg-[#0055AA]" onClick={save} disabled={saving || loading}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save Shipping Options'}</Button></div>
      </CardContent>
    </Card>
  );
}
