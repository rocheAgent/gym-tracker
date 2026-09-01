import './ExerciseImage.css';

export default function ExerciseImage({ exercise, className = '', alt = '' }) {
  const frames = exercise.frames?.length >= 2 ? exercise.frames : [];

  if (frames.length === 0) {
    return exercise.image ? <img className={className} src={exercise.image} alt={alt} loading="lazy" /> : null;
  }

  return (
    <span className={`exercise-image-animation ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
      {frames.map((frame, index) => (
        <img
          key={frame.index || index}
          className="exercise-image-animation__frame"
          src={frame.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ animationDelay: `${index * 0.6}s` }}
        />
      ))}
    </span>
  );
}
