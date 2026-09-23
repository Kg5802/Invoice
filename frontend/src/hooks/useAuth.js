import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const useAuth = () => {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/Auth/Signup", payload);
      return response.data;
    },

    onSuccess: (data) => {
      console.log("Signup Response:", data);
      if (data.jwtToken) {
        localStorage.setItem("token", data.jwtToken);
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      if (data.company) {
        localStorage.setItem(
          "company",
          JSON.stringify(data.company)
        );
      }

      toast.success(data.message || "Signup Successful!");

    },

    onError: (error) => {
      console.error("Signup Error:", error.response);

      toast.error(
        error.response?.data?.message ||
        "Signup failed"
      );
    },
  });


  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post(
        "/Auth/Login",
        credentials
      );

      return response.data;
    },

    onSuccess: (data) => {
      console.log("Login Response:", data);

      
      if (data.jwtToken) {
        localStorage.setItem(
          "token",
          data.jwtToken
        );
      }

      
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

   
      if (data.company) {
        localStorage.setItem(
          "company",
          JSON.stringify(data.company)
        );
      }

      toast.success(
        data.message || "Login Successful!"
      );

      navigate("/invoices");
    },

    onError: (error) => {
      console.error("Login Error:", error.response);

      toast.error(
        error.response?.data?.message ||
        "Invalid email or password"
      );
    },
  });


  return {
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
};