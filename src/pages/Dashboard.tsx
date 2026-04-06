import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { logOut } from '../firebase';
import EmployeeManagement from '../components/EmployeeManagement';
import PayslipHistory from '../components/PayslipHistory';
import CompanySettings from '../components/CompanySettings';

export default function Dashboard() {
  const { userData } = useAuth();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!userData?.companyId) return;
      const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
      if (companyDoc.exists()) {
        setCompany({ id: companyDoc.id, ...companyDoc.data() });
      }
    };
    fetchCompany();
  }, [userData]);

  if (!userData || !company) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {company.logoBase64 && (
            <img src={company.logoBase64} alt="Company Logo" className="h-8 object-contain" />
          )}
          <div>
            <h1 className="text-xl font-bold">{company.name} - Payslip Portal</h1>
            <p className="text-sm text-gray-500">
              {(userData.role === 'company_admin' || userData.role === 'admin') ? 'Company Admin' : 'Payslip Generator'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{userData.displayName}</span>
          <Button variant="outline" size="sm" onClick={logOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="payslips">Payslip History</TabsTrigger>
            {(userData.role === 'company_admin' || userData.role === 'admin') && (
              <TabsTrigger value="settings">Company Settings</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="employees">
            <EmployeeManagement company={company} />
          </TabsContent>
          
          <TabsContent value="payslips">
            <PayslipHistory company={company} />
          </TabsContent>
          
          {(userData.role === 'company_admin' || userData.role === 'admin') && (
            <TabsContent value="settings">
              <CompanySettings company={company} setCompany={setCompany} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
