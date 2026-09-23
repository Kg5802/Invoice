import React from 'react'
import Footer from './Component/Common/Footer.jsx'
import Header from './Component/Common/Header.jsx'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './Pages/Auth/Login.jsx'
import Signup from './Pages/Auth/Signup.jsx'
import OpenRoute from './Component/Auth/OpenRoute.jsx'
import ProtectedRoute from './Component/Auth/ProtectedRoute.jsx'
import ItemsPage from './Pages/Items/ItemsPage.jsx'
import InvoiceDashboard from './Pages/Invoice/InvoiceDashboard.jsx'
import InvoiceForm from './Pages/Invoice/InvoiceForm.jsx'

const App = () => {
    return (
        <div className='App'>
            <Header />
            <Routes>
                <Route element={<OpenRoute />}>
                    <Route path='/' element={<Login />} />
                    <Route path='/signup' element={<Signup />} />
                </Route>

                <Route >
                    <Route path='/items' element={<ItemsPage />} />
                    <Route path="/invoices" element={<InvoiceDashboard />} />
                    <Route path="/invoices/form" element={<InvoiceForm />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
        </div>
    )
}

export default App;
