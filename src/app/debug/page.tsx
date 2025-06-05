'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DebugPage() {
  const [tokenInfo, setTokenInfo] = useState<{
    hasToken: boolean;
    hasUser: boolean;
    token?: string;
    user?: string;
  }>({
    hasToken: false,
    hasUser: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      setTokenInfo({
        hasToken: !!token,
        hasUser: !!user,
        token: token ? token.substring(0, 50) + '...' : undefined,
        user: user || undefined,
      });
    }
  }, []);

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('authChanged'));
      
      setTokenInfo({
        hasToken: false,
        hasUser: false,
      });
      
      alert('Storage cleared! Please refresh the page.');
    }
  };

  const testAPI = async () => {
    try {
      const response = await api.getCurrentUser();
      console.log('API Test Result:', response);
      alert(`API Test: ${response.error ? 'Failed - ' + response.error : 'Success'}`);
    } catch (error) {
      console.error('API Test Error:', error);
      alert('API Test Failed: ' + error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Token Status</h2>
          <p>Has Token: {tokenInfo.hasToken ? '✅ Yes' : '❌ No'}</p>
          <p>Has User: {tokenInfo.hasUser ? '✅ Yes' : '❌ No'}</p>
          {tokenInfo.token && <p>Token: {tokenInfo.token}</p>}
          {tokenInfo.user && <p>User: {tokenInfo.user}</p>}
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={clearStorage}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear Storage
          </button>
          
          <button 
            onClick={testAPI}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test API
          </button>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>If you see old tokens, click "Clear Storage"</li>
            <li>Go to <a href="/faculty/login" className="text-blue-600 underline">/faculty/login</a> and log in</li>
            <li>Come back here and click "Test API" to verify</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
