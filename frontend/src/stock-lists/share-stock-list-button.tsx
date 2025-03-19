import { FormEvent, useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user-context";
import FriendsApi from "../api/friends-api";
import { FiShare2, FiUserX } from "react-icons/fi";
import Modal from "../components/modal";
import StockListsApi from "../api/stock-lists-api";

export default function ShareStockListButton({
  listName,
}: {
  listName: string;
}) {
  const { user } = useContext(UserContext);
  const [friends, setFriends] = useState<string[]>([]);
  const [sharedFriends, setSharedFriends] = useState<string[]>([]);
  const [friendName, setFriendName] = useState("");
  const [shareError, setShareError] = useState("");

  const modalId = `share-stock-list-${listName}`;
  const filteredFriends = friends.filter(
    (friend) => !sharedFriends.includes(friend) && friend.includes(friendName),
  );

  async function handleShare(e: FormEvent) {
    e.preventDefault();

    if (!user) {
      return;
    }

    const response = await StockListsApi.shareStockList(
      user.accessToken,
      listName,
      friendName,
    );

    if ("error" in response) {
      setShareError("Failed to share stock list");
      return;
    }

    setShareError("");

    if (!sharedFriends.includes(friendName)) {
      setSharedFriends([...sharedFriends, friendName]);
    }
  }

  async function unshareStockList(friend: string) {
    if (!user) {
      return;
    }

    const response = await StockListsApi.unshareStockList(
      user.accessToken,
      listName,
      friend,
    );

    if ("error" in response) {
      console.log("Failed to unshare stock list");
      return;
    }

    setSharedFriends(
      sharedFriends.filter((sharedFriend) => sharedFriend !== friend),
    );
  }

  async function getInfo() {
    if (!user) {
      return;
    }

    const [friendsResponse, sharedFriendsResponse] = await Promise.all([
      FriendsApi.getFriends(user.username),
      StockListsApi.getStockListReviews(
        user.accessToken,
        user.username,
        listName,
      ),
    ]);

    if ("error" in friendsResponse || "error" in sharedFriendsResponse) {
      console.log("Failed to get friends or shared friends");
      return;
    }

    setFriends(friendsResponse);
    setSharedFriends(
      sharedFriendsResponse.map((friend) => friend.reviewer_username),
    );
  }

  useEffect(() => {
    getInfo();
  }, [user]);

  return (
    <>
      <button
        onClick={() => {
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal.showModal();
        }}
        className="btn btn-accent btn-circle"
      >
        <FiShare2 />
      </button>
      <Modal id={modalId}>
        <h2 className="text-xl font-bold">Share "{listName}"</h2>
        <form onSubmit={handleShare} className="flex flex-col gap-4">
          <fieldset className="fieldset dropdown dropdown-bottom">
            <legend className="fieldset-legend">Friend Name</legend>
            <input
              type="text"
              tabIndex={0}
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Friend Name"
              className="input input-lg w-full"
              required
            />
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box w-full z-1 shadow"
            >
              {filteredFriends.map((friend) => (
                <li key={friend} onClick={() => setFriendName(friend)}>
                  <a onClick={(e) => e.currentTarget.blur()}>{friend}</a>
                </li>
              ))}
            </ul>
          </fieldset>
          <button type="submit" className="btn btn-accent">
            Share
          </button>
          {shareError && <p className="text-error text-center">{shareError}</p>}
          <h3 className="text-lg font-bold">Shared Friends</h3>
          <ul className="list">
            {sharedFriends.length === 0 && (
              <p className="text-base text-center">No shared friends</p>
            )}
            {sharedFriends.map((sharedFriend) => (
              <li key={sharedFriend} className="list-row">
                <p className="text-lg font-bold">{sharedFriend}</p>
                <div className="flex justify-end">
                  <div className="tooltip tooltip-error" data-tip="Unshare">
                    <button
                      onClick={() => unshareStockList(sharedFriend)}
                      className="btn btn-circle btn-error"
                    >
                      <FiUserX />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </form>
      </Modal>
    </>
  );
}
