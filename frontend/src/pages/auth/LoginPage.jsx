import AuthCard from '../../components/auth/AuthCard';
import AuthFlow from '../../components/auth/AuthFlow';

const LoginPage = () => {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-softBg via-white to-softBg/40">
      <AuthCard>
        <AuthFlow />
      </AuthCard>
    </div>
  );
};

export default LoginPage;
