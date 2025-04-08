import { Link } from "react-router";
import ProfilePreview from "../components/profile-preview";
import FriendsMenu from "../components/friends-menu";
import { useContext } from "react";
import { UserContext } from "../context/user-context";

export default function Navbar() {
  const { user } = useContext(UserContext);

  return (
    <div className="navbar justify-between">
      <Link to="/" className="btn btn-ghost btn-xl">
        CSCC43 Project
      </Link>
      <div className="flex gap-2 items-center">
        {user && (
          <>
            <Link to="/stock-lists" className="btn btn-ghost btn-lg">
              Stock Lists
            </Link>
            <Link to="/portfolios" className="btn btn-ghost btn-lg">
              Portfolios
            </Link>
          </>
        )}
        <FriendsMenu />
        <ProfilePreview />
      </div>
    </div>
  );
}
