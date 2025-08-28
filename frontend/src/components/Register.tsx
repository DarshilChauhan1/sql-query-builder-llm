import { zodResolver } from "@hookform/resolvers/zod";
import { AuthRegisterSchema } from "../schema/auth.schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../store/services/auth.service";
import { useToastUtils } from "../hooks/useToastUtils";

interface RegisterFormInputs {
    name: string;
    email: string;
    password: string;
}

export const RegisterForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>({
        resolver: zodResolver(AuthRegisterSchema)
    });
    const [showPassword, setShowPassword] = useState(false);
    const [signup, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();

    const commonToasts = useToastUtils().commonToasts;

    const onSubmit = async (data: RegisterFormInputs) => { 
        try {
            const { name, email, password } = data;
            
            // First, make the registration API call with just the email
            // (Based on your API, it seems to only expect email for initial registration)
            const response = await signup({ email }).unwrap();
            
            if(response.success) {
                commonToasts.success('Registration initiated! Please verify your email.');
                
                // Get the hash and otpExpiry from the response
                const { hash, otpExpiry } = response.data;
                
                // Navigate to the verify OTP page with all the necessary data
                // including the name and password that will be sent during OTP verification
                navigate('/verify-otp', {
                    state: {
                        registrationData: {
                            name,
                            email,
                            password,
                            hash,
                            otpExpiry
                        }
                    }
                });
            }
        } catch (error: any) {
            console.error('Registration failed:', error);
            const errorMessage = error?.data?.message || 'Registration failed. Please try again.';
            commonToasts.error(errorMessage);
        }
    }
    return (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-slate-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-slate-700">
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Name Field */}
                    <div className="space-y-1">
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                            Full name
                        </label>
                        <input
                            {...register("name")}
                            type="text"
                            id="name"
                            autoComplete="name"
                            className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm 
                  placeholder-gray-400 dark:placeholder-slate-400
                  bg-white dark:bg-slate-800
                  text-gray-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
                  transition-all duration-200 ease-in-out
                  ${errors.name
                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                                }
                  transform hover:scale-[1.01] focus:scale-[1.01]
                `}
                            placeholder="Enter your full name"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400 animate-fadeIn">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                            Email address
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            id="email"
                            autoComplete="email"
                            className={`
                  block w-full px-3 py-2 border rounded-md shadow-sm 
                  placeholder-gray-400 dark:placeholder-slate-400
                  bg-white dark:bg-slate-800
                  text-gray-900 dark:text-slate-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
                  transition-all duration-200 ease-in-out
                  ${errors.email
                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                                }
                  transform hover:scale-[1.01] focus:scale-[1.01]
                `}
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400 animate-fadeIn">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                id="password"
                                autoComplete="new-password"
                                className={`
                    block w-full px-3 py-2 pr-10 border rounded-md shadow-sm 
                    placeholder-gray-400 dark:placeholder-slate-400
                    bg-white dark:bg-slate-800
                    text-gray-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900
                    transition-all duration-200 ease-in-out
                    ${errors.password
                                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                                    }
                    transform hover:scale-[1.01] focus:scale-[1.01]
                  `}
                                placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L18.364 18.364M4.929 4.929l14.142 14.142" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-600 dark:text-red-400 animate-fadeIn">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Terms and Privacy */}
                    <div className="flex items-start mt-9">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-blue-600  focus:ring-blue-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800 rounded"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-slate-300">
                            I agree to the{' '}
                            <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                                Privacy Policy
                            </Link>
                        </label>
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
                  focus:ring-offset-white dark:focus:ring-offset-slate-800
                  transition-all duration-200 ease-in-out
                  ${isLoading || isSubmitting
                                    ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                                }
                `}
                        >
                            {(isLoading || isSubmitting) && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}

                            <span className="relative">
                                {isLoading || isSubmitting ? 'Creating account...' : 'Create account'}
                            </span>

                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:animate-shine"></div>
                        </button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <div className="flex justify-center space-x-6 text-sm text-slate-400">
                    <Link to="/about" className="hover:text-slate-300 transition-colors duration-200">
                        About
                    </Link>
                    <Link to="/privacy" className="hover:text-slate-300 transition-colors duration-200">
                        Privacy
                    </Link>
                    <Link to="/terms" className="hover:text-slate-300 transition-colors duration-200">
                        Terms
                    </Link>
                    <Link to="/help" className="hover:text-slate-300 transition-colors duration-200">
                        Help
                    </Link>
                </div>
            </div>
        </div>
    )
}