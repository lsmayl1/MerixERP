import * as yup from "yup";
export const AuthSchema = yup.object().shape({
  firstName: yup.string().required("First name required!"),
  lastName: yup.string().required("Last name required!"),
  username: yup.string().required("Username required!"),
  email: yup.string().email("Enter existing email").required("Email required!"),
  phoneNumber: yup.string().required("Number required!"),
  password: yup.string().min(6, "Password need have min 6 symbols"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Password not match")
    .required("Confirm your password!"),
});
