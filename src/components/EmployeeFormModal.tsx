import { useState, FormEvent } from 'react';
import { db } from '../firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function EmployeeFormModal({ companyId, employee, onClose }: { companyId: string, employee?: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    name: employee?.name || '',
    empNo: employee?.empNo || '',
    epfNo: employee?.epfNo || '',
    department: employee?.department || '',
    basicSalary: employee?.basicSalary || 0,
    bankDetails: employee?.bankDetails || '',
  });

  const [defaultAllowances, setDefaultAllowances] = useState<{name: string, amount: number}[]>(employee?.defaultAllowances || []);
  const [defaultDeductions, setDefaultDeductions] = useState<{name: string, amount: number}[]>(employee?.defaultDeductions || []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        companyId,
        ...details,
        basicSalary: Number(details.basicSalary),
        defaultAllowances,
        defaultDeductions,
      };
      
      console.log("Saving employee data:", data);

      if (employee?.id) {
        await setDoc(doc(db, 'employees', employee.id), data);
      } else {
        await addDoc(collection(db, 'employees'), data);
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving employee", error);
      if (error.message?.includes('Missing or insufficient permissions')) {
        await handleFirestoreError(error, employee?.id ? OperationType.UPDATE : OperationType.CREATE, 'employees');
      } else {
        alert("Error saving employee: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addAllowance = () => setDefaultAllowances([...defaultAllowances, { name: '', amount: 0 }]);
  const addDeduction = () => setDefaultDeductions([...defaultDeductions, { name: '', amount: 0 }]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empNo">Emp No</Label>
              <Input id="empNo" value={details.empNo} onChange={e => setDetails({...details, empNo: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epfNo">EPF No</Label>
              <Input id="epfNo" value={details.epfNo} onChange={e => setDetails({...details, epfNo: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" value={details.department} onChange={e => setDetails({...details, department: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="basicSalary">Basic Salary</Label>
            <Input id="basicSalary" type="number" value={details.basicSalary} onChange={e => setDetails({...details, basicSalary: Number(e.target.value)})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankDetails">Bank Details</Label>
            <Input id="bankDetails" value={details.bankDetails} onChange={e => setDetails({...details, bankDetails: e.target.value})} placeholder="Bank - Branch - Account No" />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Default Allowances</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAllowance}>Add</Button>
            </div>
            {defaultAllowances.map((al, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input placeholder="Name" value={al.name} onChange={e => {
                  const newArr = [...defaultAllowances];
                  newArr[idx].name = e.target.value;
                  setDefaultAllowances(newArr);
                }} />
                <Input type="number" placeholder="Amount" value={al.amount} onChange={e => {
                  const newArr = [...defaultAllowances];
                  newArr[idx].amount = Number(e.target.value);
                  setDefaultAllowances(newArr);
                }} />
                <Button type="button" variant="destructive" size="icon" onClick={() => setDefaultAllowances(defaultAllowances.filter((_, i) => i !== idx))}>X</Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Default Deductions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDeduction}>Add</Button>
            </div>
            {defaultDeductions.map((ded, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input placeholder="Name" value={ded.name} onChange={e => {
                  const newArr = [...defaultDeductions];
                  newArr[idx].name = e.target.value;
                  setDefaultDeductions(newArr);
                }} />
                <Input type="number" placeholder="Amount" value={ded.amount} onChange={e => {
                  const newArr = [...defaultDeductions];
                  newArr[idx].amount = Number(e.target.value);
                  setDefaultDeductions(newArr);
                }} />
                <Button type="button" variant="destructive" size="icon" onClick={() => setDefaultDeductions(defaultDeductions.filter((_, i) => i !== idx))}>X</Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Employee'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
