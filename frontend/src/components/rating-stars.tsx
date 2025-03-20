export default function RatingStars({ name, rating, setRating }: { name: string; rating: number; setRating?: (rating: number) => void; }) {
  return (
    <div className="flex gap-4">
      <div className="rating">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) =>
          <input
            key={star}
            type="radio"
            name={name}
            className="mask mask-star-2 bg-warning"
            aria-label={`${star} star`}
            value={star}
            checked={star === rating}
            onChange={() => setRating?.(star)}
          />
        )}
      </div>
      <p className="text-warning">({rating}/10)</p>
    </div>

  );
}
