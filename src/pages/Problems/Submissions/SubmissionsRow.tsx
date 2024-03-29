import Dialog from "../../../components/Dialog";
import { CodeBracketIcon, ListBulletIcon } from "@heroicons/react/20/solid";
import { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import CodeView from "./CodeView";

enum Verdicts {
  VerdictOK = 1,
  VerdictWrong,
  VerdictTimeLimit,
  VerdictMemoryLimit,
  VerdictRuntimeError,
  VerdictUnknown,
  VerdictCompileError,
}

export type SubmissionData = {
  metadata: {
    submission_id: string;
    user_id: string;
    language: string;
    created_at: string;
    file_name: string;
    problem_id: number;
    problem_title: string;
  };
  results: {
    service_message: string;
    // testcase_id: number;
    error_message: string;
    verdicts: Verdicts[] | null;
  };
};

export type DialogData = {
  title: string;
  children: ReactNode;
};

type PropsType = {
  data: SubmissionData;
  index: number;
  showProblemName: boolean;
};

const verdictNames = ["", "OK", "Wrong", "TimeLimit", "MemoryLimit", "RuntimeError", "Unknown", "CompileError"];

const getScore = (verdicts: Verdicts[] | null) => {
  if (!verdicts || verdicts.length == 0) return NaN;
  return verdicts.filter((v) => v === Verdicts.VerdictOK).length / verdicts.length;
};

function SubmissionsRow({ data, index, showProblemName }: PropsType) {
  const score = getScore(data.results.verdicts);
  const [verdictsModalOpen, setVerdictsModalOpen] = useState(false);
  const [codeViewOpen, setCodeViewOpen] = useState(false);

  return (
    <>
      {createPortal(
        <Dialog
          open={verdictsModalOpen}
          onClose={setVerdictsModalOpen}
          title="Test Case Results">
          <div>
            <p>{data.results.service_message}</p>
            <p>{data.results.error_message}</p>
            {data.results.verdicts?.map((verdict, idx) => (
              <p
                className={
                  verdict === Verdicts.VerdictOK
                    ? "text-green-800"
                    : verdict !== Verdicts.VerdictUnknown
                      ? "text-red-800"
                      : "text-gray-800"
                }>
                Test Case {idx + 1}: {verdictNames[verdict]}
              </p>
            ))}
          </div>
        </Dialog>,
        document.body,
        `${data.metadata.submission_id}-Test cases`,
      )}
      {createPortal(
        <Dialog
          open={codeViewOpen}
          onClose={setCodeViewOpen}
          title={`Submission id: ${data.metadata.submission_id}`}>
          <CodeView id={data.metadata.submission_id} />
        </Dialog>,
        document.body,
        `${data.metadata.submission_id}-Code`,
      )}
      <tr className={`text-sm text-gray-800 ${index % 2 === 0 ? undefined : "bg-gray-50"}`}>
        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
          {new Date(data.metadata.created_at).toLocaleString("en-us", { hour12: false })}
        </td>
        <td className="whitespace-nowrap px-3 py-4 capitalize">{data.metadata.language}</td>
        {showProblemName && <td className="whitespace-nowrap px-3 py-4 capitalize">{data.metadata.problem_title}</td>}
        <td
          className={`whitespace-nowrap px-3 py-4 ${score == 1 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
          {isNaN(score) ? "-" : (100 * score).toFixed(0)}
        </td>
        <td
          className={`truncate whitespace-nowrap px-3 py-4 capitalize ${score == 1 ? "text-green-800" : "text-red-800"}`}>
          {data.results.service_message}
        </td>
        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
          <div className="flex gap-2">
            <ListBulletIcon
              className="h-6 w-6 text-indigo-600 hover:text-indigo-800"
              onClick={() => setVerdictsModalOpen(true)}
            />
            <CodeBracketIcon
              className="h-6 w-6 text-indigo-600 hover:text-indigo-800"
              onClick={() => setCodeViewOpen(true)}
            />
          </div>
        </td>
      </tr>
    </>
  );
}

export default SubmissionsRow;
