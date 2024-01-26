import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Input from "../../components/Input";
import Button from "../../components/Button";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import Link from "../../components/Link";

type FormDataType = {
  username: string;
  email: string;
};

const validationSchema = yup
  .object({
    username: yup.string().required(),
    email: yup.string().email().required(),
  })
  .required();

function UpdateProfile() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
  });
  const [errorMessage, setErrorMessage] = useState<string>(" ");

  const handleConfirm = (data: FormDataType) => {
    setErrorMessage("waiting for respond");
    axios
      .post("/auth/edit_user", {
        username: data.username,
        email: data.email,
      })
      .catch((err: AxiosError<any>) => {
        setErrorMessage(err.response?.data.message ?? err.message);
      })
      .then(() => {
        if (errorMessage == "waiting for respond") {
          setErrorMessage("");
        }
      });
  };

  useEffect(() => {
    const subscription = watch(() => setErrorMessage(" "));
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="m-auto w-full max-w-md rounded-lg bg-white p-3 shadow">
      <form
        onSubmit={handleSubmit(handleConfirm)}
        className="flex flex-col">
        <p className="mb-3 p-3 text-left text-3xl font-extrabold text-indigo-700">Profile</p>
        <Input
          label="Username"
          {...register("username")}
          error={errors.username?.message}
        />
        <Input
          label="Email"
          {...register("email")}
          error={errors.email?.message}
        />
        <p className="m-2 text-sm">
          <Link to="/profile/change-password">Change Your Password</Link>
        </p>
        <div className="flex flex-row items-center">
          {!errorMessage && <span className="ml-3 text-green-400">Confirmed</span>}
          {errorMessage == "waiting for respond" && (
            <span className={`ml-3 ${errorMessage == "waiting for respond" ? "text-yellow-400" : "text-red-700"}`}>
              {errorMessage}
            </span>
          )}
          <Button
            type="submit"
            size="md"
            className="ml-auto font-bold">
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UpdateProfile;