import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function PayslipViewModal({ payslip, company, onClose }: { payslip: any, company: any, onClose: () => void }) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Payslip_${payslip.employeeName}_${payslip.month}`,
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const monthName = format(parseISO(`${payslip.month}-01`), 'MMMM yyyy');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col space-y-4">
          <div className="flex flex-row items-center justify-between">
            <DialogTitle>Payslip - {monthName}</DialogTitle>
            <div className="space-x-2">
              <Button onClick={() => handlePrint()}>Print / Save as PDF</Button>
            </div>
          </div>
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertDescription>
              To save as a PDF, click the button above and select <strong>"Save as PDF"</strong> in the Destination dropdown of the print dialog.
            </AlertDescription>
          </Alert>
        </DialogHeader>
        
        <div className="p-8 bg-white text-black font-mono text-sm" ref={componentRef}>
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
            <div>
              <h1 className="text-xl font-bold text-purple-800">{company.name}</h1>
              <p className="whitespace-pre-line">{company.address}</p>
            </div>
            {company.logoBase64 && (
              <img src={company.logoBase64} alt="Company Logo" className="h-16 object-contain" />
            )}
          </div>

          <h2 className="text-center font-bold text-lg mb-6">Pay Slip for the Month of {monthName}</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <div className="flex"><span className="w-32 font-bold">Emp No</span><span>{payslip.empNo}</span></div>
              <div className="flex"><span className="w-32 font-bold">EPF No</span><span>{payslip.epfNo}</span></div>
              <div className="flex"><span className="w-32 font-bold">Name</span><span>{payslip.employeeName}</span></div>
              <div className="flex"><span className="w-32 font-bold">Department</span><span>{payslip.department}</span></div>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between font-bold">
              <span>Basic Salary</span>
              <span>{formatCurrency(payslip.basicSalary)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Net Gross</span>
              <span>{formatCurrency(payslip.basicSalary)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total For EPF</span>
              <span>{formatCurrency(payslip.basicSalary)}</span>
            </div>
            
            <div className="py-2">
              {payslip.allowances?.map((al: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{al.name}</span>
                  <span>{formatCurrency(al.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold">
              <span>Total Gross</span>
              <span>{formatCurrency(payslip.totalGross)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total for Tax</span>
              <span>{formatCurrency(payslip.totalGross)}</span>
            </div>

            <div className="py-2">
              {payslip.deductions?.map((ded: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{ded.name}</span>
                  <span>{formatCurrency(ded.amount)}</span>
                </div>
              ))}
              {payslip.epf8 > 0 && (
                <div className="flex justify-between">
                  <span>EPF Amount 8%</span>
                  <span>{formatCurrency(payslip.epf8)}</span>
                </div>
              )}
              {payslip.paye > 0 && (
                <div className="flex justify-between">
                  <span>Paye</span>
                  <span>{formatCurrency(payslip.paye)}</span>
                </div>
              )}
              {payslip.stampFee > 0 && (
                <div className="flex justify-between">
                  <span>Stamp Fee</span>
                  <span>{formatCurrency(payslip.stampFee)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-bold border-t border-b py-2">
              <span>Total Deductions</span>
              <span>{formatCurrency(payslip.totalDeductions)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg py-2">
              <span>Net Pay</span>
              <span>{formatCurrency(payslip.netPay)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Salary To Bank</span>
              <span>{formatCurrency(payslip.netPay)}</span>
            </div>

            <div className="py-2 mt-4 text-gray-600">
              {payslip.etf3 > 0 && (
                <div className="flex justify-between">
                  <span>ETF Amount 3%</span>
                  <span>{formatCurrency(payslip.etf3)}</span>
                </div>
              )}
              {payslip.epf12 > 0 && (
                <div className="flex justify-between">
                  <span>EPF Amount 12%</span>
                  <span>{formatCurrency(payslip.epf12)}</span>
                </div>
              )}
              {payslip.epf8 > 0 && payslip.epf12 > 0 && (
                <div className="flex justify-between">
                  <span>EPF Amount 20%</span>
                  <span>{formatCurrency(payslip.epf8 + payslip.epf12)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12">
            <h3 className="font-bold underline mb-2">Banks Details</h3>
            <p>{payslip.bankDetails}</p>
          </div>

          <div className="mt-24 text-center">
            <div className="w-64 border-t border-dashed border-black mx-auto mb-2"></div>
            <p className="font-bold italic">Signature</p>
            <p className="text-xs mt-4 italic">Generated by Payslip Generator</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
