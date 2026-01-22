import { Href, Link } from "expo-router";
import { type ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: Href & string };

/**
 * External link component for web PWA
 * Opens links in a new tab
 */
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
      href={href}
    />
  );
}
