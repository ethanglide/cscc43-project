import { Link } from "react-router";

export default function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="btn btn-ghost btn-xl">
        CSCC43 Project
      </Link>
    </div>
  );
}
