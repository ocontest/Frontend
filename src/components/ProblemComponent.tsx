import { HTMLAttributes } from "react";
import axios, { AxiosError } from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Markdown from "./Markdown";
import FilePicker from "./FilePicker";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { PencilIcon } from "@heroicons/react/24/outline";

type ProblemData = {
  title: string;
  hardness: number;
  solve_count: number;
  description: string;
};

type PropsType = HTMLAttributes<HTMLDivElement> & {
  id: string;
};

function ProblemComponent({ id, ...otherProps }: PropsType) {
  const [data, setdata] = useState<ProblemData>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get<ProblemData>(`/problems/${id}`, {
        headers: { Authorization: localStorage.getItem("auth.access_token") },
      })
      .then((res) => {
        setdata(res.data);
      })
      .catch((err: AxiosError<any>) => {
        setErrorMessage(err.response?.data.message ?? err.message);
      });
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (filePicker.current?.files?.length) {
      const data = await filePicker.current?.files[0].text();
      axios
        .post(`/problems/${id}/submit`, data, {
          headers: {
            Authorization: localStorage.getItem("auth.access_token"),
          },
        })
        // .then(() => {
        //   navigate("submissions");
        // })
        .catch((err: AxiosError<any>) => {
          setErrorMessage(err.response?.data.message ?? err.message);
        });
    } else {
      setErrorMessage("no file seleced");
    }
  };

  const filePicker = useRef<HTMLInputElement>(null);

  return data ? (
    <div
      className="m-5 flex flex-col gap-2"
      {...otherProps}>
      <div className="relative rounded-t-lg border-black bg-white p-5 text-center align-middle text-3xl font-black shadow-md">
        {data?.title ?? "title"}
        <div className="absolute right-4 top-4 flex gap-2">
          <Button
            size="xs"
            variant="inline"
            onClick={() => {
              navigate("edit");
            }}>
            <PencilIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Markdown className=" bg-white p-8 shadow-md">{data.description}</Markdown>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start gap-2 rounded-b-lg bg-white p-5 shadow-md">
        <p className="text-xl font-bold text-indigo-800">Submit here</p>
        <div className="flex flex-row gap-3">
          <FilePicker ref={filePicker} />
          <div className="flex flex-row justify-between">
            <Button
              type="submit"
              size="xs">
              Submit
            </Button>
          </div>
        </div>
        <span className="ml-3 text-red-700">{errorMessage}</span>
      </form>
    </div>
  ) : (
    <div className="flex h-screen w-full text-indigo-800">
      {errorMessage ? (
        <p className="m-auto text-center text-5xl">{errorMessage}</p>
      ) : (
        <ArrowPathIcon className="m-auto h-20 w-20 animate-spin" />
      )}
    </div>
  );
}
export default ProblemComponent;
