import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function GeneratePayslipModal({ employee, company, onClose }: { employee: any, company: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [allowances, setAllowances] = useState<{name: string, amount: number, included: boolean}[]>([]);
  const [deductions, setDeductions] = useState<{name: string, amount: number, included: boolean}[]>([]);
  
  const [paye, setPaye] = useState(0);
  const [stampFee, setStampFee] = useState(25);
  const [autoCalculatePaye, setAutoCalculatePaye] = useState(true);
  
  // Toggles for showing/hiding fields
  const [showEPF, setShowEPF] = useState(true);
  const [showETF, setShowETF] = useState(true);

  useEffect(() => {
    // Initialize with default allowances and deductions
    if (employee) {
      setAllowances((employee.defaultAllowances || []).map((a: any) => ({ ...a, included: true })));
      setDeductions((employee.defaultDeductions || []).map((d: any) => ({ ...d, included: true })));
    }
  }, [employee]);

  const basicSalary = employee.basicSalary || 0;
  
  const activeAllowances = allowances.filter(a => a.included);
  const activeDeductions = deductions.filter(d => d.included);

  const totalAllowances = activeAllowances.reduce((sum, a) => sum + a.amount, 0);
  const totalGross = basicSalary + totalAllowances;

  const calculatePAYE = (gross: number) => {
    let tax = 0;
    let remaining = gross - 150000;
    if (remaining <= 0) return 0;

    if (remaining > 0) {
      let taxable = Math.min(remaining, 83333);
      tax += taxable * 0.06;
      remaining -= taxable;
    }
    if (remaining > 0) {
      let taxable = Math.min(remaining, 41666);
      tax += taxable * 0.18;
      remaining -= taxable;
    }
    if (remaining > 0) {
      let taxable = Math.min(remaining, 41666);
      tax += taxable * 0.24;
      remaining -= taxable;
    }
    if (remaining > 0) {
      let taxable = Math.min(remaining, 41666);
      tax += taxable * 0.30;
      remaining -= taxable;
    }
    if (remaining > 0) {
      tax += remaining * 0.36;
    }
    return Math.round(tax);
  };

  useEffect(() => {
    if (autoCalculatePaye) {
      setPaye(calculatePAYE(totalGross));
    }
  }, [totalGross, autoCalculatePaye]);
  
  const epf8 = showEPF ? basicSalary * 0.08 : 0;
  const epf12 = showEPF ? basicSalary * 0.12 : 0;
  const etf3 = showETF ? basicSalary * 0.03 : 0;
  
  const totalOtherDeductions = activeDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalDeductions = epf8 + paye + stampFee + totalOtherDeductions;
  
  const netPay = totalGross - totalDeductions;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payslipData = {
        employeeId: employee.id,
        companyId: company.id,
        month,
        basicSalary,
        allowances: activeAllowances.map(({name, amount}) => ({name, amount})),
        deductions: activeDeductions.map(({name, amount}) => ({name, amount})),
        epf8,
        epf12,
        etf3,
        paye,
        stampFee,
        netPay,
        totalGross,
        totalDeductions,
        createdAt: new Date().toISOString(),
        employeeName: employee.name,
        empNo: employee.empNo,
        epfNo: employee.epfNo,
        department: employee.department,
        bankDetails: employee.bankDetails,
      };

      await addDoc(collection(db, 'payslips'), payslipData);
      onClose();
    } catch (error) {
      console.error("Error generating payslip", error);
    } finally {
      setLoading(false);
    }
  };

  const addAllowance = () => setAllowances([...allowances, { name: '', amount: 0, included: true }]);
  const addDeduction = () => setDeductions([...deductions, { name: '', amount: 0, included: true }]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Payslip for {employee.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Month</Label>
            <Input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Basic Salary</p>
              <p className="font-medium">{basicSalary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Pay</p>
              <p className="font-bold text-lg">{netPay.toLocaleString()}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Allowances for this month</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAllowance}>Add New</Button>
            </div>
            {allowances.map((al, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <Checkbox checked={al.included} onCheckedChange={(c) => {
                  const newArr = [...allowances];
                  newArr[idx].included = c as boolean;
                  setAllowances(newArr);
                }} />
                <Input placeholder="Name" value={al.name} onChange={e => {
                  const newArr = [...allowances];
                  newArr[idx].name = e.target.value;
                  setAllowances(newArr);
                }} />
                <Input type="number" placeholder="Amount" value={al.amount} onChange={e => {
                  const newArr = [...allowances];
                  newArr[idx].amount = Number(e.target.value);
                  setAllowances(newArr);
                }} />
                <Button variant="destructive" size="icon" onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))}>X</Button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Other Deductions for this month</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDeduction}>Add New</Button>
            </div>
            {deductions.map((ded, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <Checkbox checked={ded.included} onCheckedChange={(c) => {
                  const newArr = [...deductions];
                  newArr[idx].included = c as boolean;
                  setDeductions(newArr);
                }} />
                <Input placeholder="Name" value={ded.name} onChange={e => {
                  const newArr = [...deductions];
                  newArr[idx].name = e.target.value;
                  setDeductions(newArr);
                }} />
                <Input type="number" placeholder="Amount" value={ded.amount} onChange={e => {
                  const newArr = [...deductions];
                  newArr[idx].amount = Number(e.target.value);
                  setDeductions(newArr);
                }} />
                <Button variant="destructive" size="icon" onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))}>X</Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>PAYE Tax</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoPaye" checked={autoCalculatePaye} onCheckedChange={(c) => setAutoCalculatePaye(c as boolean)} />
                  <label htmlFor="autoPaye" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Auto
                  </label>
                </div>
              </div>
              <Input type="number" value={paye} onChange={e => {
                setPaye(Number(e.target.value));
                if (autoCalculatePaye) setAutoCalculatePaye(false);
              }} />
            </div>
            <div className="space-y-2">
              <Label>Stamp Fee</Label>
              <Input type="number" value={stampFee} onChange={e => setStampFee(Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <Label>Auto Calculations</Label>
            <div className="flex items-center space-x-2">
              <Checkbox id="epf" checked={showEPF} onCheckedChange={(c) => setShowEPF(c as boolean)} />
              <label htmlFor="epf" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Include EPF (8% Employee: {epf8}, 12% Employer: {epf12})
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="etf" checked={showETF} onCheckedChange={(c) => setShowETF(c as boolean)} />
              <label htmlFor="etf" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Include ETF (3% Employer: {etf3})
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate & Save Payslip'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
