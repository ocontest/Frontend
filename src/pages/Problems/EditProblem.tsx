import { Fragment, SyntheticEvent, useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import Markdown from "../../components/Markdown";
import { Tab } from "@headlessui/react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import Dialog from "../../components/Dialog";
import FilePicker from "../../components/FilePicker";
import toast from "react-hot-toast";

type ProblemData = {
  title: string;
  hardness: number;
  solve_count: number;
  description: string;
  is_owned: boolean;
};

type ParamsType = {
  contestId?: string;
  problemId?: string;
};

type FormDataType = {
  name: string;
  hardness: number;
};

const validationSchema = yup
  .object({
    name: yup.string().required(),
    hardness: yup.number().required(),
  })
  .required();

function ChooseTestCase(props: { onClose: () => void; problemId: string }) {
  const filePickerRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (filePickerRef.current?.files?.length) {
      const formData = new FormData();
      formData.append("testcases", filePickerRef.current.files[0]);
      axios.post(`/problems/${props.problemId}/testcase`, formData).then(props.onClose);
    }
  };

  return (
    <form
      className="flex flex-col"
      onSubmit={handleSubmit}>
      <FilePicker
        ref={filePickerRef}
        accept=".zip"
      />
      <Button
        type="submit"
        size="md"
        className="self-end">
        Submit
      </Button>
    </form>
  );
}

function EditProblem() {
  const { contestId, problemId } = useParams<ParamsType>();
  const navigate = useNavigate();

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

    if (problemId)
      axios.get<ProblemData>(`/problems/${problemId}`).then((res) => {
        if (!res.data.is_owned) {
          navigate(-1);
          return;
        }
        setValue("name", res.data.title);
        setValue("hardness", res.data.hardness);
        editor.current?.setValue(res.data.description);
      });

    return () => {
      editor.current?.dispose();
      editor.current = undefined;
    };
  }, [problemId, setValue, navigate]);

  const onSave = (data: FormDataType) => {
    const body = {
      title: data.name,
      contest_id: Number(contestId),
      description: content,
      hardness: data.hardness,
    };
    if (problemId) {
      axios.put(`/problems/${problemId}`, body).then(() => {
        toast("Problem edited successfully.");
        navigate(-1);
      });
    } else {
      axios.post("/problems", body).then(() => {
        toast("Problem created successfully.");
        navigate(-1);
      });
    }
  };

  const handleDelete = () => {
    axios.delete(`/problems/${problemId}`).then(() => {
      toast("Problem deleted successfully.");
      navigate("/problems");
    });
  };

  const [testCaseOpen, setTestCaseOpen] = useState(false);

  return (
    <div className="flex w-full flex-1 overflow-hidden p-4">
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
        className="w-96 px-1 pt-8"
        onSubmit={handleSubmit(onSave)}>
        <Input
          label="Problem Name"
          {...register("name")}
        />
        <Input
          label="Hardness"
          {...register("hardness")}
        />
        <div className="flex flex-row items-center gap-2">
          {problemId && (
            <>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                size="md"
                variant="error"
                className="font-bold">
                Delete
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setTestCaseOpen(true);
                }}
                size="md"
                className="font-bold">
                Set TestCases
              </Button>
            </>
          )}
          <Button
            type="submit"
            size="md"
            className="ml-auto font-bold">
            Save
          </Button>
        </div>
      </form>
      {problemId &&
        createPortal(
          <Dialog
            open={testCaseOpen}
            onClose={setTestCaseOpen}
            title={`Choose test cases`}>
            <ChooseTestCase
              problemId={problemId}
              onClose={() => {
                setTestCaseOpen(false);
              }}
            />
          </Dialog>,
          document.body,
        )}
    </div>
  );
}

export default EditProblem;
