import { Link } from "react-router";
import ProfilePreview from "../components/profile-preview";
import FriendsMenu from "../components/friends-menu";

export default function Navbar() {
  return (
    <div className="navbar justify-between">
      <Link to="/" className="btn btn-ghost btn-xl">
        CSCC43 Project
      </Link>
      <div className="flex gap-2 items-center">
        <FriendsMenu />
        <ProfilePreview />
      </div>
    </div>
  );
}
