import React from "react";
import DataTable from "react-data-table-component";
import Button from "../UI/Button/Button.js";
import Modal from "../UI/Modal/Modal.js";
import style from "./Datatable.module.css";
import SearchInput from "../SearchInput";
import differenceBy from "lodash/differenceBy";
import { Card, Checkbox } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { makeStyles } from "@material-ui/styles";
import MoneyIcon from "@material-ui/icons/Money";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
  editIcon: {
    color: "#028941",
    "&:hover": {
      color: "#026430",
    },
    "&:active": {
      color: "#03b053",
    },
  },
  deleteIcon: {
    color: "#e60000",
    "&:hover": {
      color: "#b30000",
    },
    "&:active": {
      color: "#ff1a1a",
    },
  },
  MoneyIcon: {
    color: "#131514",
    "&:hover": {
      color: "#282F2B",
    },
    "&:active": {
      color: "#282F2B",
    },
  },
}));

const Table = (props) => {
  const classes = useStyles();
  const [selectedRows, setSelectedRows] = React.useState([]);
  const row = selectedRows.map((r) => r.id);
  const [cellId, setcellId] = React.useState([]);
  const [cellName, setcellName] = React.useState([]);
  const handleChange = React.useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);
  const deleteDataModal = (id, value) => {
    setisDeleteAllShowing(!isDeleteAllShowing);
    setcellId(id);
    setcellName(value);
  };

  let searchFilter = props.filters;
  let selected = selectedRows;
  let dataName = cellName;
  let DataID = cellId;

  const editData = (id) => {
    props.editData(id);
  };
  const viewData = (id) => {
    props.viewData(id);
  };

  const handleDeleteAllEvent = () => {
    props.DeleteAll(row, DataID, setisDeleteShowing(!isDeleteShowing));
    props.DeleteData(DataID, row);
    setSelectedRows([]);
  };

  const handleActiveAllEvent = (event) => {
    let numberOfIsActive = [];
    for (let id in selected) {
      numberOfIsActive.push(selected[id]["is_active"]);
    }
    props.ActiveAll(
      row,
      selected,
      numberOfIsActive,
      setisDeleteShowing(!isDeleteShowing)
    );
    setSelectedRows([]);
  };

  const handleEditEvent = () => {
    setisDeleteShowing(!isDeleteShowing);
    props.editData(DataID, selectedId);
  };
  const handleViewEvent = () => {
    setisDeleteShowing(!isDeleteShowing);
    props.viewData(DataID, selectedId);
  };

  const closeDeleteAllModalHandler = () => {
    setisDeleteAllShowing(!isDeleteAllShowing);
  };

  const closeActiveAllModalHandler = () => {
    setisActiveAllShowing(!isActiveAllShowing);
  };

  let valueformodal = props.columnsvalue;
  let valueForMemberPage = props.title;
  let str = "notview";

  const [isDeleteShowing, setisDeleteShowing] = React.useState(false);
  const [isDeleteAllShowing, setisDeleteAllShowing] = React.useState(false);
  const [isActiveAllShowing, setisActiveAllShowing] = React.useState(false);

  const column = [
    {
      cell: (cell) => (
        <div onClick={(event) => editData(cell.id)} id={cell.id}>
          <Tooltip title="Edit">
            <IconButton aria-label="edit" value={cell[valueformodal]}>
              <EditIcon className={classes.editIcon} />
            </IconButton>
          </Tooltip>
        </div>
      ),
      button: true,
    },
    {
      cell: (cell) => (
        <div
          onClick={(event) => deleteDataModal(cell.id, cell[valueformodal])}
          id={cell.id}
        >
          <Tooltip title="Delete">
            <IconButton aria-label="delete">
              <DeleteIcon className={classes.deleteIcon} />
            </IconButton>
          </Tooltip>
        </div>
      ),
      button: true,
    },
    {
      cell: (cell) => (
        <div onClick={(event) => viewData(cell.id, cell[valueformodal])}>
          {valueForMemberPage == "Members" ? (
            <Tooltip title="View">
              <IconButton aria-label="view">
                <MoneyIcon className={classes.MoneyIcon} />
              </IconButton>
            </Tooltip>
          ) : (
            ""
          )}
        </div>
      ),
      button: true,
    },
  ];

  const makeColumns = (columns) => {
    for (let Usercolumns in column) {
      columns.push(column[Usercolumns]);
    }
  };

  const [filterText, setFilterText] = React.useState("");
  let filteredItems = [];
  let filteredData = [];
  const [data, setData] = React.useState(props.filterBy);
  if (props.filterData) {
    for (let values in data) {
      filteredItems.push(props.data.filter((item) => item[data[values]]));
    }
    for (let i in filteredItems) {
      filteredData = filteredData.concat(filteredItems[i]);
    }
    let temp = [];
    for (let values in filteredData) {
      if (temp.indexOf(filteredData[values]) <= -1) {
        temp.push(filteredData[values]);
      }
    }
    filteredData = temp;
  } else {
    filteredData = props.data;
  }

  let selectedId = [];
  for (let values in selected) {
    selectedId.push(selected[values]["id"]);
  }
  let SelectedId = selectedId.join("");

  const onFilter = (event) => {
    setFilterText(event.target.value);
  };

  const [toggleCleared, setToggleCleared] = React.useState(false);
  const contextActions = React.useMemo(() => {
    const handledelete = () => {
      setisDeleteAllShowing(true);
      setData(differenceBy(data, selectedRows, "name"));
    };

    const handleActive = () => {
      setisActiveAllShowing(true);
      setData(differenceBy(data, selectedRows, "name"));
    };
    return (
      <div>
        <Button
          key="delete"
          onClick={handledelete}
          style={{ backgroundColor: "#d63447", color: "white" }}
        >
          Delete
        </Button>
        &nbsp;&nbsp;&nbsp;
        {props.showSetAllActive ? (
          <Button
            key="active"
            onClick={handleActive}
            style={{ backgroundColor: "primary", color: "white" }}
          >
            Active
          </Button>
        ) : null}
      </div>
    );
  }, [data, selectedRows, toggleCleared]);

  let columns = [];
  if (props.column.length > 0) {
    columns = makeColumns(props.column);
  }
  // let valuesSelected = [];
  // for (let values in selected) {
  //   valuesSelected.push(selected[values]['is_active'])
  // }
  // var count = {};
  // valuesSelected.forEach(function (i) { count[i] = (count[i] || 0) + 1; });

  return (
    <>
      <div>
        {props.showSearch ? (
          <div className={style.row}>
            <SearchInput
              placeholder={props.Searchplaceholder}
              onChange={onFilter}
              type="search"
            />
          </div>
        ) : (
          <p></p>
        )}
        <Card>
          <DataTable
            data={filteredData}
            title={props.title}
            columns={props.column}
            pagination
            selectableRowsComponent={Checkbox}
            contextActions={contextActions}
            actions={handleEditEvent}
            onSelectedRowsChange={handleChange}
            selectableRows
            searchFilter={searchFilter}
            highlightOnHover
            clearSelectedRows={toggleCleared}
            persistTableHead
            DeleteAllSucccess={props.DeleteAllSucccess}
            noDataComponent={
              props.noDataComponent ? (
                props.noDataComponent
              ) : (
                <p>
                  There are no records to display in <b>{props.title}</b>
                </p>
              )
            }
            noHeader={selected.length === 0 || selected.length < 2}
          />
        </Card>
        <Modal
          className="modal"
          show={isDeleteAllShowing}
          close={closeDeleteAllModalHandler}
          displayCross={{ display: "none" }}
          handleEventChange={true}
          event={handleDeleteAllEvent}
          handleDeleteAllEvent={handleDeleteAllEvent}
          footer={{
            footerSaveName: "OKAY",
            footerCloseName: "CLOSE",
            displayClose: { display: "true" },
            displaySave: { display: "true" },
          }}
        >
          {selectedRows.length > 1 ? (
            <p>
              {" "}
              Do you want to delete selected <b>{props.title}</b>
            </p>
          ) : (
            <p>
              {" "}
              {props.DeleteMessage} <b>{dataName}</b> ?
            </p>
          )}
        </Modal>
        <Modal
          className="modal"
          show={isActiveAllShowing}
          close={closeActiveAllModalHandler}
          displayCross={{ display: "none" }}
          handleEventChange={true}
          event={handleActiveAllEvent}
          handleActiveAllEvent={handleActiveAllEvent}
          footer={{
            footerSaveName: "OKAY",
            footerCloseName: "CLOSE",
            displayClose: { display: "true" },
            displaySave: { display: "true" },
          }}
        >
          <p> Are you sure you want to toggle the status ?</p>
        </Modal>
      </div>
    </>
  );
};

export default Table;
