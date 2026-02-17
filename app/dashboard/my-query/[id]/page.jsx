"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useStudent } from '@/app/context/StudentContext';
import {
    Send,
    Paperclip,
    Download,
    ChevronLeft,
    Clock,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    FileText,
    Image
} from 'lucide-react';

const QueryDetail = () => {
    const { id } = useParams();
    const { queries } = useStudent();
    const router = useRouter();

    // Find query from context
    const query = queries.find(q => q.id === parseInt(id));

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'System',
            content: 'Query received. An instructor will review it shortly.',
            timestamp: new Date().toLocaleString(),
            isTeacher: true,
            avatar: 'SYS'
        }
    ]);

    // If query not found (e.g. invalid ID), handle gracefully
    useEffect(() => {
        if (!query && queries.length > 0) {
            // Only redirect if queries are loaded but id is not found
            // For now, we just let it render a "Not Found" state
        }
    }, [query, queries]);

    if (!query) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-center">
                <h2 className="text-xl font-bold text-gray-800">Query not found</h2>
                <Link href="/dashboard/my-query" className="text-indigo-600 hover:underline mt-4 block">
                    Back to Queries
                </Link>
            </div>
        )
    }

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                sender: 'You',
                content: message,
                timestamp: new Date().toLocaleString(),
                isTeacher: false,
                avatar: 'JS'
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const attachments = [
        // Static attachments for demo
        { name: 'document.pdf', size: '2.3 MB', type: 'pdf', icon: FileText },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            {/* Back Navigation */}
            <Link href="/dashboard/my-query" className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to Queries
            </Link>

            {/* Query Info Card */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-bold text-gray-800">{query.subject}</h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    query.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                        'bg-green-100 text-green-800 border-green-200'
                                }`}>
                                {query.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                                <FileText className="h-4 w-4 mr-1" />
                                Query #{query.id}
                            </span>
                            <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Created on {query.date}
                            </span>
                        </div>
                    </div>
               
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {query.description}
                    </p>
                </div>

                {/* Attachments Section */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attachments ({attachments.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {attachments.map((file, index) => {
                            const Icon = file.icon;
                            return (
                                <div key={index} className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <Icon className="h-8 w-8 text-gray-400 mr-2" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{file.size}</p>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400 hover:text-indigo-600" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Query Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 flex items-center mb-1">
                            <User className="h-3 w-3 mr-1" />
                            Assigned Teacher
                        </p>
                        <p className="text-sm font-medium text-gray-800">{query.teacher || 'Unassigned'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Department</p>
                        <p className="text-sm font-medium text-gray-800">General</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 flex items-center mb-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Priority
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full inline-block">
                            Normal
                        </span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 flex items-center mb-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Last Updated
                        </p>
                        <p className="text-sm font-medium text-gray-800">Just now</p>
                    </div>
                </div>
            </div>

            {/* Chat Section */}
            <div className="card">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Discussion</h3>
                </div>

                {/* Messages */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isTeacher ? 'justify-start' : 'justify-end'}`}>
                            <div className={`flex max-w-[80%] md:max-w-[70%] ${msg.isTeacher ? 'flex-row' : 'flex-row-reverse'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 ${msg.isTeacher ? 'mr-3' : 'ml-3'}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${msg.isTeacher ? 'bg-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {msg.avatar}
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div>
                                    <div className={`rounded-2xl p-4 shadow-sm ${msg.isTeacher
                                            ? 'bg-gray-100 text-gray-800 rounded-tl-none'
                                            : 'bg-indigo-600 text-white rounded-tr-none'
                                        }`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                    <div className={`flex items-center mt-1 text-xs text-gray-500 ${msg.isTeacher ? 'justify-start' : 'justify-end'
                                        }`}>
                                        <span>{msg.sender}</span>
                                        <span className="mx-1">•</span>
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-100">
                    <form onSubmit={handleSendMessage}>
                        <div className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    rows="1"
                                    className="input-field pr-10 py-3 resize-none"
                                    style={{ minHeight: '46px' }}
                                />
                                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                            </div>
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className={`p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">Press Enter to send</p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QueryDetail;