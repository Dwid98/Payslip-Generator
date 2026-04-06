import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import PayslipViewModal from './PayslipViewModal';

export default function PayslipHistory({ company }: { company: any }) {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  useEffect(() => {
    const fetchPayslips = async () => {
      const q = query(
        collection(db, 'payslips'),
        where('companyId', '==', company.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const slips = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayslips(slips);
    };

    fetchPayslips();
  }, [company.id]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslip History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Net Pay</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((slip) => (
              <TableRow key={slip.id}>
                <TableCell className="font-medium">{slip.month}</TableCell>
                <TableCell>{slip.employeeName}</TableCell>
                <TableCell>{slip.netPay.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(slip)}>
                    View & Print
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {payslips.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                  No payslips generated yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {selectedPayslip && (
        <PayslipViewModal
          payslip={selectedPayslip}
          company={company}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </Card>
  );
}
