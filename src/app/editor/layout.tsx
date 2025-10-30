import RoleBasedLayout from '@/components/RoleBasedLayout';

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <RoleBasedLayout role="editor">{children}</RoleBasedLayout>;
}
