import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Layout from "@/Layouts/Layout";
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
                                  auth,
                                  status,
                                  canResetPassword,
                              }: {
    auth: any;
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <Layout auth={auth}>
            <Head title="Log in" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="mb-6 text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                    </div>

                    {status && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email"
                                className="block text-sm font-medium text-gray-700"
                            />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Enter your email"
                            />

                            <InputError message={errors.email} className="mt-2 text-sm text-red-600" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="block text-sm font-medium text-gray-700"
                            />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter your password"
                            />

                            <InputError message={errors.password} className="mt-2 text-sm text-red-600" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ms-2 block text-sm text-gray-900">
                                    Remember me
                                </span>
                            </div>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <div>
                            <PrimaryButton
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={processing}
                            >
                                {processing ? 'Logging in...' : 'Log in'}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account? {' '}
                            <Link
                                href={route('register')}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
