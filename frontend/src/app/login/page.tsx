'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(email, password);
            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            const dashboardRoute = user.role === 'ADMIN' ? '/admin' : user.role === 'TRANSPORTER' ? '/transporter' : '/driver';
            router.push(dashboardRoute);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand to-brand-light flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <Truck className="text-brand" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Fleet Management</h1>
                    <p className="text-indigo-100">Sign in to manage your fleet</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none" placeholder="you@example.com" required />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none" placeholder="" required />
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-3" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
                    </form>

                    <div className="mt-6 space-y-2">
                        <p className="text-center text-sm font-medium text-gray-700">Test Credentials:</p>
                        <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex justify-between px-4"><span>Admin:</span><span className="font-mono">admin@fleet.com</span></div>
                            <div className="flex justify-between px-4"><span>Transporter:</span><span className="font-mono">transporter1@fleet.com</span></div>
                            <div className="flex justify-between px-4"><span>Driver:</span><span className="font-mono">driver1@fleet.com</span></div>
                            <div className="text-center mt-2"><span className="font-mono bg-gray-100 px-2 py-1 rounded">Password: password123</span></div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6 text-indigo-100 text-sm">
                    <p> 2026 Fleet Management System</p>
                </div>
            </div>
        </div>
    );
}
