import { Fragment, useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import Markdown from "../../components/Markdown";
import { Tab } from "@headlessui/react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios, { AxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import FilePicker from "../../components/FilePicker";

type ProblemData = {
  title: string;
  hardness: number;
  solve_count: number;
  description: string;
};

type ParamsType = {
  id?: string;
};

type FormDataType = {
  name: string;
  file: HTMLInputElement;
};

const validationSchema = yup
  .object({
    name: yup.string().required(),
    file: yup.mixed().required(),
  })
  .required();

function EditProblem() {
  const { id } = useParams<ParamsType>();

  const editorContainer = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const { register, handleSubmit, setValue } = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
  });

  const [content, setContent] = useState<string>();
  useEffect(() => {
    if (!editorContainer.current) return;
    editor.current = monaco.editor.create(editorContainer.current, {
      language: "markdown",
      automaticLayout: true,
    });

    editor.current.onDidChangeModelContent(() => {
      setContent(editor.current?.getValue());
    });

    if (id)
      axios
        .get<ProblemData>(`/problems/${id}`, {
          headers: { Authorization: localStorage.getItem("auth.access_token") },
        })
        .then((res) => {
          setValue("name", res.data.title);
          editor.current?.setValue(res.data.description);
        });

    return () => {
      editor.current?.dispose();
      editor.current = undefined;
    };
  }, [id, setValue]);

  const [errorMessage, setErrorMessage] = useState<string>();
  const navigate = useNavigate();

  const onSave = (data: FormDataType) => {
    const body = {
      title: data.name,
      testcase: data.file,
      description: content,
    };
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth.access_token"),
      },
    };
    const save = () =>
      id
        ? axios.put(`/problems/${id}`, body, config).then(() => id)
        : axios.post<{ problem_Id: string }>("/problems", body, config).then((res) => res.data.problem_Id);
    save()
      .then((savedId) => {
        navigate(`/problems/${savedId}`);
      })
      .catch((err: AxiosError<any>) => {
        setErrorMessage(err.response?.data.message ?? err.message);
      });
  };
  return (
    <div className="flex h-full w-full p-1">
      <div className="flex grow flex-col overflow-hidden p-1">
        <Tab.Group>
          <Tab.List className="flex gap-0.5 self-start">
            {["Edit", "Preview"].map((item) => (
              <Tab
                as={Fragment}
                key={item}>
                {({ selected }) => (
                  <button
                    className={`${
                      selected ? "bg-white text-indigo-700" : "text-gray-500 hover:text-gray-700"
                    } "z-10 rounded-t-lg px-3 py-1 text-sm font-medium outline-none`}>
                    {item}
                  </button>
                )}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="grow overflow-hidden rounded-lg rounded-tl-none shadow-sm">
            <Tab.Panel
              unmount={false}
              className="h-full overflow-hidden rounded-lg rounded-tl-none"
              ref={editorContainer}
            />
            <Tab.Panel
              unmount={false}
              className="shelakhte h-full overflow-auto rounded-lg rounded-tl-none bg-white p-2">
              <Markdown>{content ?? ""}</Markdown>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <form
        className="flex w-96 flex-col gap-3 px-1 pt-8"
        onSubmit={handleSubmit(onSave)}>
        <Input
          label="Problem Name"
          {...register("name")}
        />
        <label className="block text-base font-medium text-gray-700">Testcase</label>
        <div className="rounded-md bg-white shadow-sm">
          <FilePicker
            type="file"
            accept=".zip"
            {...register("file")}
          />
        </div>
        <div className="flex flex-row items-center">
          <span className="ml-3 text-red-700">{errorMessage}</span>
          <Button
            type="submit"
            size="md"
            className="flex-end ml-auto font-bold">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditProblem;
