import { useState } from "react";

import styles from "./styles.module.css";

type ScreenshotFigureProps = {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
};

export function ScreenshotFigure({
  src,
  alt,
  caption,
  width = 1200,
  height = 750,
}: ScreenshotFigureProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={styles.figure}>
      <div className={styles.figureFrame}>
        {failed ? (
          <div className={styles.skeleton} role="img" aria-label={alt}>
            <strong>Screenshot placeholder</strong>
            <span>
              Drop <code>{src.replace(/^\//, "")}</code> into{" "}
              <code>/public/</code>
            </span>
          </div>
        ) : (
          <img
            className={styles.figureImg}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption className={styles.figcaption}>{caption}</figcaption>
    </figure>
  );
}
