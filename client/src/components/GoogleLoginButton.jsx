import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const { googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSuccess = async (credentialResponse) => {
    const res = await googleLogin(credentialResponse.credential);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Google Login failed');
    }
  };

  const handleError = () => {
    setErrorMsg('Google Login was unsuccessful. Try again.');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        shape="rectangular"
        size="large"
        theme="filled_blue"
        text="continue_with"
        width="100%"
      />
      {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
    </div>
  );
};

export default GoogleLoginButton;
