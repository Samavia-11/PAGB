import RoleBasedLayout from '@/components/RoleBasedLayout';

export default function ReviewerLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout role="reviewer">{children}</RoleBasedLayout>;
}
