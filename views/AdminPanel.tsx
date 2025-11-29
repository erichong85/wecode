
import React, { useState } from 'react';
import { Users, Globe, Trash2, Eye, Shield, Search, Activity, Server, Clock } from 'lucide-react';
import { User, HostedSite } from '../types';
import { Button } from '../components/Button';

interface AdminPanelProps {
  users: User[];
  sites: HostedSite[];
  onDeleteUser: (userId: string) => void;
  onDeleteSite: (siteId: string) => void;
  onViewSite: (site: HostedSite) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, sites, onDeleteUser, onDeleteSite, onViewSite }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'SITES'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSites = sites.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.authorName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Calculate Stats
  const totalViews = sites.reduce((acc, site) => acc + site.views, 0);

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center text-slate-900 font-bold text-lg">
            <Shield className="w-6 h-6 mr-2 text-indigo-600" />
            后台管理系统
          </div>
          <p className="text-xs text-slate-500 mt-1">Version 1.1.0</p>
        </div>
        <div className="flex-1 py-4 space-y-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'OVERVIEW' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Activity className="w-5 h-5 mr-3" />
            系统概览
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users className="w-5 h-5 mr-3" />
            用户管理
          </button>
          <button
            onClick={() => setActiveTab('SITES')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'SITES' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Globe className="w-5 h-5 mr-3" />
            网站管理
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'OVERVIEW' && '系统概览'}
              {activeTab === 'USERS' && '注册用户管理'}
              {activeTab === 'SITES' && '托管网站管理'}
            </h1>
            {activeTab !== 'OVERVIEW' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="搜索..." 
                  className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Overview Tab */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 text-sm font-medium">总注册用户</h3>
                    <Users className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    ↑ 12% 较上周
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 text-sm font-medium">托管网站总数</h3>
                    <Globe className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-lg" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{sites.length}</p>
                  <p className="text-xs text-green-600 mt-2 flex items-center">
                    ↑ 5 新增今日
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 text-sm font-medium">总浏览量 (Views)</h3>
                    <Activity className="w-8 h-8 text-orange-500 bg-orange-50 p-1.5 rounded-lg" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    全平台累计
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">系统状态</h3>
                <div className="flex items-center space-x-4 text-sm">
                   <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      服务器运行正常
                   </div>
                   <div className="flex items-center text-slate-600">
                      <Server className="w-4 h-4 mr-2" />
                      Database: Connected (LocalStorage)
                   </div>
                   <div className="flex items-center text-slate-600">
                      CPU 使用率: 12%
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'USERS' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">用户</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">角色</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">注册时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">最后登录</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(user.lastLoginAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role !== 'admin' && (
                          <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                            删除
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                 <div className="p-8 text-center text-slate-500">未找到用户</div>
              )}
            </div>
          )}

          {/* Sites Tab */}
          {activeTab === 'SITES' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">网站标题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">作者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">浏览量</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredSites.map((site) => (
                    <tr key={site.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{site.title}</div>
                            <div className="text-xs text-slate-500">ID: {site.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {site.authorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {site.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${site.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {site.published ? '已上线' : '草稿'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button onClick={() => onViewSite(site)} className="text-indigo-600 hover:text-indigo-900">
                          预览
                        </button>
                        <button onClick={() => onDeleteSite(site.id)} className="text-red-600 hover:text-red-900">
                          下架
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSites.length === 0 && (
                 <div className="p-8 text-center text-slate-500">未找到网站</div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
