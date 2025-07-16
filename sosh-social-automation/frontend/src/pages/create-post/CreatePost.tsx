import React from 'react';
import { Navigate } from 'react-router-dom';

export const CreatePost: React.FC = () => {
  return <Navigate to="/create" replace />;
};

export default CreatePost;

// Make this file a module
export {};
