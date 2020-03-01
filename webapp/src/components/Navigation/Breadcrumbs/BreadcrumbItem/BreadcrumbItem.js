import React from "react";

function BreadcrumbItem(props) {

    return(
      <Link color="inherit" href="/" onClick={handleClick}>
      Material-UI
      </Link>
    );
}

export default BreadcrumbItem;