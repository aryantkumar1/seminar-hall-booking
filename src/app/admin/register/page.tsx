import { AuthForm } from '@/components/shared/AuthForm';

export default function AdminRegisterPage() {
  return <AuthForm formType="register" userRole="admin" />;
}
