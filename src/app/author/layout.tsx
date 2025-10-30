import RoleBasedLayout from '@/components/RoleBasedLayout';

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout role="author">{children}</RoleBasedLayout>;
}
