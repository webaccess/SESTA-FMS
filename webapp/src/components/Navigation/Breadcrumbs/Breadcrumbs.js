import React, { useEffect } from "react";
import BreadcrumbsElem from "@material-ui/core/Breadcrumbs";
import BreadcrumbItem from "./BreadcrumbItem/BreadcrumbItem";
import auth from "../../Auth/Auth";
import axios from "axios";
import { map } from "lodash";

function Breadcrumbs(props) {
  var mount = false;
  const [modules, setModules] = React.useState([]);

  useEffect(() => {
    console.log(auth.getToken());
    let userInfo = auth.getUserInfo();
    mount = true;
    const fetchData = async () => {
      let modules = Object.keys(props.modules);
      let moduleStr = "";
      map(props.modules, (module, slug) => {
        moduleStr = moduleStr + "&slug_in=" + slug;
      });
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "modules?is_active=true&roles.id_in=" +
            userInfo.role.id +
            "&slug_in=" +
            moduleStr,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken()
            }
          }
        )
        .then(res => {
          if (mount) setModules(res.data);
        });
    };
    fetchData();
    return () => {
      mount = false;
    };
  }, []);

  console.log(props.modules);
  return (
    <BreadcrumbsElem aria-label="breadcrumb">
      {map(modules, (module, key) => {
        if (key === modules.length - 1)
          return (
            <BreadcrumbItem
              last="true"
              color="textPrimary"
              href={module.url}
              aria-current="page"
            >
              {props.modules[module.slug]}
            </BreadcrumbItem>
          );
        else
          return (
            <BreadcrumbItem color="inherit" href={module.url}>
              {props.modules[module.slug]}
            </BreadcrumbItem>
          );
      })}
    </BreadcrumbsElem>
  );
}

export default Breadcrumbs;
