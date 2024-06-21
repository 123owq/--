// GoogleLoginComponent.js
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleLoginComponent = ({ onReceive }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const { code } = tokenResponse;
      try {
        const response = await axios.post('http://localhost:5000/playlist', { code });
        console.log('playlist:', response.data);
        onReceive(response.data);
      } catch (error) {
        console.error('Error exchanging code for refresh token:', error);
      }
    },
    flow: 'auth-code',
    scope: "https://www.googleapis.com/auth/youtube.readonly"
  });

  return (
    <div>
      <button onClick={() => login()}>Login</button>
    </div>
  );
};

export default GoogleLoginComponent;
