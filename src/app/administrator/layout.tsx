import RoleBasedLayout from '@/components/RoleBasedLayout';

export default function AdministratorLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout role="administrator">{children}</RoleBasedLayout>;
}
