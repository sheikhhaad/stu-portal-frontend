'use client';

import Link from 'next/link'
import { MessageSquare, CheckCircle, Clock, ChevronRight, AlertCircle, FileText } from 'lucide-react'
import { useStudent } from '@/app/context/StudentContext'

export default function Dashboard() {
    const { getStats, queries } = useStudent();
    const statsData = getStats();

    const stats = [
        { label: 'Pending Queries', value: statsData.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Resolved Queries', value: statsData.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Unread Messages', value: statsData.unreadMessages, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100' },
    ]

    const recentQueries = queries.slice(0, 3); // Get last 3 queries

    const quickActions = [
        { label: 'New Query', icon: MessageSquare, color: 'text-indigo-600', href: '/dashboard/submit-query' },
        { label: 'My Queries', icon: FileText, color: 'text-purple-600', href: '/dashboard/my-query' }, // Corrected href
        { label: 'Profile', icon: AlertCircle, color: 'text-blue-600', href: '/profile' }, // Placeholder
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
                    <p className="text-indigo-100 max-w-xl">Track your academic queries, get updates on your requests, and stay connected with your instructors.</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div key={index} className="card p-6 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-4xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.bg} p-4 rounded-2xl`}>
                                    <Icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Queries */}
                <div className="lg:col-span-2 card overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            Recent Queries
                        </h2>
                        <Link href="/dashboard/my-query" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors">
                            View All
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 flex-1">
                        {recentQueries.length > 0 ? (
                            recentQueries.map((query) => (
                                <Link href="#" key={query.id} className="block hover:bg-gray-50 transition duration-150"> {/* Placeholder link */}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                            query.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                                'bg-green-100 text-green-800 border border-green-200'
                                                        }`}>
                                                        {query.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{query.date}</span>
                                                </div>
                                                <h3 className="font-semibold text-gray-800 text-lg mb-1">{query.subject}</h3>
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{query.description}</p>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                                                        {query.teacher || 'General'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-300 ml-4" />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p>No queries found. Start by creating one!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="card p-6 h-fit sticky top-24">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon
                            return (
                                <Link key={index} href={action.href} className="block">
                                    <div className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md hover:bg-indigo-50/30 transition-all duration-200 flex flex-col items-center text-center h-full justify-center group">
                                        <div className={`p-3 rounded-full bg-gray-50 group-hover:bg-white mb-3 transition-colors ${action.color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{action.label}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}