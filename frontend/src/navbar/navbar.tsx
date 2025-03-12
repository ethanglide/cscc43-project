import { Link } from "react-router";
import ProfilePreview from "../components/profile-preview";

export default function Navbar() {
  return (
    <div className="navbar justify-between">
      <Link to="/" className="btn btn-ghost btn-xl">
        CSCC43 Project
      </Link>
      <ProfilePreview />
    </div>
  );
}
