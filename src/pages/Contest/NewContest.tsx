import Button from "../../components/Button";
import Input from "../../components/Input";
import Duration from "../../components/Duration";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

type FormData = {
  title: string;
  start_time: Date;
  duration: number;
};

const validationSchema = yup
  .object({
    title: yup.string().required(),
    start_time: yup.date().required().min(new Date(), "Date cannot be in the past"),
    duration: yup.number().min(1).required(),
  })
  .required();

function NewContest() {
  const {
    control,
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });

  const navigate = useNavigate();

  const handleCreate = (data: FormData) => {
    axios
      .post("contests", {
        title: data.title,
        start_time: data.start_time.getTime() / 1000,
        Duration: data.duration,
      })
      .then(() => {
        toast("Contest created successfully.");
        navigate("/home");
      });
  };

  return (
    <div className="m-auto w-5/12 rounded-md bg-white p-5">
      <p className="mb-3 p-3 text-left text-3xl font-extrabold text-indigo-700">New Contest</p>
      <form
        onSubmit={handleSubmit(handleCreate)}
        className="Flex">
        <Input
          label="Name"
          {...register("title")}
          error={errors.title?.message}
        />
        <Input
          label="start_time"
          type="datetime-local"
          {...register("start_time", {
            valueAsDate: true,
          })}
          error={
            errors.start_time?.message ==
            "start_time must be a `date` type, but the final value was: `Invalid Date` (cast from the value `Invalid Date`)."
              ? "Start time is a required field "
              : errors.start_time?.message
          }
        />
        <Controller
          control={control}
          name="duration"
          render={({ field: { value, onChange, onBlur } }) => (
            <Duration
              value={value ?? 0}
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <div className="flex flex-row items-center">
          <Button
            type="submit"
            size="md"
            className="flex-end ml-auto mr-2 font-bold">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewContest;
