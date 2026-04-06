import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import EmployeeFormModal from './EmployeeFormModal';
import GeneratePayslipModal from './GeneratePayslipModal';
import { useAuth } from '../App';

export default function EmployeeManagement({ company }: { company: any }) {
  const { userData } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const fetchEmployees = async () => {
    const q = query(collection(db, 'employees'), where('companyId', '==', company.id));
    const querySnapshot = await getDocs(q);
    const emps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEmployees(emps);
  };

  useEffect(() => {
    fetchEmployees();
  }, [company.id]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      await deleteDoc(doc(db, 'employees', id));
      fetchEmployees();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Employees</CardTitle>
        <Button onClick={() => { setSelectedEmployee(null); setIsFormOpen(true); }}>
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Emp No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.empNo}</TableCell>
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.department}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedEmployee(emp);
                    setIsFormOpen(true);
                  }}>
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => {
                    setSelectedEmployee(emp);
                    setIsPayslipModalOpen(true);
                  }}>
                    Generate Payslip
                  </Button>
                  {(userData?.role === 'company_admin' || userData?.role === 'admin') && (
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(emp.id)}>
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                  No employees added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {isFormOpen && (
        <EmployeeFormModal
          companyId={company.id}
          employee={selectedEmployee}
          onClose={() => { setIsFormOpen(false); fetchEmployees(); }}
        />
      )}

      {isPayslipModalOpen && selectedEmployee && (
        <GeneratePayslipModal
          employee={selectedEmployee}
          company={company}
          onClose={() => setIsPayslipModalOpen(false)}
        />
      )}
    </Card>
  );
}
