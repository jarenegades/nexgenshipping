import { useEffect, useState } from 'react';
import { BadgeDollarSign, Save, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from './ProductCard';
import { commerceSettingsService, PaymentMethodSetting } from '../utils/commerceSettingsService';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';

export function CommerceSettingsPanel({ products }: { products: Product[] }) {
  const [payments, setPayments] = useState<PaymentMethodSetting[]>([]);
  const [quoteIds, setQuoteIds] = useState<Set<string>>(new Set());
  const [savingPayments, setSavingPayments] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [methods, pricing] = await Promise.all([commerceSettingsService.getAllPaymentMethods(), commerceSettingsService.getPricingSettings()]);
      setPayments(methods);
      setQuoteIds(new Set(pricing.filter((setting) => setting.purchase_mode === 'quote').map((setting) => setting.product_id)));
    } catch (error) {
      console.error('Failed to load commerce settings:', error);
      toast.error('Could not load commerce settings');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const savePayments = async () => {
    setSavingPayments(true);
    try { await commerceSettingsService.savePaymentMethods(payments); toast.success('Payment options saved'); }
    catch (error) { console.error(error); toast.error('Could not save payment options'); }
    finally { setSavingPayments(false); }
  };
  const toggleQuote = async (product: Product, quote: boolean) => {
    try {
      await commerceSettingsService.setProductPurchaseMode(product.id, quote ? 'quote' : 'price');
      setQuoteIds((current) => { const next = new Set(current); quote ? next.add(product.id) : next.delete(product.id); return next; });
      toast.success(quote ? `${product.name} now requests a quote` : `${product.name} now shows pricing`);
    } catch (error) { console.error(error); toast.error('Could not update product purchase mode'); }
  };

  return <div className="space-y-6">
    <Card><CardHeader><CardTitle>Payment Options</CardTitle><CardDescription>Toggle payment methods available to customers at checkout.</CardDescription></CardHeader><CardContent className="space-y-4">{loading ? <p className="text-sm text-gray-500">Loading payment options…</p> : payments.map((method) => <div key={method.code} className="flex items-center justify-between rounded-lg border p-4"><div className="flex gap-3"><BadgeDollarSign className="h-5 w-5 text-[#003366] mt-0.5" /><div><p className="font-medium">{method.name}</p><p className="text-sm text-gray-500">{method.description}</p></div></div><div className="flex items-center gap-3"><span className="text-sm text-gray-600">{method.is_active ? 'Available' : 'Disabled'}</span><Switch checked={method.is_active} onCheckedChange={(is_active) => setPayments((items) => items.map((item) => item.code === method.code ? { ...item, is_active } : item))} /></div></div>)}<div className="flex justify-end"><Button className="bg-[#003366] hover:bg-[#0055AA]" onClick={savePayments} disabled={savingPayments || loading}><Save className="mr-2 h-4 w-4" />{savingPayments ? 'Saving…' : 'Save Payment Options'}</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Product Pricing & Quotes</CardTitle><CardDescription>Switch a product to Request a Quote to hide its price and remove it from direct purchase.</CardDescription></CardHeader><CardContent><div className="divide-y rounded-lg border">{products.map((product) => { const quote = quoteIds.has(product.id); return <div key={product.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium text-slate-900">{product.name}</p><p className="text-sm text-gray-500">{quote ? 'Request a Quote' : 'Price shown'}</p></div><div className="flex items-center gap-3"><span className="text-sm text-gray-600">{quote ? 'Quote' : 'Pricing'}</span><Switch checked={quote} onCheckedChange={(checked) => toggleQuote(product, checked)} /></div></div>; })}</div></CardContent></Card>
  </div>;
}
