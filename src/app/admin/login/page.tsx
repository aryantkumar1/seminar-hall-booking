import { AuthForm } from '@/components/shared/AuthForm';

export default function AdminLoginPage() {
  return <AuthForm formType="login" userRole="admin" />;
}
