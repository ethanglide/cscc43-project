import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user-context";
import StockListsApi, { StockListsResponse } from "../api/stock-lists-api";
import { useNavigate } from "react-router";

export default function StockListBrowse() {
  const { user } = useContext(UserContext);
  const [publicLists, setPublicLists] = useState<StockListsResponse[]>([]);
  const [sharedLists, setSharedLists] = useState<StockListsResponse[]>([]);

  async function getPublicLists() {
    const response = await StockListsApi.getPublicStockLists();

    if ("error" in response) {
      console.log("Failed to get public stock lists");
      return;
    }

    // Don't show the user's own public lists
    if (user) {
      setPublicLists(
        response.filter((list) => list.username !== user.username),
      );
    } else {
      setPublicLists(response);
    }
  }

  async function getSharedLists() {
    if (!user) {
      return;
    }

    const response = await StockListsApi.getSharedStockLists(user.accessToken);

    if ("error" in response) {
      console.log("Failed to get shared stock lists");
      return;
    }

    setSharedLists(response);
  }

  useEffect(() => {
    getPublicLists();
  }, []);

  useEffect(() => {
    getSharedLists();
  }, [user]);

  return (
    <div className="flex flex-col gap-4">
      {user && (
        <>
          <h3 className="text-2xl font-bold">Shared With You</h3>
          {sharedLists.length > 0 ? (
            <StockListList lists={sharedLists} />
          ) : (
            <p>No stock lists shared with you</p>
          )}
        </>
      )}
      <h3 className="text-2xl font-bold">Public Stock Lists</h3>
      {publicLists.length > 0 ? (
        <StockListList lists={publicLists} />
      ) : (
        <p>No public stock lists available</p>
      )}
    </div>
  );
}

function StockListList({ lists }: { lists: StockListsResponse[] }) {
  const navigate = useNavigate();

  return (
    <ul className="list">
      {lists.map((list, index) => (
        <li
          key={index}
          className="list-row hover:bg-base-200 transition-colors duration-200 hover:cursor-pointer"
          onClick={() =>
            navigate(`/stock-lists/${list.username}/${list.list_name}`)
          }
        >
          <div className="flex gap-4 items-baseline">
            <p className="text-lg font-bold">{list.list_name}</p>
            <p className="">{list.username}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
