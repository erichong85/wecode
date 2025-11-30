import React from 'react';
import { Layout, LogOut, Plus, Globe, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { Button } from './Button';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, onLoginClick }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo always navigates to Landing Page now */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('landing')} title="回到首页">
            <Globe className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-slate-900">首页</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button variant="secondary" size="sm" onClick={() => onNavigate('admin')} className="hidden sm:inline-flex">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    后台管理
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="hidden sm:inline-flex">
                  <Layout className="w-4 h-4 mr-2" />
                  控制台
                </Button>
                <Button variant="primary" size="sm" onClick={() => onNavigate('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建网站
                </Button>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold ml-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout} title="退出登录">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={onLoginClick}>登录</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};