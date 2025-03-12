import { AuthApi } from "../api/auth-api";

export default function Home() {
  async function test() {
    const username = "testuser";
    const password = "testpassword";
    const lol = await AuthApi.registerUser({ username, password });
    console.log(lol);

    const login = await AuthApi.loginUser({ username, password });
    console.log(login);
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <h2 className="text-2xl font-bold">Home</h2>
      <p>Welcome to the home page</p>
      <button onClick={test} className="btn btn-primary">
        Run Test
      </button>
    </div>
  );
}
