
import React, { useState, useEffect } from 'react';
import { X, Mail, Smartphone, CheckCircle, QrCode } from 'lucide-react';
import { AuthMethod, User } from '../types';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [method, setMethod] = useState<AuthMethod>(AuthMethod.EMAIL);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setMethod(AuthMethod.EMAIL);
      setIsSignUp(false);
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert('Supabase client not initialized. Check .env.local');
      return;
    }
    setLoading(true);

    try {
      if (isReset) {
        // Reset Password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password', // You might need to handle this route
        });
        if (error) throw error;
        alert('重置邮件已发送！请检查您的邮箱。');
        setIsReset(false);
      } else if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          alert('注册成功！如果开启了邮箱验证，请查收邮件。');
          // If session exists (auto-confirm enabled), we can close
          if (data.session) onClose();
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      // Try to get the message from various possible properties
      const rawMsg = err.message || err.error_description || (typeof err === 'string' ? err : JSON.stringify(err));

      let displayMsg = rawMsg;
      if (rawMsg.includes('Invalid login credentials')) displayMsg = '账号不存在或密码错误 (请先注册)';
      else if (rawMsg.includes('User already registered')) displayMsg = '该邮箱已被注册，请直接登录';
      else if (rawMsg.includes('Password should be at least 6 characters')) displayMsg = '密码长度至少需要6位';

      // Force alert
      window.alert(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-slate-900" id="modal-title">
                  {isReset ? '重置密码' : (isSignUp ? '注册 HostGenie' : '登录 HostGenie')}
                </h3>
                <div className="mt-4">

                  {/* Tabs */}
                  <div className="flex border-b border-slate-200 mb-6">
                    <button
                      className={`flex-1 py-2 text-sm font-medium border-b-2 ${method === AuthMethod.EMAIL ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setMethod(AuthMethod.EMAIL)}
                    >
                      <Mail className="w-4 h-4 inline-block mr-2" />
                      邮箱
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-medium border-b-2 ${method === AuthMethod.WECHAT ? 'border-green-600 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      onClick={() => setMethod(AuthMethod.WECHAT)}
                    >
                      <Smartphone className="w-4 h-4 inline-block mr-2" />
                      微信 (Coming Soon)
                    </button>
                  </div>

                  {/* Email Form */}
                  {method === AuthMethod.EMAIL && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">邮箱地址</label>
                        <input
                          type="email"
                          required
                          placeholder="your@email.com"
                          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      {!isReset && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700">密码</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      )}

                      <Button type="submit" className="w-full" isLoading={loading}>
                        {isReset ? '发送重置邮件' : (isSignUp ? '注册账号' : '登录')}
                      </Button>

                      <div className="text-center mt-4 space-y-2">
                        {!isReset && (
                          <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="block w-full text-sm text-indigo-600 hover:text-indigo-500"
                          >
                            {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsReset(!isReset);
                            setIsSignUp(false);
                          }}
                          className="block w-full text-sm text-slate-500 hover:text-slate-700"
                        >
                          {isReset ? '返回登录' : '忘记密码？'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* WeChat Form */}
                  {method === AuthMethod.WECHAT && (
                    <div className="text-center py-8 text-slate-500">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>微信登录功能开发中...</p>
                      <p className="text-sm mt-2">请使用邮箱注册/登录</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
