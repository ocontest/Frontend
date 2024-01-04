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
          offset: pageNumber * rowPerPage,
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
    <>
      <div className="mx-auto w-full p-2">
        {errorMessage ? (
          <div>{errorMessage}</div>
        ) : (
          <table className="w-full">
            <thead className="w-full bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Number
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  User
                </th>
                {data?.problems.map((question) => (
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    <Link to={`/contests/${id}/${question.id}`}> {question.title}</Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users.map((user, idx) => (
                <TableRow
                  index={idx}
                  user={user}
                />
              ))}
            </tbody>
            <tfoot className="w-full bg-gray-50">
              <tr className="flex flex-row">
                {data?.problems && (
                  <td
                    colSpan={data?.problems.length + 1}
                    className="m-1 flex flex-row gap-2 self-end">
                    <p className="my-auto">page number</p>
                    <input
                      value={pageNumber}
                      onChange={(e) => setPageNumber(+e.target.value)}
                      className="h-8"
                    />
                    <p className="my-auto">row per page</p>
                    <input
                      value={rowPerPage}
                      onChange={(e) => setRowPerPage(+e.target.value)}
                      className="h-8"
                    />
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  );
}

export default Leaderboard;
