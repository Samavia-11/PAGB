'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { Eye, EyeOff, Lock, Save, Settings, User as UserIcon } from 'lucide-react';

const normalizeDigits = (value: string) => String(value || '').replace(/\D/g, '');
const formatCnic = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 13);
  const p1 = digits.slice(0, 5);
  const p2 = digits.slice(5, 12);
  const p3 = digits.slice(12, 13);
  if (digits.length <= 5) return p1;
  if (digits.length <= 12) return `${p1}-${p2}`;
  return `${p1}-${p2}-${p3}`;
};
const formatContactNumber = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 11);
  const p1 = digits.slice(0, 4);
  const p2 = digits.slice(4);
  if (digits.length <= 4) return p1;
  return `${p1}-${p2}`;
};

const validateStrongPassword = (value: string): string | null => {
  const v = String(value || '');
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (v.length > 128) return 'Password must be less than 128 characters';
  if (!/[A-Z]/.test(v)) return 'Password must include at least 1 uppercase letter';
  if (!/[a-z]/.test(v)) return 'Password must include at least 1 lowercase letter';
  if (!/\d/.test(v)) return 'Password must include at least 1 digit';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must include at least 1 special character';
  return null;
};

interface MeUser {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
  email?: string;
}

interface ProfileUser {
  id: number;
  username: string;
  email: string | null;
  fullName: string | null;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  createdAt: string | null;
  fatherName: string | null;
  cnic: string | null;
  contactNumber: string | null;
  qualification: string | null;
}

const DashboardSettingsPage = () => {
  const router = useRouter();
  const [me, setMe] = useState<MeUser | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    fullName: '',
    fatherName: '',
    cnic: '',
    contactNumber: '',
    qualification: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const inputClassName =
    'w-full rounded-md border border-academic-200 bg-white px-3 py-2 text-academic-900 placeholder:text-academic-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-academic-50 disabled:text-academic-700';

  const createdAtText = useMemo(() => {
    if (!profile?.createdAt) return '—';
    const d = new Date(profile.createdAt);
    if (Number.isNaN(d.getTime())) return profile.createdAt;
    return d.toLocaleString();
  }, [profile?.createdAt]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setMe(data.user);

        const p = await fetch('/api/auth/profile');
        if (!p.ok) {
          setProfileError('Failed to load profile');
          return;
        }
        const pdata = await p.json();
        setProfile(pdata.user);
        setProfileForm({
          username: pdata.user?.username || '',
          email: pdata.user?.email || '',
          fullName: pdata.user?.fullName || '',
          fatherName: pdata.user?.fatherName || '',
          cnic: formatCnic(pdata.user?.cnic || ''),
          contactNumber: formatContactNumber(pdata.user?.contactNumber || ''),
          qualification: pdata.user?.qualification || '',
        });
      } catch (e) {
        console.error('Settings init error:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const saveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileForm.username,
          email: profileForm.email,
          fullName: profileForm.fullName,
          fatherName: profileForm.fatherName,
          cnic: profileForm.cnic,
          contactNumber: profileForm.contactNumber,
          qualification: profileForm.qualification,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileError(data?.error || 'Failed to update profile');
        setSavingProfile(false);
        return;
      }

      const p = await fetch('/api/auth/profile');
      if (p.ok) {
        const pdata = await p.json();
        setProfile(pdata.user);
      }

      setProfileSuccess('Profile updated successfully');
    } catch (e) {
      setProfileError('Network error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      setSavingPassword(false);
      return;
    }

    const pwError = validateStrongPassword(passwordForm.newPassword);
    if (pwError) {
      setPasswordError(pwError);
      setSavingPassword(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data?.error || 'Failed to change password');
        setSavingPassword(false);
        return;
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password updated successfully');
    } catch (e) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-academic-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return null;
  }

  return (
    <Layout user={me as any}>
      <div className="mb-6">
        <div className="flex items-center">
          <Settings className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-academic-900 font-serif">Account Settings</h1>
            <p className="text-academic-600 mt-1">View and update your profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-academic-900">Profile</h2>
            </div>
          </div>

          {profileError ? <div className="mt-4 text-sm text-red-600">{profileError}</div> : null}
          {profileSuccess ? <div className="mt-4 text-sm text-green-700">{profileSuccess}</div> : null}

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Role</label>
                <input className={inputClassName} value={profile?.role || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Created At</label>
                <input className={inputClassName} value={createdAtText} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Username</label>
                <input
                  className={inputClassName}
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Email</label>
                <input
                  className={inputClassName}
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">Full Name</label>
              <input
                className={inputClassName}
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Father Name</label>
                <input
                  className={inputClassName}
                  value={profileForm.fatherName}
                  onChange={(e) => setProfileForm({ ...profileForm, fatherName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Contact Number</label>
                <input
                  className={inputClassName}
                  value={profileForm.contactNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, contactNumber: formatContactNumber(e.target.value) })}
                  inputMode="numeric"
                  maxLength={12}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">CNIC</label>
                <input
                  className={inputClassName}
                  value={profileForm.cnic}
                  onChange={(e) => setProfileForm({ ...profileForm, cnic: formatCnic(e.target.value) })}
                  inputMode="numeric"
                  maxLength={15}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700 mb-2">Qualification</label>
                <input
                  className={inputClassName}
                  value={profileForm.qualification}
                  onChange={(e) => setProfileForm({ ...profileForm, qualification: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={saveProfile}
                className="btn-primary flex items-center"
                disabled={savingProfile}
              >
                <Save className="w-4 h-4 mr-2" />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-academic-900">Change Password</h2>
          </div>

          {passwordError ? <div className="mt-4 text-sm text-red-600">{passwordError}</div> : null}
          {passwordSuccess ? <div className="mt-4 text-sm text-green-700">{passwordSuccess}</div> : null}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  className={`${inputClassName} pr-10`}
                  type={showPassword.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-academic-500 hover:text-academic-700"
                  aria-label={showPassword.current ? 'Hide current password' : 'Show current password'}
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  className={`${inputClassName} pr-10`}
                  type={showPassword.next ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, next: !s.next }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-academic-500 hover:text-academic-700"
                  aria-label={showPassword.next ? 'Hide new password' : 'Show new password'}
                >
                  {showPassword.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  className={`${inputClassName} pr-10`}
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-academic-500 hover:text-academic-700"
                  aria-label={showPassword.confirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={savePassword}
                className="btn-primary flex items-center"
                disabled={savingPassword}
              >
                <Save className="w-4 h-4 mr-2" />
                {savingPassword ? 'Saving...' : 'Save Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardSettingsPage;
