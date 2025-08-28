import { BrowserRouter, Route, Routes } from "react-router-dom"
import { LoginPage } from "../pages/LoginPage"
import { RegisterPage } from "../pages/RegisterPage"
import { VerifyOtpPage } from "../pages/VerifyOtpPage"
import { DashboardPage } from "../pages/DashboardPage"
import { WorkspaceDetailPage } from "../pages/WorkspaceDetailPage"
import { LandingPage } from "../pages/LandingPage"
import { ProtectedRoute } from "./ProtectedRoutes"

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/workspace/:id" element={
                    <ProtectedRoute>
                        <WorkspaceDetailPage />
                    </ProtectedRoute>
                } />
                <Route path="/about" element={
                    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-slate-100 mb-4">About</h1>
                            <p className="text-slate-400">Learn more about our SQL Query Builder</p>
                        </div>
                    </div>
                } />
                <Route path="/contact" element={
                    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-slate-100 mb-4">Contact</h1>
                            <p className="text-slate-400">Get in touch with our team</p>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    )
}