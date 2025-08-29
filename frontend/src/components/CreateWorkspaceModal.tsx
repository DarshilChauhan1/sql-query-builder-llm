import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateWorkspaceMutation } from '../store/services/workspace.service';
import toast from 'react-hot-toast';
import {  WorkspaceSchema, type CreateWorkSpaceSchema } from '../schema/workspace.schema';

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
    const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm<CreateWorkSpaceSchema>({
        resolver: zodResolver(WorkspaceSchema),
        defaultValues: {
            name: '',
            description: '',
            databaseUrl: '',
            dbType: 'postgres'
        }
    });

    const selectedDbType = watch('dbType');

    const onSubmit = async (data: CreateWorkSpaceSchema) => {
        try {
            await createWorkspace(data).unwrap();
            toast.success('Workspace created successfully!');
            reset();
            onClose();
        } catch (error: any) {
            console.error('Failed to create workspace:', error);
            toast.error(error?.data?.message || 'Failed to create workspace');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const getConnectionStringExample = (dbType: string) => {
        switch (dbType) {
            case 'postgres':
                return 'postgresql://username:password@localhost:5432/database_name';
            case 'mysql':
                return 'mysql://username:password@localhost:3306/database_name';
            case 'mongodb':
                return 'mongodb://username:password@localhost:27017/database_name';
            default:
                return '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-600">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-100">Create New Workspace</h2>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-200 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Workspace Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                                Workspace Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="e.g., E-commerce Analytics"
                                {...register('name')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                placeholder="Brief description of your workspace..."
                                {...register('description')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Database Type */}
                        <div>
                            <label htmlFor="dbType" className="block text-sm font-medium text-slate-200 mb-2">
                                Database Type *
                            </label>
                            <select
                                id="dbType"
                                {...register('dbType')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="postgres">PostgreSQL</option>
                                <option value="mysql">MySQL</option>
                                <option value="mongodb">MongoDB</option>
                            </select>
                            {errors.dbType && (
                                <p className="mt-1 text-sm text-red-400">{errors.dbType.message}</p>
                            )}
                        </div>

                        {/* Database URL */}
                        <div>
                            <label htmlFor="databaseUrl" className="block text-sm font-medium text-slate-200 mb-2">
                                Database Connection String *
                            </label>
                            <input
                                id="databaseUrl"
                                type="text"
                                placeholder={getConnectionStringExample(selectedDbType)}
                                {...register('databaseUrl')}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.databaseUrl && (
                                <p className="mt-1 text-sm text-red-400">{errors.databaseUrl.message}</p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                                We'll test the connection before creating your workspace
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Workspace'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
