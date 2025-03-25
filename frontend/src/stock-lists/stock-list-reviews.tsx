import { FormEvent, useContext, useEffect, useMemo, useState } from "react";
import StockListsApi, {
  ReviewResponse,
  StockListsResponse,
  StockListType,
} from "../api/stock-lists-api";
import { UserContext } from "../context/user-context";
import RatingStars from "../components/rating-stars";
import { FiEdit, FiRotateCcw, FiTrash2 } from "react-icons/fi";

export default function StockListReviews({
  stockList,
}: {
  stockList: StockListsResponse;
}) {
  const { user } = useContext(UserContext);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(1);

  const isOwner = user && user.username === stockList.username;

  // Public stock lists have a default review for non-owners
  const userReview = useMemo(
    () =>
      reviews.find((review) => review.reviewer_username === user?.username) ||
      (stockList.list_type === StockListType.public && user && !isOwner
        ? {
            owner_username: stockList.username,
            list_name: stockList.list_name,
            reviewer_username: user.username,
            review: "",
            rating: 1,
          }
        : undefined),
    [reviews, stockList, user],
  );

  const reviewChanged =
    userReview?.review !== newReview || userReview?.rating !== newRating;

  // Your reviews and empty reviews are not displayed
  const filteredReviews = reviews.filter(
    (review) => review.reviewer_username !== user?.username && review.review,
  );

  async function editReview(e: FormEvent) {
    e.preventDefault();

    if (!user || newReview.length > 4000 || !userReview) {
      return;
    }

    const response = await StockListsApi.editReview(
      user.accessToken,
      stockList.username,
      stockList.list_name,
      newReview,
      newRating,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    const updatedReviews = reviews.includes(userReview)
      ? reviews.map((review) => {
          if (review.reviewer_username === user.username) {
            return {
              ...review,
              review: newReview,
              rating: newRating,
            };
          }

          return review;
        })
      : [...reviews, userReview];

    setReviews(updatedReviews);
  }

  async function removeReview(reviewerUsername: string) {
    if (!isOwner) {
      return;
    }

    const response = await StockListsApi.removeReview(
      user.accessToken,
      stockList.list_name,
      reviewerUsername,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setReviews(
      reviews.filter((review) => review.reviewer_username !== reviewerUsername),
    );
  }

  async function getStockListReviews() {
    if (!user) {
      return;
    }

    const response = await StockListsApi.getStockListReviews(
      user.accessToken,
      stockList.username,
      stockList.list_name,
    );

    if ("error" in response) {
      console.log(response.error);
      return;
    }

    setReviews(response);
  }

  useEffect(() => {
    getStockListReviews();
  }, [user, stockList]);

  useEffect(() => {
    setNewReview(userReview?.review || "");
    setNewRating(userReview?.rating || 1);
  }, [userReview]);

  return (
    <>
      {userReview && (
        <form
          onSubmit={editReview}
          className="flex flex-col gap-4 bg-base-200 rounded-lg shadow p-4 px-6"
        >
          <div className="flex justify-between">
            <h2 className="text-lg font-bold">Your Review</h2>
            <div className="flex gap-2">
              <button
                className="btn btn-circle btn-error"
                onClick={() => {
                  setNewReview(userReview.review);
                  setNewRating(userReview.rating);
                }}
                disabled={!reviewChanged}
              >
                <FiRotateCcw />
              </button>
              <button
                type="submit"
                className="btn btn-circle btn-success"
                disabled={!reviewChanged}
              >
                <FiEdit />
              </button>
            </div>
          </div>
          <RatingStars
            name={`rating-${user!.username}`}
            rating={newRating}
            setRating={setNewRating}
          />
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Review</legend>
            <textarea
              className="textarea w-full"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />
            {newReview.length > 4000 && (
              <p className="text-error">4000 character limit</p>
            )}
          </fieldset>
        </form>
      )}
      <ul className="list mt-4">
        {filteredReviews.map((review) => (
          <li key={review.reviewer_username} className="list-row">
            <div className="flex gap-2 items-center list-col-grow">
              <h3 className="text-lg font-bold">{review.reviewer_username}</h3>
              <RatingStars
                name={`rating-${review.reviewer_username}`}
                rating={review.rating}
              />
              {isOwner && (
                <div className="flex flex-grow justify-end">
                  <button
                    onClick={() => removeReview(review.reviewer_username)}
                    className="btn btn-error btn-circle"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
            <p className="list-col-wrap">{review.review}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
