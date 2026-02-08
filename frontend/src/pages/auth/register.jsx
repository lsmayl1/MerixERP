import React from "react";
import { useForm } from "react-hook-form";
import { AuthSchema } from "../../validations/Auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { NavLink, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../redux/slices/auth/AuthSlice";
import { toast, ToastContainer } from "react-toastify";
import Logo from "../../assets/Logo/LogoMain";
const RegisterSchema = AuthSchema.pick([
  "firstName",
  "lastName",
  "username",
  "phoneNumber",
  "email",
  "password",
  "confirmPassword",
]);
export const Register = () => {
  const navigate = useNavigate();
  const [registerUser] = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(RegisterSchema) });

  const handleRegister = async (data) => {
    try {
      console.log("asd");
      await registerUser(data).unwrap();
      navigate("/");
    } catch (error) {
      toast.error(error.data.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center w-full h-screen justify-center">
      <ToastContainer />
      <Logo />

      <h1 className="font-extrabold text-2xl">Welcome to Merix</h1>
      <form
        className="flex flex-col gap-4 w-1/2 overflow-auto max-md:w-3/4 "
        onSubmit={handleSubmit(handleRegister)}
      >
        <div className="flex gap-2  max-md:flex-col">
          <div className="flex flex-col w-full">
            <input
              className="border border-mainBorder rounded-lg p-2 w-full"
              {...register("firstName")}
              type="text"
              placeholder="First Name"
            />
            {errors.firstName?.message && (
              <p className="text-red-500 px-2 text-sm">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col w-full ">
            <input
              className="border border-mainBorder rounded-lg p-2 w-full"
              {...register("lastName")}
              type="text"
              placeholder="Last Name"
            />
            {errors.lastName?.message && (
              <p className="text-red-500 px-2 text-sm">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full  max-md:flex-col">
          <div className="flex flex-col w-full gap-1">
            <input
              className="border border-mainBorder rounded-lg p-2"
              {...register("username")}
              type="text"
              placeholder="Username"
            />
            {errors.email?.message && (
              <p className="text-red-500 px-2 text-sm">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 w-full">
            <input
              className="border border-mainBorder rounded-lg p-2"
              {...register("email")}
              type="text"
              placeholder="Email"
            />
            {errors.email?.message && (
              <p className="text-red-500 px-2 text-sm">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <input
            className="border border-mainBorder rounded-lg p-2"
            {...register("phoneNumber")}
            type="number"
            placeholder="Phone Number"
          />
          {errors.phoneNumber?.message && (
            <p className="text-red-500 px-2 text-sm">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full max-md:flex-col">
          <div className="flex w-full flex-col gap-1">
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
          <div className="flex w-full flex-col gap-1">
            <input
              className="border border-mainBorder rounded-lg p-2"
              {...register("confirmPassword")}
              type="password"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword?.message && (
              <p className="text-red-500 px-2 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="bg-black cursor-pointer text-white p-2 rounded-lg"
        >
          Register
        </button>
      </form>

      <h1>
        Don`t have an account?{" "}
        <NavLink to="/" className=" underline">
          Login
        </NavLink>
      </h1>
    </div>
  );
};
