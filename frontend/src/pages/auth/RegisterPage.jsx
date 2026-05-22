import { Navigate } from 'react-router-dom';

/** Registration is part of the unified /login flow (email → profile → password or code). */
const RegisterPage = () => <Navigate to="/login" replace />;

export default RegisterPage;
