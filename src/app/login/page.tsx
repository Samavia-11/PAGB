'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

interface LoginData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [currentView, setCurrentView] = useState<'main' | 'login' | 'signup'>('main');
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
    qualification: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<number | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const router = useRouter();

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
            redirectUrl = '/dashboard/editor';
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
        setError(data.error || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if username has errors
    if (usernameError) {
      setError('Please fix the username error before submitting');
      setLoading(false);
      return;
    }

    try {
      // Check if username already exists in database
      const usernameCheckResponse = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: signupData.username }),
      });

      if (usernameCheckResponse.ok) {
        const usernameCheckData = await usernameCheckResponse.json();
        if (usernameCheckData.exists) {
          setError('Username already exists. Please choose a different username.');
          setLoading(false);
          return;
        }
      }

      // Check if username exists in pending requests (localStorage)
      const requests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
      const existingRequest = requests.find((req: any) => 
        req.username.toLowerCase() === signupData.username.toLowerCase()
      );
      
      if (existingRequest) {
        setError('A request with this username is already pending. Please choose a different username.');
        setLoading(false);
        return;
      }

      // Save signup request to localStorage
      const newRequest = {
        id: Date.now(),
        ...signupData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      requests.push(newRequest);
      localStorage.setItem('signup_requests', JSON.stringify(requests));
      
      // Notify admin panel about new request
      if ('BroadcastChannel' in window) {
        const adminChannel = new BroadcastChannel('admin_notifications');
        adminChannel.postMessage({ 
          type: 'new_request', 
          request: newRequest 
        });
        adminChannel.close();
      }
      
      setRequestStatus('pending');
      setCurrentRequestId(newRequest.id);
      setLoading(false);
      
      // Return to main view instead of showing processing screen
      setCurrentView('main');
      
      // Listen for real-time status updates from admin
      let statusChannel: BroadcastChannel | null = null;
      if ('BroadcastChannel' in window) {
        statusChannel = new BroadcastChannel('request_status_updates');
        statusChannel.onmessage = (event) => {
          const { requestId, newStatus } = event.data;
          if (requestId === newRequest.id) {
            setRequestStatus(newStatus);
            statusChannel?.close();
          }
        };
      }
      
      // Fallback: Check request status periodically
      const checkStatus = () => {
        const currentRequests = JSON.parse(localStorage.getItem('signup_requests') || '[]');
        const myRequest = currentRequests.find((req: any) => req.id === newRequest.id);
        if (myRequest && myRequest.status !== 'pending') {
          setRequestStatus(myRequest.status);
          statusChannel?.close();
        } else if (myRequest && myRequest.status === 'pending') {
          setTimeout(checkStatus, 2000);
        }
      };
      setTimeout(checkStatus, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
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
    
    setSignupData({
      ...signupData,
      [name]: value
    });

    // Clear username error when user starts typing a new username
    if (name === 'username' && usernameError) {
      setUsernameError('');
    }
  };

  const renderMainView = () => (
    <div className="absolute p-0 space-y-8" style={{ top: '52%', left: '63%', transform: 'translate(-50%, -50%)' }}>
      {/* Welcome Text */}
      <div className="text-center mb-6">
      </div>
      
      {/* Main Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={() => setCurrentView('login')}
          className="w-56 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>Login</span>
        </button>
        
        <button
          onClick={() => setCurrentView('signup')}
          className={`w-56 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 ${
            requestStatus === 'pending' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800' :
            requestStatus === 'approved' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' :
            requestStatus === 'rejected' ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' :
            'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
          } text-white`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {requestStatus === 'pending' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : requestStatus === 'approved' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : requestStatus === 'rejected' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            )}
          </svg>
          <span>
            {requestStatus === 'pending' ? 'Request Pending' :
             requestStatus === 'approved' ? 'Request Approved' :
             requestStatus === 'rejected' ? 'Request Rejected' :
             'Request Access'}
          </span>
        </button>
      </div>
    </div>
  );

  const renderLoginView = () => (
    <div className="absolute p-0 space-y-6" style={{ top: '52%', left: '63%', transform: 'translate(-50%, -50%)' }}>
      {/* Header */}
      <div className="text-center mb-6">
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <input
              name="username"
              type="text"
              required
              value={loginData.username}
              onChange={handleLoginChange}
              className="w-56 px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300"
              placeholder="Username"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              required
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-56 px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-56 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setCurrentView('main')}
            className="w-56 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderSignupView = () => (
    <div className="absolute p-0" style={{ top: '50%', left: '20%', transform: 'translate(-50%, -50%)' }}>
      {requestStatus ? (
        <div className="space-y-6 text-center">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Request Status</h3>
          </div>
          
          <div className={`p-6 rounded-xl backdrop-blur-sm shadow-lg ${
            requestStatus === 'pending' ? 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-100' :
            requestStatus === 'approved' ? 'bg-blue-500/20 border border-blue-400/50 text-blue-100' :
            'bg-red-500/20 border border-red-400/50 text-red-100'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-3">
              {requestStatus === 'pending' && (
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {requestStatus === 'approved' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {requestStatus === 'rejected' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-semibold">
                {requestStatus === 'pending' && 'Processing Request...'}
                {requestStatus === 'approved' && 'Request Approved!'}
                {requestStatus === 'rejected' && 'Request Rejected'}
              </span>
            </div>
            <p className="text-sm opacity-90">
              {requestStatus === 'pending' && 'Your account request is being reviewed by our administrators.'}
              {requestStatus === 'approved' && 'Your account has been approved! You can now login with your credentials.'}
              {requestStatus === 'rejected' && 'Your account request was not approved. Please contact support for more information.'}
            </p>
          </div>
          
          <button
            onClick={() => {
              setCurrentView('main');
              setRequestStatus(null);
              setSignupData({
                username: '',
                email: '',
                role: '',
                password: '',
                confirmPassword: '',
                fatherName: '',
                cnic: '',
                contactNumber: '',
                qualification: ''
              });
            }}
            className="w-56 bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Main</span>
          </button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
          </div>

          <form onSubmit={handleSignup} className="space-y-3 w-full max-w-lg">
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Row 1: Username and CNIC */}
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <input
                    name="username"
                    type="text"
                    required
                    value={signupData.username}
                    onChange={handleSignupChange}
                    className={`w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent shadow-md transition-all duration-300 text-sm font-medium ${
                      usernameError 
                        ? 'border-red-400 focus:ring-red-500' 
                        : signupData.username && !checkingUsername && !usernameError
                        ? 'border-green-400 focus:ring-emerald-500'
                        : 'border-white/40 focus:ring-emerald-500'
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
                  {!checkingUsername && signupData.username && !usernameError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {usernameError && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {usernameError && (
                    <div className="text-red-200 text-xs mt-1 px-2">
                      {usernameError}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    name="cnic"
                    type="text"
                    required
                    value={signupData.cnic}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
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
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
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
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
                    placeholder="Contact Number (e.g., +92-300-1234567)"
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
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
                    placeholder="Email Address"
                  />
                </div>
                <div className="flex-1">
                  <select
                    name="role"
                    required
                    value={signupData.role}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
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
                  className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
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
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
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
                    className="w-full px-3 py-2.5 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg placeholder:text-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-md transition-all duration-300 text-sm"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentView('main')}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2.5 px-4 rounded-lg backdrop-blur-sm border border-white/30 transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
        </form>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'url(/logo.png)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}></div>
      <div className="relative z-10 w-full h-full">
        <div className="w-full h-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-academic-900"></h2>
            <p className="mt-2 text-sm text-academic-600"></p>
          </div>

          {/* Dynamic Content Based on Current View */}
          {currentView === 'main' && renderMainView()}
          {currentView === 'login' && renderLoginView()}
          {currentView === 'signup' && renderSignupView()}

          {/* Footer */}
          <div className="text-center text-sm text-academic-500">
            <p></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
