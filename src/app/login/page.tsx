'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleFormError } from '@/lib/errorHandling';

interface SignupData {
  username: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  fatherName: string;
  cnic: string;
  contactNumber: string;
  qualification: string;
  securitySetup: '' | 'enabled';
  securityAnswer1: string;
  securityAnswer2: string;
}

const normalizeDigits = (value: string) => String(value || '').replace(/\D/g, '');
const sanitizeAlnumSpaces = (value: string) => String(value || '').replace(/[^A-Za-z0-9 ]+/g, '');
const sanitizeLettersSpaces = (value: string) => String(value || '').replace(/[^A-Za-z ]+/g, '');
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
const isLettersAndSpaces = (value: string) => /^[A-Za-z ]+$/.test(String(value || '').trim());
const isAlnumAndSpaces = (value: string) => /^[A-Za-z0-9 ]+$/.test(String(value || '').trim());

interface LoginData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({
    username: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    fatherName: '',
    cnic: '',
    contactNumber: '',
    qualification: '',
    securitySetup: '',
    securityAnswer1: '',
    securityAnswer2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotAnswer1, setForgotAnswer1] = useState('');
  const [forgotAnswer2, setForgotAnswer2] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState<string | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const router = useRouter();

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('verify');
    setForgotIdentifier('');
    setForgotAnswer1('');
    setForgotAnswer2('');
    setForgotResetToken(null);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotLoading(false);
  };

  const handleForgotVerify = async () => {
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier,
          securityAnswer1: forgotAnswer1,
          securityAnswer2: forgotAnswer2,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setForgotError(data?.error || 'Failed to verify details');
        setForgotLoading(false);
        return;
      }

      setForgotResetToken(data.resetToken);
      setForgotStep('reset');
      setForgotLoading(false);
    } catch (e) {
      setForgotError('Network error. Please try again.');
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async () => {
    setForgotLoading(true);
    setForgotError('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match');
      setForgotLoading(false);
      return;
    }

    const pwError = validateStrongPassword(forgotNewPassword);
    if (pwError) {
      setForgotError(pwError);
      setForgotLoading(false);
      return;
    }

    if (!forgotResetToken) {
      setForgotError('Reset session expired. Please try again.');
      setForgotLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetToken: forgotResetToken,
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setForgotError(data?.error || 'Failed to reset password');
        setForgotLoading(false);
        return;
      }

      closeForgotModal();
      setIsLogin(true);
      setTimeout(() => {
        alert('Password updated successfully! Please login with your new password.');
      }, 100);
    } catch (e) {
      setForgotError('Network error. Please try again.');
      setForgotLoading(false);
    }
  };

  // Check for existing request status on component mount
  useEffect(() => {
    const checkExistingRequest = () => {
      const savedRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
      // Check for any pending/approved/rejected requests
      const latestRequest = savedRequests
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      if (latestRequest) {
        setRequestStatus(latestRequest.status);
        setCurrentRequestId(latestRequest.id);
      }
    };

    checkExistingRequest();

    // Listen for real-time status updates
    if ('BroadcastChannel' in window) {
      const statusChannel = new BroadcastChannel('request_status_updates');
      statusChannel.onmessage = (event) => {
        const { requestId, newStatus } = event.data;
        if (requestId === currentRequestId) {
          setRequestStatus(newStatus);
        }
      };

      return () => {
        statusChannel.close();
      };
    }
  }, [currentRequestId]);

  // Debounced username check
  useEffect(() => {
    const checkUsername = async () => {
      if (!signupData.username || signupData.username.length < 3) {
        setUsernameError('');
        return;
      }

      setCheckingUsername(true);
      
      try {
        // Check database
        const response = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: signupData.username }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setUsernameError('Username already exists');
            setCheckingUsername(false);
            return;
          }
        }

        // Check localStorage for pending requests
        const requests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
        const existingRequest = requests.find((req: any) => 
          req.username.toLowerCase() === signupData.username.toLowerCase()
        );
        
        if (existingRequest) {
          setUsernameError('Username already requested');
        } else {
          setUsernameError('');
        }
      } catch (error) {
        console.error('Username check failed:', error);
      }
      
      setCheckingUsername(false);
    };

    const timeoutId = setTimeout(checkUsername, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [signupData.username]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clear any existing authentication first
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok && data.success) {
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('auth-token', data.token);
        }
        
        // Set cookie manually as well
        document.cookie = `auth-token=${data.token}; path=/; max-age=${24 * 60 * 60}`;
        
        // Role-based redirection
        const userRole = data.user?.role;
        console.log('User role:', userRole);
        let redirectUrl = '/';
        
        switch (userRole) {
          case 'author':
            redirectUrl = '/dashboard/author';
            break;
          case 'editor':
            redirectUrl = '/dashboard/editor/article-management';
            break;
          case 'reviewer':
            redirectUrl = '/dashboard/reviewer';
            break;
          case 'administrator':
            redirectUrl = '/dashboard/admin';
            break;
          default:
            redirectUrl = '/dashboard/author';
        }
        
        console.log('Redirecting to:', redirectUrl);
        
        // Redirect with a delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 500);
      } else {
        const errorMessage = handleFormError({ status: response.status, message: data?.error || data?.message || 'Login failed' }, 'login');
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = handleFormError(error, 'login');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLettersAndSpaces(signupData.username)) {
      setError('Full name can only contain letters and spaces');
      setLoading(false);
      return;
    }

    if (!isLettersAndSpaces(signupData.fatherName)) {
      setError('Father name can only contain letters and spaces');
      setLoading(false);
      return;
    }

    const cnicDigits = normalizeDigits(signupData.cnic);
    if (cnicDigits.length !== 13) {
      setError('CNIC must be exactly 13 digits');
      setLoading(false);
      return;
    }

    const contactDigits = normalizeDigits(signupData.contactNumber);
    if (contactDigits.length !== 11) {
      setError('Contact number must be exactly 11 digits');
      setLoading(false);
      return;
    }

    if (!contactDigits.startsWith('03')) {
      setError('Contact number must start with 03');
      setLoading(false);
      return;
    }

    if (!isLettersAndSpaces(signupData.qualification)) {
      setError('Highest qualification can only contain letters and spaces');
      setLoading(false);
      return;
    }

    if (signupData.securitySetup === 'enabled') {
      if (!isAlnumAndSpaces(signupData.securityAnswer1) || !isAlnumAndSpaces(signupData.securityAnswer2)) {
        setError('Security answers can only contain letters, numbers, and spaces');
        setLoading(false);
        return;
      }
    }

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const pwError = validateStrongPassword(signupData.password);
    if (pwError) {
      setError(pwError);
      setLoading(false);
      return;
    }

    // Check if username has errors
    if (usernameError) {
      setError('Please fix username error before submitting');
      setLoading(false);
      return;
    }

    if (signupData.securitySetup !== 'enabled') {
      setError('Please answer the security questions to reset your password.');
      setLoading(false);
      return;
    }

    if (!signupData.securityAnswer1.trim() || !signupData.securityAnswer2.trim()) {
      setError('Please answer both security questions.');
      setLoading(false);
      return;
    }

    try {
      // Call the signup API to create user directly
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          fullName: signupData.username,
          fatherName: signupData.fatherName,
          cnic: cnicDigits,
          contactNumber: contactDigits,
          qualification: signupData.qualification,
          role: signupData.role,
          securityAnswer1: signupData.securityAnswer1,
          securityAnswer2: signupData.securityAnswer2
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // User created successfully
        setLoading(false);
        // Switch to login view with success message
        setError('');
        setIsLogin(true);
        // Show success message
        setTimeout(() => {
          alert('Account created successfully! Please login with your credentials.');
        }, 100);
      } else {
        // Handle errors
        const errorMessage = handleFormError({ status: response.status, message: data?.message || data?.error || 'Registration failed' }, 'signup');
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      const errorMessage = handleFormError(error, 'signup');
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cnic') {
      setSignupData({
        ...signupData,
        cnic: formatCnic(value),
      });
    } else if (name === 'contactNumber') {
      setSignupData({
        ...signupData,
        contactNumber: formatContactNumber(value),
      });
    } else if (name === 'qualification') {
      setSignupData({
        ...signupData,
        qualification: sanitizeLettersSpaces(value),
      });
    } else if (name === 'securityAnswer1' || name === 'securityAnswer2') {
      setSignupData({
        ...signupData,
        [name]: sanitizeAlnumSpaces(value),
      } as any);
    } else {
      setSignupData({
        ...signupData,
        [name]: value
      });
    }

    // Clear username error when user starts typing a new username
    if (name === 'username' && usernameError) {
      setUsernameError('');
    }
  };

  const renderForm = () => (
    <div className="absolute bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {isLogin ? 'Welcome' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {isLogin ? 'Log in to your account to continue' : 'Create your account'}
        </p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            isLogin 
              ? 'bg-green-800 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setIsLogin(true)}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`w-1/2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            !isLogin 
              ? 'bg-green-800 text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {isLogin ? (
          // Login Form
          <>
            <div>
              <input
                name="username"
                type="text"
                required
                value={loginData.username}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Email or Username"
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Password"
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(loginData.username);
                  setShowForgotModal(true);
                }}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Forgot your password?
              </button>
            </div>
          </>
        ) : (
          // Signup Form
          <>
            <div className="space-y-3">
              {/* Row 1: Username and CNIC */}
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <input
                    name="username"
                    type="text"
                    required
                    value={signupData.username}
                    onChange={handleSignupChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200 text-sm ${
                      usernameError 
                        ? 'border-red-400' 
                        : signupData.username && !checkingUsername && !usernameError
                        ? 'border-green-400'
                        : 'border-gray-300'
                    }`}
                    placeholder="Full Name / Username"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {usernameError && (
                    <div className="text-red-500 text-xs mt-1">{usernameError}</div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    name="cnic"
                    type="text"
                    required
                    value={signupData.cnic}
                    onChange={handleSignupChange}
                    inputMode="numeric"
                    maxLength={15}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="CNIC (e.g., 12345-1234567-1)"
                  />
                </div>
              </div>

              {/* Row 2: Father's Name and Contact Number */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    name="fatherName"
                    type="text"
                    required
                    value={signupData.fatherName}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="Father's Name"
                  />
                </div>
                <div className="flex-1">
                  <input
                    name="contactNumber"
                    type="tel"
                    required
                    value={signupData.contactNumber}
                    onChange={handleSignupChange}
                    inputMode="numeric"
                    maxLength={12}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="Contact Number (e.g., 03XX-XXXXXXX)"
                  />
                </div>
              </div>

              {/* Row 3: Email Address and Role */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    name="email"
                    type="email"
                    required
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="Email Address"
                  />
                </div>
                <div className="flex-1">
                  <select
                    name="role"
                    required
                    value={signupData.role}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                  >
                    <option value="">Select Your Role</option>
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Qualification (full width) */}
              <div>
                <input
                  name="qualification"
                  type="text"
                  required
                  value={signupData.qualification}
                  onChange={handleSignupChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                  placeholder="Highest Qualification (e.g., PhD in Computer Science)"
                />
              </div>

              {/* Row 5: Password fields */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    name="password"
                    type="password"
                    required
                    value={signupData.password}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="Create Password"
                  />
                </div>
                <div className="flex-1">
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>

              <div>
                {!signupData.securitySetup ? (
                  <button
                    type="button"
                    onClick={() => setSignupData(prev => ({ ...prev, securitySetup: 'enabled' }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-800 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm font-medium"
                  >
                    Answer these questions for password reset
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-green-600 mb-1">
                    ✓ Security questions enabled
                  </div>
                )}
              </div>

              {signupData.securitySetup === 'enabled' ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">What is the name of your school?</div>
                    <input
                      name="securityAnswer1"
                      type="text"
                      required
                      value={signupData.securityAnswer1}
                      onChange={handleSignupChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                      placeholder="Answer"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">What is the name of the place where you were born?</div>
                    <input
                      name="securityAnswer2"
                      type="text"
                      required
                      value={signupData.securityAnswer2}
                      onChange={handleSignupChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 text-sm"
                      placeholder="Answer"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-800 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none transition-all duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : (
            isLogin ? 'Log In' : 'Create Account'
          )}
        </button>
      </form>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Forgot Password</h3>
              <p className="text-gray-600 text-sm mt-1">
                {forgotStep === 'verify' ? 'Answer the security questions' : 'Reset your password'}
              </p>
            </div>

            {forgotError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {forgotError}
              </div>
            )}

            {forgotStep === 'verify' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Email or Username"
                />

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">What is the name of your school?</div>
                  <input
                    type="text"
                    value={forgotAnswer1}
                    onChange={(e) => setForgotAnswer1(sanitizeAlnumSpaces(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Answer"
                  />
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">What is the name of the place where you were born?</div>
                  <input
                    type="text"
                    value={forgotAnswer2}
                    onChange={(e) => setForgotAnswer2(sanitizeAlnumSpaces(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Answer"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotVerify}
                    className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-white"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="New Password"
                />
                <input
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Confirm Password"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={forgotLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotResetPassword}
                    className="px-4 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-white"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Link */}
      <div className="text-center mt-6">
          <span className="text-gray-600">
          {isLogin ? "" : 'Already have an account?'}
        </span>
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </div>

          </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'a\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23166534\'/%3E%3Cstop offset=\'50%25\' stop-color=\'%23065f46\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%2310B981\'/%3E%3C/linearGradient%3E%3ClinearGradient id=\'b\' x1=\'100%25\' y1=\'0%25\' x2=\'0%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%2310B981\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23166534\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3E%3Cpath d=\'M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z\' fill=\'url(%23b)\' opacity=\'0.7\'/%3E%3Cpath d=\'M0,0 Q50,30 100,0 L100,40 Q50,60 0,40 Z\' fill=\'%2310B981\' opacity=\'0.3\'/%3E%3Ccircle cx=\'20\' cy=\'30\' r=\'15\' fill=\'%23166534\' opacity=\'0.4\'/%3E%3Ccircle cx=\'80\' cy=\'70\' r=\'20\' fill=\'%23065f46\' opacity=\'0.3\'/%3E%3C/svg%3E")',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}></div>
      <div className="relative z-10 w-full h-full">
        {renderForm()}
      </div>
    </div>
  );
};

export default LoginPage;
