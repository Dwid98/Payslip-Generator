import { useState, FormEvent, ChangeEvent } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CompanySettings({ company, setCompany }: { company: any, setCompany: (c: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    name: company.name || '',
    address: company.address || '',
    logoBase64: company.logoBase64 || '',
  });

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'companies', company.id), details);
      setCompany({ ...company, ...details });
      alert('Company settings updated successfully.');
    } catch (error) {
      console.error("Error updating company", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-500 mb-1">Staff Join Code</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-lg font-bold bg-white px-3 py-1 rounded border">
              {company.joinCode}
            </span>
            <p className="text-xs text-gray-500">Share this code with your HR team to let them generate payslips.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Company Address</Label>
            <Input id="address" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Company Logo</Label>
            <div className="flex items-center gap-4">
              {details.logoBase64 && (
                <img src={details.logoBase64} alt="Logo Preview" className="h-16 w-16 object-contain border rounded bg-white" />
              )}
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} />
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
