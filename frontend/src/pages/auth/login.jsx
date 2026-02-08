import React from "react";
import { useForm } from "react-hook-form";
import { AuthSchema } from "../../validations/Auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/slices/auth/AuthSlice";
import { toast, ToastContainer } from "react-toastify";
const LoginSchema = AuthSchema.pick(["email", "password"]);
import { setCredentials } from "../../redux/slices/auth/authService";
import { useDispatch } from "react-redux";
import Logo from "../../assets/Logo/LogoMain";
export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      email: "merixerp@gmail.com",
      password: "Merix123",
    },
  });
  const [login] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const response = await login(data).unwrap();
      dispatch(
        setCredentials({
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          role: "admin",
        }),
      );
      if (response.data.user.role === "user") {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.data.message);
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-6 justify-center   h-screen items-center w-full">
      <ToastContainer />
      <Logo />
      <h1 className="font-extrabold text-2xl">Welcome Back</h1>
      <form
        className="flex flex-col gap-4 w-1/4 max-md:w-3/4"
        onSubmit={handleSubmit(handleLogin)}
      >
        <div className="flex flex-col gap-1">
          <input
            className="border border-mainBorder rounded-lg p-2"
            {...register("email")}
            type="text"
            placeholder="Email"
          />
          {errors.email?.message && (
            <p className="text-red-500 px-2 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            className="border border-mainBorder rounded-lg p-2"
            {...register("password")}
            type="password"
            placeholder="Password"
          />
          {errors.password?.message && (
            <p className="text-red-500 px-2 text-sm">
              {errors.password.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="bg-black text-center cursor-pointer text-white p-2 rounded-lg"
        >
          Login
        </button>
      </form>
      <h1 className="flex gap-2">
        You are cashier
        <NavLink to="/cashier-login" className=" underline">
          Cashier Login
        </NavLink>
      </h1>
      <h1>
        Don`t have an account?{" "}
        <NavLink to="/register" className=" underline">
          Register
        </NavLink>
      </h1>
    </div>
  );
};
