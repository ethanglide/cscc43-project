import { FormEvent, useContext, useState } from "react";
import { UserContext } from "../context/user-context";
import { AuthApi } from "../api/auth-api";
import { useNavigate } from "react-router";
import Modal from "./modal";

export default function ProfilePreview() {
  const { user } = useContext(UserContext);
  return user ? <ProfileInfo /> : <SignInButton />;
}

function ProfileInfo() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  function logout() {
    // TODO - remove cookie
    navigate(0);
  }

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-lg">
        {user?.username}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 w-48 shadow"
      >
        <li>
          <a onClick={logout}>Logout</a>
        </li>
      </ul>
    </div>
  );
}

function SignInButton() {
  const modalId = "sign-in-modal";
  const tabRadioName = "sign-in-tab";

  function closeModal() {
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal.close();
  }

  return (
    <>
      <button
        onClick={() => {
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal.showModal();
        }}
        className="btn btn-primary btn-lg"
      >
        Sign In
      </button>
      <Modal id={modalId}>
        <div className="tabs tabs-border tabs-lg">
          <input
            type="radio"
            name={tabRadioName}
            className="tab"
            aria-label="Sign In"
            defaultChecked
          />
          <div className="tab-content">
            <SignInForm purpose="sign-in" closeModal={closeModal} />
          </div>
          <input
            type="radio"
            name={tabRadioName}
            className="tab"
            aria-label="Register"
          />
          <div className="tab-content">
            <SignInForm purpose="register" closeModal={closeModal} />
          </div>
        </div>
      </Modal>
    </>
  );
}

interface SignInFormProps {
  purpose: "sign-in" | "register";
  closeModal: () => void;
}

function SignInForm({ purpose, closeModal }: SignInFormProps) {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    const response = await AuthApi.loginUser({ username, password });

    if ("error" in response) {
      setError(response.error);
      return;
    }

    setUser(response);
    setResponseMessage("Signed in successfully");
    closeModal();
  }

  async function register() {
    const response = await AuthApi.registerUser({ username, password });

    if ("error" in response) {
      setError(response.error);
      return;
    }

    setResponseMessage(response.message);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    if (purpose === "sign-in") {
      await signIn();
    } else {
      await register();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-4 items-center">
      <fieldset className="fieldset w-full">
        <legend className="fieldset-legend">Username</legend>
        <input
          type="text"
          className="input input-lg w-full"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </fieldset>
      <fieldset className="fieldset w-full">
        <legend className="fieldset-legend">Password</legend>
        <input
          type="password"
          className="input input-lg w-full"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </fieldset>
      <div className="flex flex-col gap-2 pt-5 items-center">
        {responseMessage && <p className="text-success">{responseMessage}</p>}
        {error && <p className="text-error">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {purpose === "sign-in" ? "Sign In" : "Register"}
          </button>
          {loading && <span className="loading loading-spinner"></span>}
        </div>
      </div>
    </form>
  );
}
