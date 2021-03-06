import React from "react";
import classnames from "classnames/bind";
import { Heading, Text, Button } from "@cockroachlabs/ui-components";
import styles from "./emptyPanel.module.scss";
import { Anchor } from "../../anchor";
import heroBannerLp from "../../assets/heroBannerLp.png";

const cx = classnames.bind(styles);

interface IMainEmptyProps {
  title?: string;
  description?: string;
  label?: React.ReactNode;
  link?: string;
  anchor?: string;
  backgroundImage?: string;
}

type OnClickXORHref =
  | {
      onClick?: () => void;
      buttonHref?: never;
    }
  | {
      onClick?: never;
      buttonHref?: string;
    };

export type EmptyPanelProps = OnClickXORHref & IMainEmptyProps;

export const EmptyPanel: React.FC<EmptyPanelProps> = ({
  title = "No results",
  description,
  anchor = "Learn more",
  label = "Learn more",
  link,
  backgroundImage = heroBannerLp,
  onClick,
  buttonHref,
}) => (
  <div
    className={cx("cl-empty-view")}
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <Heading type="h2">{title}</Heading>
    <div className={cx("cl-empty-view__content")}>
      <main className={cx("cl-empty-view__main")}>
        <Text>
          {description}
          {link && (
            <Anchor href={link} className={cx("cl-empty-view__main--anchor")}>
              {anchor}
            </Anchor>
          )}
        </Text>
      </main>
      <footer className={cx("cl-empty-view__footer")}>
        <Button
          intent="primary"
          onClick={() =>
            buttonHref ? window.open(buttonHref) : onClick && onClick()
          }
        >
          {label}
        </Button>
      </footer>
    </div>
  </div>
);
