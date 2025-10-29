'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, Phone, CreditCard, GraduationCap, UserCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Login fields
    username: '',
    password: '',
    // Registration fields
    fullName: '',
    fatherName: '',
    cnic: '',
    contactNumber: '',
    qualification: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate role for sign up
    if (isSignUp && !['author', 'reviewer'].includes(formData.role)) {
      setError('Please select a valid role (Author or Reviewer only).');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Route to role-specific dashboards
        if (data.user.role === 'author') {
          router.push('/Author/dashboard');
        } else if (data.user.role === 'reviewer') {
          router.push('/reviewer/dashboard');
        } else if (data.user.role === 'editor' || data.user.role === 'editor_in_chief' || data.user.role === 'assistant_editor') {
          router.push('/editor/dashboard');
        } else if (data.user.role === 'administrator' || data.user.role === 'patron' || data.user.role === 'patron_in_chief') {
          router.push('/administrator/dashboard');
        } else {
          router.push('/Author/dashboard');
        }
      } else {
        setError(data.message || `${isSignUp ? 'Registration' : 'Login'} failed. Please try again.`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(`${isSignUp ? 'Registration' : 'Login'} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isSignUp ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gradient-to-br from-slate-900 via-green-900 to-green-800 flex items-center justify-center px-4 ${isSignUp ? 'py-4' : 'py-12'}`}>
     
      <div className={`${isSignUp ? 'max-w-4xl w-full h-full max-h-[95vh] flex flex-col' : 'max-w-lg w-full'}`}>

        {/* Logo/Brand */}
        <div className={`text-center ${isSignUp ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`${isSignUp ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-white via-green-100 to-green-200 bg-clip-text text-transparent`}>
            PAGB
          </h1>
          <p className={`${isSignUp ? 'mt-1 text-green-200 text-sm' : 'mt-2 text-green-200'}`}>
            {isSignUp ? 'Create Your Account' : 'Welcome back'}
          </p>
        </div>

        {/* Form Card */}
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl ${isSignUp ? 'p-6 flex-1 overflow-hidden flex flex-col' : 'p-8'} border border-white/20`}>
          {/* Toggle Buttons */}
          <div className={`flex bg-gray-100 rounded-lg p-1 ${isSignUp ? 'mb-4' : 'mb-6'}`}>
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignUp 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignUp 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignUp ? (
            <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className={isSignUp ? "space-y-4" : "space-y-6"}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                {error}
              </div>
            )}

            {/* Registration Fields */}
            {isSignUp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Father Name */}
                <div>
                  <label htmlFor="fatherName" className="block text-xs font-medium text-gray-700 mb-1">
                    Father's Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="fatherName"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                      placeholder="Enter father's name"
                    />
                  </div>
                </div>

                {/* CNIC */}
                <div>
                  <label htmlFor="cnic" className="block text-xs font-medium text-gray-700 mb-1">
                    CNIC *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="cnic"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                      placeholder="XXXXX-XXXXXXX-X"
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                      placeholder="+92 XXX XXXXXXX"
                    />
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label htmlFor="qualification" className="block text-xs font-medium text-gray-700 mb-1">
                    Qualification *
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                      placeholder="e.g., PhD in Computer Science"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required={isSignUp}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select your role</option>
                      <option value="author">Author</option>
                      <option value="reviewer">Reviewer</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Username & Password Fields */}
            <div className={isSignUp ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-6"}>
              {/* Username Field */}
              <div>
                <label htmlFor="username" className={`block font-medium text-gray-700 ${isSignUp ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
                  Username *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isSignUp ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                      isSignUp 
                        ? 'pl-9 pr-3 py-2 text-sm' 
                        : 'pl-10 pr-4 py-3'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className={`block font-medium text-gray-700 ${isSignUp ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
                  Password *
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isSignUp ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                      isSignUp 
                        ? 'pl-9 pr-10 py-2 text-sm' 
                        : 'pl-10 pr-12 py-3'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className={isSignUp ? "w-4 h-4" : "w-5 h-5"} /> : <Eye className={isSignUp ? "w-4 h-4" : "w-5 h-5"} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg font-medium hover:from-green-800 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${
                isSignUp ? 'py-2.5 px-4 text-sm' : 'py-3 px-4'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className={`border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 ${isSignUp ? 'w-4 h-4' : 'w-5 h-5'}`}></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
            </form>


            {/* Toggle Link */}
            <div className={`text-center ${isSignUp ? 'mt-4' : 'mt-6'}`}>
              <p className={isSignUp ? 'text-xs text-gray-600' : 'text-sm text-gray-600'}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-green-700 hover:text-green-800 font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  {error}
                </div>
              )}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-800 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>


              {/* Toggle Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-green-700 hover:text-green-800 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
