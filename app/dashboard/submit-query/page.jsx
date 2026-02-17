'use client';

import { useState } from 'react';
import { useStudent } from '@/app/context/StudentContext';
import { useRouter } from 'next/navigation';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function SubmitQuery() {
    const { addQuery } = useStudent();
    const router = useRouter();
    const [formData, setFormData] = useState({
        subject: '',
        teacher: '',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate network delay
        setTimeout(() => {
            addQuery(formData);
            setIsSubmitting(false);
            router.push('/dashboard/my-query');
        }, 1000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Submit a New Query</h1>
                <p className="text-gray-500 mt-2">Fill out the details below to raise a concern or ask a question.</p>
            </div>

            <div className="card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g. Assignment Extension"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Instructor/Department</label>
                            <select
                                id="teacher"
                                name="teacher"
                                required
                                value={formData.teacher}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Select Recipient</option>
                                <option value="Dr. Smith">Dr. Smith (Computer Science)</option>
                                <option value="Prof. Johnson">Prof. Johnson (Physics)</option>
                                <option value="Dr. Williams">Dr. Williams (Mathematics)</option>
                                <option value="Administration">Administration</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows="6"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please provide detailed information about your query..."
                            className="input-field resize-none"
                        ></textarea>
                        <p className="text-xs text-gray-400 mt-2 text-right">0/500 characters</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                            <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
                            Most queries are resolved within 48 hours.
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`btn-primary flex items-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    Submit Query
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}