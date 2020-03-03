import React from "react";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";

function BreadcrumbItem(props) {
  const { last, color, href, ...rest } = props;
  return last ? (
    <Typography color={color}>{props.children}</Typography>
  ) : (
    <Link color={color} href={href} {...rest}>
      {props.children}
    </Link>
  );
}

export default BreadcrumbItem;
