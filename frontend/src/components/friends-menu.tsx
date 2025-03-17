import { FormEvent, useContext, useEffect, useState } from "react";
import { UserContext } from "../context/user-context";
import {
  FiRotateCcw,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiUserX,
} from "react-icons/fi";
import Modal from "./modal";
import FriendsApi, { FriendRequest } from "../api/friends-api";
import { UsersApi } from "../api/users-api";

export default function FriendsMenu() {
  const { user } = useContext(UserContext);

  if (!user) {
    return <></>;
  }

  return <FriendsMenuDisplay />;
}

function FriendsMenuDisplay() {
  const { user } = useContext(UserContext);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [requestableUsers, setRequestableUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pendingIncomingRequests = incomingRequests.filter(
    (request) => request.status === "pending",
  );
  const unacceptedOutgoingRequests = outgoingRequests.filter(
    (request) => request.status !== "accepted",
  );

  async function getInfo() {
    setLoading(true);

    const [incomingRequests, outgoingRequests, friends, allUsers] =
      await Promise.all([
        FriendsApi.getIncomingRequests(user!.accessToken),
        FriendsApi.getOutgoingRequests(user!.accessToken),
        FriendsApi.getFriends(user!.username),
        UsersApi.getAllUsers(),
      ]);

    for (const response of [
      incomingRequests,
      outgoingRequests,
      friends,
      allUsers,
    ]) {
      if ("error" in response) {
        setError("Error fetching friends information: " + response.error);
        return;
      }
    }

    // At this point, we know all responses are successful
    setIncomingRequests(incomingRequests as FriendRequest[]);
    setOutgoingRequests(outgoingRequests as FriendRequest[]);
    setFriends(friends as string[]);
    setRequestableUsers(
      (allUsers as string[]).filter((u) => {
        if ((friends as string[]).includes(u)) {
          return false;
        }
        if (u === user!.username) {
          return false;
        }
        const outgoingUsers = (outgoingRequests as FriendRequest[]).map(
          (r) => r.receiver,
        );
        if (outgoingUsers.includes(u)) {
          return false;
        }
        const incomingUsers = (incomingRequests as FriendRequest[]).map(
          (r) => r.sender,
        );
        if (incomingUsers.includes(u)) {
          return false;
        }
        return true;
      }),
    );

    setLoading(false);
  }

  useEffect(() => {
    getInfo();
  }, []);

  const modalId = "friends-modal";
  const tabRadioName = "friends-tab";

  function FriendsList() {
    const [addFriendLoading, setAddFriendLoading] = useState(false);
    const [addFriendError, setAddFriendError] = useState("");
    const [search, setSearch] = useState("");

    async function handleAddFriendSubmit(e: FormEvent) {
      e.preventDefault();

      setAddFriendLoading(true);

      const response = await FriendsApi.sendFriendRequest(
        user!.accessToken,
        search,
      );

      if ("error" in response) {
        setAddFriendError("Error sending friend request");
      } else {
        setAddFriendError("");
        setSearch("");
        setRequestableUsers(requestableUsers.filter((u) => u !== search));
        setOutgoingRequests([
          ...outgoingRequests,
          {
            sender: user!.username,
            receiver: search,
            timestamp: Date.now(),
            status: "pending",
          },
        ]);
      }

      setAddFriendLoading(false);
    }

    async function removeFriend(friend: string) {
      const response = await FriendsApi.deleteFriendRequest(
        user!.accessToken,
        friend,
      );

      if ("error" in response) {
        setAddFriendError("Error removing friend");
      } else {
        setFriends(friends.filter((f) => f !== friend));
        setRequestableUsers([...requestableUsers, friend]);
      }
    }

    return (
      <div className="flex flex-col gap-5 pt-5">
        {loading && <span className="loading loading-spinner"></span>}
        {error && <p className="text-error">{error}</p>}
        <form
          onSubmit={handleAddFriendSubmit}
          className="flex gap-2 items-baseline"
        >
          <fieldset className="fieldset dropdown dropdown-bottom">
            <legend className="fieldset-legend">Add Friend</legend>
            <input
              type="text"
              tabIndex={0}
              className="input input-lg"
              placeholder="Username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required
            />
            {search && !requestableUsers.includes(search) && (
              <p className="text-error">User not found</p>
            )}
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-200 rounded-box w-full z-1 shadow"
            >
              {requestableUsers
                .filter((user) => user.includes(search))
                .map((user) => (
                  <li key={user}>
                    <a onClick={() => setSearch(user)}>{user}</a>
                  </li>
                ))}
            </ul>
          </fieldset>
          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={addFriendLoading}
          >
            <FiUserPlus />
          </button>
          {addFriendLoading && (
            <span className="loading loading-spinner"></span>
          )}
          {addFriendError && <p className="text-error">{addFriendError}</p>}
        </form>
        <ul className="list w-full max-h-48 overflow-auto">
          {friends.map((friend) => (
            <li key={friend} className="list-row">
              <p className="text-lg font-bold">{friend}</p>
              <div className="flex justify-end">
                <div className="tooltip tooltip-error" data-tip="Remove">
                  <button
                    onClick={() => removeFriend(friend)}
                    className="btn btn-circle btn-error"
                  >
                    <FiUserX />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function IncomingRequests() {
    async function acceptRequest(sender: string) {
      const response = await FriendsApi.acceptFriendRequest(
        user!.accessToken,
        sender,
      );

      if (!("error" in response)) {
        setFriends([...friends, sender]);
        setIncomingRequests(
          incomingRequests.map((request) => {
            if (request.sender === sender) {
              return { ...request, status: "accepted" };
            }
            return request;
          }),
        );
      }
    }

    async function rejectRequest(sender: string) {
      const response = await FriendsApi.rejectFriendRequest(
        user!.accessToken,
        sender,
      );

      if (!("error" in response)) {
        setIncomingRequests(
          incomingRequests.map((request) => {
            if (request.sender === sender) {
              return { ...request, status: "rejected" };
            }
            return request;
          }),
        );
      }
    }

    return (
      <div className="flex flex-col gap-5 items-center pt-5">
        {loading && <span className="loading loading-spinner"></span>}
        {error && <p className="text-error">{error}</p>}
        {pendingIncomingRequests.length === 0 && <p>No incoming requests</p>}
        <ul className="list w-full">
          {pendingIncomingRequests.map((request) => (
            <li key={request.sender} className="list-row">
              <div className="flex gap-4 items-center">
                <p className="text-lg font-bold">{request.sender}</p>
                <p>{new Date(request.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="tooltip tooltip-success" data-tip="Accept">
                  <button
                    onClick={() => acceptRequest(request.sender)}
                    className="btn btn-circle btn-success"
                  >
                    <FiUserCheck />
                  </button>
                </div>
                <div className="tooltip tooltip-error" data-tip="Reject">
                  <button
                    onClick={() => rejectRequest(request.sender)}
                    className="btn btn-circle btn-error"
                  >
                    <FiUserX />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function OutgoingRequests() {
    async function cancelRequest(receiver: string) {
      const response = await FriendsApi.deleteFriendRequest(
        user!.accessToken,
        receiver,
      );

      if (!("error" in response)) {
        setRequestableUsers([...requestableUsers, receiver]);
        setOutgoingRequests(
          outgoingRequests.filter((request) => request.receiver !== receiver),
        );
      }
    }

    async function resendRequest(receiver: string) {
      const response = await FriendsApi.sendFriendRequest(
        user!.accessToken,
        receiver,
      );

      if (!("error" in response)) {
        setOutgoingRequests(
          outgoingRequests.map((request) => {
            if (request.receiver === receiver) {
              return { ...request, timestamp: Date.now(), status: "pending" };
            }
            return request;
          }),
        );
      }
    }

    return (
      <div className="flex flex-col gap-5 items-center pt-5">
        {loading && <span className="loading loading-spinner"></span>}
        {error && <p className="text-error">{error}</p>}
        {unacceptedOutgoingRequests.length === 0 && <p>No outgoing requests</p>}
        <ul className="list w-full">
          {unacceptedOutgoingRequests.map((request) => (
            <li key={request.receiver} className="list-row">
              <div className="flex gap-4 items-center">
                <p className="text-lg font-bold">{request.receiver}</p>
                <p>{new Date(request.timestamp).toLocaleString()}</p>
                {request.status === "pending" && (
                  <p className="badge badge-warning">Pending</p>
                )}
                {request.status === "rejected" && (
                  <p className="badge badge-error">Rejected</p>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                {request.status === "rejected" && (
                  <div className="tooltip tooltip-accent" data-tip="Resend">
                    <button
                      onClick={() => resendRequest(request.receiver)}
                      className="btn btn-circle btn-accent"
                    >
                      <FiRotateCcw />
                    </button>
                  </div>
                )}
                <div className="tooltip tooltip-error" data-tip="Cancel">
                  <button
                    onClick={() => cancelRequest(request.receiver)}
                    className="btn btn-circle btn-error"
                  >
                    <FiUserX />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal.showModal();
        }}
        className="btn btn-ghost btn-lg"
      >
        Friends
        <FiUsers />
        {pendingIncomingRequests.length > 0 && (
          <span className="badge badge-error badge-sm">
            {pendingIncomingRequests.length}
          </span>
        )}
      </button>
      <Modal id={modalId}>
        <div className="tabs tabs-border tabs-lg">
          <input
            type="radio"
            name={tabRadioName}
            className="tab"
            aria-label={`Friends (${friends.length})`}
            defaultChecked
          />
          <div className="tab-content">
            <FriendsList />
          </div>
          <input
            type="radio"
            name={tabRadioName}
            className="tab"
            aria-label={`Incoming Requests (${pendingIncomingRequests.length})`}
          />
          <div className="tab-content">
            <IncomingRequests />
          </div>
          <input
            type="radio"
            name={tabRadioName}
            className="tab"
            aria-label={`Outgoing Requests (${unacceptedOutgoingRequests.length})`}
          />
          <div className="tab-content">
            <OutgoingRequests />
          </div>
        </div>
      </Modal>
    </>
  );
}
