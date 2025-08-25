import { useLoginMutation } from "../store/slices/auth.service";
import { useAppDispatch } from "../store/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLoginSchema } from "../schema/auth.schema";
import { setCredentials } from "../store/slices/auth.slice";
import { useAuthToast } from "../contexts/AuthToastContext";
import { useState } from "react";

export const LoginForm = () => {
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const authToast = useAuthToast();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(AuthLoginSchema)
    });

    const onSubmit = async (data: { email: string, password: string }) => {
        try {
            const response = await login(data).unwrap();
            if (response.success && response.data) {
                dispatch(setCredentials({ 
                    user: response.data.user,
                    token: response.data.token 
                }));
                authToast.loginSuccess(response.data.user.name);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            const errorMessage = err?.data?.message || 'Login failed. Please try again.';
            authToast.loginError(errorMessage);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="space-y-1">
                <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700"
                >
                    Email address
                </label>
                <div className="relative">
                    <input
                        {...register("email")}
                        type="email"
                        id="email"
                        autoComplete="email"
                        className={`
                            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            transition-all duration-200 ease-in-out
                            ${errors.email 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 hover:border-gray-400'
                            }
                            transform hover:scale-[1.01] focus:scale-[1.01]
                        `}
                        placeholder="Enter your email"
                    />
                    {/* GitHub-style focus indicator */}
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 transform scale-x-0 transition-transform duration-200 ease-out group-focus-within:scale-x-100"></div>
                </div>
                {errors.email && (
                    <p className="text-sm text-red-600 animate-fadeIn">{errors.email.message}</p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
                <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <div className="relative">
                    <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        autoComplete="current-password"
                        className={`
                            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            transition-all duration-200 ease-in-out
                            ${errors.password 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 hover:border-gray-400'
                            }
                            transform hover:scale-[1.01] focus:scale-[1.01]
                        `}
                        placeholder="Enter your password"
                    />
                    {/* Password toggle button */}
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L18.364 18.364M4.929 4.929l14.142 14.142" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-red-600 animate-fadeIn">{errors.password.message}</p>
                )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <a
                        href="/forgot-password"
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                        Forgot your password?
                    </a>
                </div>
            </div>

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className={`
                        group relative w-full flex justify-center py-2.5 px-4 border border-transparent 
                        text-sm font-medium rounded-md text-white 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                        transition-all duration-200 ease-in-out
                        ${isLoading || isSubmitting
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                        }
                    `}
                >
                    {/* Loading spinner */}
                    {(isLoading || isSubmitting) && (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    
                    {/* Button text with animation */}
                    <span className="relative">
                        {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
                    </span>
                    
                    {/* GitHub-style button shine effect */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:animate-shine"></div>
                </button>
            </div>
        </form>
    );
};