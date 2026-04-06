import { useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized for Google Sign-In. Please add your Vercel domain to the Authorized Domains in your Firebase Console (Authentication -> Settings -> Authorized domains).");
      } else {
        setError(err.message || "An error occurred during sign in.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Payslip Generator</CardTitle>
          <CardDescription>Sign in to manage or view payslips</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {error && (
            <div className="w-full p-3 text-sm text-red-800 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          <Button onClick={handleLogin} className="w-full">
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
