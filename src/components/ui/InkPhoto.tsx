import Image from "next/image";
import styles from "./InkPhoto.module.css";

export interface InkPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  /** width / height of the frame. */
  ratio?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * A photograph laid on the paper: hairline frame, slight sepia, multiply
 * blend so the grain shows through, caption and credit set in the display face.
 */
export function InkPhoto({
  src,
  alt,
  caption,
  credit,
  ratio = 1.6,
  className = "",
  priority = false,
  sizes = "(max-width: 767px) 100vw, 60vw",
}: InkPhotoProps) {
  return (
    <figure className={`${styles.figure} ${className}`}>
      <div className={styles.frame} style={{ aspectRatio: String(ratio) }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.img} />
      </div>
      {caption || credit ? (
        <figcaption className={styles.caption}>
          {caption ? <span>{caption}</span> : null}
          {credit ? <span className={styles.credit}>{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
