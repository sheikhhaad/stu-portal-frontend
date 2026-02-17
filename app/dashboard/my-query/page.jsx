'use client';

import { useStudent } from '@/app/context/StudentContext';
import Link from 'next/link';
import { Search, Filter, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MyQueries() {
    const { queries } = useStudent();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const filteredQueries = queries.filter(query => {
        const matchesFilter = filter === 'All' || query.status === filter;
        const matchesSearch = query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            query.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Queries</h1>
                    <p className="text-gray-500 mt-1">Manage and track the status of your requests.</p>
                </div>
                <Link href="/dashboard/submit-query" className="btn-primary flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    New Query
                </Link>
            </div>

            {/* Filters and Search */}
            <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search queries..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Queries List */}
            <div className="space-y-4">
                {filteredQueries.length > 0 ? (
                    filteredQueries.map((query) => (
                        <div key={query.id} className="card p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-indigo-500">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(query.status)}`}>
                                            {query.status}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {query.date}
                                        </span>
                                        <span className="text-sm text-gray-500">• {query.teacher}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{query.subject}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{query.description}</p>

                                    {query.response && (
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 mt-2">
                                            <span className="font-medium text-indigo-700">Latest Response: </span>
                                            <span className="text-gray-700">{query.response}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end">
                                    <button onClick={() => router.push(`/dashboard/my-query/${query.id}`)} className="text-gray-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100">
                                        <ChevronRight className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No queries found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or create a new query.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

