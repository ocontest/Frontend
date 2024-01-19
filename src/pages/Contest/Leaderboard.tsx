import TableRow from "./TableRow";
import axios, { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { user } from "./TableRow";
type pageData = {
  count: number;
  problems: problem[];
  users: user[];
};
type problem = {
  id: number;
  title: string;
};
type ParamsType = {
  id: string;
};
function Leaderboard() {
  const { id } = useParams<ParamsType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [data, setData] = useState<pageData>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [rowPerPage, setRowPerPage] = useState<number>(100);
  useEffect(() => {
    axios
      .get<pageData>(`/contests/${id}/scoreboard`, {
        headers: { Authorization: localStorage.getItem("auth.access_token") },
        params: {
          limit: rowPerPage,
          offset: (pageNumber - 1) * rowPerPage,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err: AxiosError<any>) => {
        setErrorMessage(err.response?.data.message ?? err.message);
      });
  }, [id, pageNumber, rowPerPage]);

  return (
    <div className="w-screen p-2">
      {errorMessage ? (
        <div>{errorMessage}</div>
      ) : (
        <table className="mx-auto w-11/12 overflow-y-scroll rounded-md shadow-md">
          <thead>
            <tr className="bg-indigo-400">
              <td
                scope="col"
                className="w-14 rounded-tl-md py-3.5 text-center text-sm font-semibold text-gray-900">
                Rank
              </td>
              <td
                scope="col"
                className="w-1/12 py-3.5 text-center text-sm font-semibold text-gray-900">
                User
              </td>
              {data?.problems.map((question) => (
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-center text-sm font-semibold text-gray-900 sm:pl-6">
                  <Link to={`/contests/${id}/${question.id}`}> {question.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="overflow-scroll">
            {data?.users.map((user, idx) => (
              <TableRow
                index={idx}
                user={user}
              />
            ))}
            <tr className="bg-gray-50">
              {data?.problems && (
                <td
                  colSpan={2 + data?.problems.length}
                  className="rounded-b-md py-2">
                  <div className="flex flex-row gap-2">
                    <p className="my-auto ml-auto">page number</p>
                    <input
                      value={pageNumber}
                      onChange={(e) => setPageNumber(+e.target.value)}
                      className="h-7 w-14 rounded-md text-center"
                    />
                    <p className="my-auto">row per page</p>
                    <input
                      value={rowPerPage}
                      onChange={(e) => setRowPerPage(+e.target.value)}
                      className="mr-5 h-7 w-14 rounded-md text-center"
                    />
                  </div>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
