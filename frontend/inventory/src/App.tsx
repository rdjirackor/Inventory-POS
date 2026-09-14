import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Cashiers from "./pages/Cashiers";
import { AuthProvider } from "./context/AuthContext";


import UpdatePage from "./pages/UpdatePage";
import CreateProduct from "./pages/CreateProducts";

const token = localStorage.getItem("access_token")

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/login"
                        element={
                            !token ? (
                                <LoginPage />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        }
                    />

                    <Route
                        path="/"
                        element={
                            !token ? (
                                <Navigate to="/login" replace />
                            ) : (
                                <Navigate to="/dashboard" replace />
                            )
                        }
                    />

                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                            }
                    >
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id/edit" element={<UpdatePage />} />
                        <Route path="/products/create" element={<CreateProduct />} />


                        <Route path="/categories" element={<Categories />} />
                        <Route path="/suppliers" element={<Suppliers />} />
                        <Route path="/cashiers" element={<Cashiers />} />
                        <Route path="/products/:product_id" element={<UpdatePage />} />
                    </Route>    

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;