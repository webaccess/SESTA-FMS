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
import AssignmentTurnedInIcon from "@material-ui/icons/AssignmentTurnedIn";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import PrintIcon from "@material-ui/icons/Print";
import auth from "../../components/Auth/Auth";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Spinner from "../Spinner/Spinner.js";

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
    if (props.title === "Members") {
      props.viewData(id);
    }
  };
  const loanApproveData = (id) => {
    if (props.title === "Loans") {
      props.loanApproveData(id);
    }
  };
  const viewTask = (id) => {
    props.viewTask(id);
  };
  const viewEmi = (id) => {
    props.viewEmi(id);
  };
  const viewLoanEmi = (id) => {
    props.viewLoanEmi(id);
  };
  const customAction = (id) => {
    props.customAction(id);
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
  let dtPageTitle = props.title;
  let str = "notview";

  const [isDeleteShowing, setisDeleteShowing] = React.useState(false);
  const [isDeleteAllShowing, setisDeleteAllShowing] = React.useState(false);
  const [isActiveAllShowing, setisActiveAllShowing] = React.useState(false);
  let column = [];
  if (
    dtPageTitle !== "FPO Loans" &&
    dtPageTitle !== "Loans" &&
    dtPageTitle !== "Loan EMI Detail" &&
    dtPageTitle !== "EMI Due" &&
    dtPageTitle !== "Recent Activities" &&
    dtPageTitle !== "CSP Report" &&
    dtPageTitle !== "Loan Report"
  ) {
    column = [
      {
        cell: (cell) => (
          <div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => editData(cell.id)}
              id={cell.id}
            >
              <Tooltip title="Edit">
                <IconButton aria-label="edit" value={cell[valueformodal]}>
                  <EditIcon className={classes.editIcon} />
                </IconButton>
              </Tooltip>
            </div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => deleteDataModal(cell.id, cell[valueformodal])}
              id={cell.id}
            >
              <Tooltip title="Delete">
                <IconButton aria-label="delete">
                  <DeleteIcon className={classes.deleteIcon} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ),
        button: true,
        width: "200px",
      },
    ];
  }
  if (dtPageTitle === "Loan Task") {
    column = [
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
    ];
  }
  if (dtPageTitle === "Activities") {
    column = [
      {
        cell: (cell) => (
          <div>
            <div
              style={{ display: "inline-flex" }}
              onClick={
                cell.activitytype.name !== "Loan application collection" &&
                cell.activitytype.name !== "Collection of principal amount" &&
                cell.activitytype.name !== "Interest collection" &&
                cell.loan_application_task === null
                  ? (event) => editData(cell.id)
                  : null
              }
              id={cell.id}
            >
              <Tooltip title="Edit">
                <IconButton
                  aria-label="task"
                  value={cell[valueformodal]}
                  disabled={
                    cell.activitytype.name !== "Loan application collection" &&
                    cell.activitytype.name !==
                      "Collection of principal amount" &&
                    cell.activitytype.name !== "Interest collection" &&
                    cell.loan_application_task === null
                      ? false
                      : true
                  }
                >
                  {cell.activitytype.name !== "Loan application collection" &&
                  cell.activitytype.name !== "Collection of principal amount" &&
                  cell.activitytype.name !== "Interest collection" &&
                  cell.loan_application_task === null ? (
                    <EditIcon className={classes.editIcon} />
                  ) : (
                    <EditIcon className={classes.VisibilityIcon} />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => deleteDataModal(cell.id, cell[valueformodal])}
              id={cell.id}
            >
              <Tooltip title="Delete">
                <IconButton aria-label="delete">
                  <DeleteIcon className={classes.deleteIcon} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ),
        button: true,
        width: "200px",
      },
    ];
  }
  if (dtPageTitle === "Loan EMI") {
    column = [
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
    ];
  }
  if (dtPageTitle === "Members") {
    column = [
      {
        cell: (cell) => (
          <div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => editData(cell.id)}
              id={cell.id}
            >
              <Tooltip title="Edit">
                <IconButton aria-label="edit" value={cell[valueformodal]}>
                  <EditIcon className={classes.editIcon} />
                </IconButton>
              </Tooltip>
            </div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => deleteDataModal(cell.id, cell[valueformodal])}
              id={cell.id}
            >
              <Tooltip title="Delete">
                <IconButton aria-label="delete">
                  <DeleteIcon className={classes.deleteIcon} />
                </IconButton>
              </Tooltip>
            </div>
            <div
              style={{ display: "inline-flex" }}
              onClick={(event) => viewData(cell.id, cell[valueformodal])}
            >
              {auth.getUserInfo().role.name ===
              "CSP (Community Service Provider)" ? (
                <Tooltip title="Apply Loan">
                  <IconButton aria-label="applyloan">
                    <MoneyIcon className={classes.MoneyIcon} />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
          </div>
        ),
        button: true,
        width: "200px",
      },
    ];
  }
  if (dtPageTitle === "Loans") {
    column = [
      {
        cell: (cell) => (
          <div>
            <div
              onClick={
                cell.status === "Approved" ||
                cell.status === "InProgress" ||
                cell.status === "Completed"
                  ? (event) => viewLoanEmi(cell.id, cell[valueformodal])
                  : null
              }
              style={{ display: "inline-flex" }}
            >
              <Tooltip title="View EMI">
                <IconButton
                  aria-label="task"
                  disabled={
                    cell.status === "Approved" ||
                    cell.status === "InProgress" ||
                    cell.status === "Completed"
                      ? false
                      : true
                  }
                >
                  <VisibilityIcon className={classes.VisibilityIcon} />
                </IconButton>
              </Tooltip>
            </div>

            <div
              onClick={(event) => customAction(cell.id, cell[valueformodal])}
              style={{ display: "inline-flex" }}
            >
              {auth.getUserInfo().role.name !== "Sesta Admin" ? (
                <Tooltip title="Print">
                  <IconButton aria-label="print">
                    <PrintIcon className={classes.AssignmentTurnedInIcon} />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
            <div
              onClick={
                cell.status === "Approved" ||
                cell.status === "InProgress" ||
                cell.status === "Completed"
                  ? (event) => viewEmi(cell.id, cell[valueformodal])
                  : null
              }
              style={{ display: "inline-flex" }}
            >
              {auth.getUserInfo().role.name ===
              "CSP (Community Service Provider)" ? (
                <Tooltip title="EMI">
                  <IconButton
                    aria-label="activity"
                    disabled={
                      cell.status === "Approved" ||
                      cell.status === "InProgress" ||
                      cell.status === "Completed"
                        ? false
                        : true
                    }
                  >
                    <AssignmentIndIcon
                      className={classes.AssignmentTurnedInIcon}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
            <div
              onClick={
                cell.status === "Approved" ||
                cell.status === "InProgress" ||
                cell.status === "Completed"
                  ? (event) => viewTask(cell.id, cell[valueformodal])
                  : null
              }
              style={{ display: "inline-flex" }}
            >
              {auth.getUserInfo().role.name ===
              "CSP (Community Service Provider)" ? (
                <Tooltip title="Task">
                  <IconButton
                    aria-label="task"
                    disabled={
                      cell.status === "Approved" ||
                      cell.status === "InProgress" ||
                      cell.status === "Completed"
                        ? false
                        : true
                    }
                  >
                    <AssignmentTurnedInIcon
                      className={classes.AssignmentTurnedInIcon}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
            <div
              onClick={(event) => loanApproveData(cell.id, cell[valueformodal])}
              style={{ display: "inline-flex" }}
            >
              {auth.getUserInfo().role.name === "FPO Admin" ? (
                <Tooltip title="Loan Approval">
                  <IconButton aria-label="approve">
                    <EditIcon className={classes.editIcon} />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )}
            </div>
          </div>
        ),
        button: true,
        width: "200px",
      },
    ];
  }

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
        {/*{props.showSetAllActive ? (
          <Button
            key="active"
            onClick={handleActive}
            style={{ backgroundColor: "primary", color: "white" }}
          >
            Active
          </Button>
        ) : null}*/}
      </div>
    );
  }, [data, selectedRows, toggleCleared]);

  let columns = [];
  if (props.column.length > 0) {
    columns = makeColumns(props.column);
  }

  if (props.progressComponent === true) {
    return <Spinner />;
  }

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
        <Card className={style.tableCard}>
          <DataTable
            data={filteredData}
            title={props.title}
            columns={props.column}
            /** pagination */
            pagination={props.pagination}
            paginationServer
            paginationDefaultPage={props.paginationDefaultPage}
            paginationPerPage={props.paginationPerPage}
            paginationTotalRows={props.paginationTotalRows}
            paginationRowsPerPageOptions={props.paginationRowsPerPageOptions}
            onChangeRowsPerPage={props.onChangeRowsPerPage}
            onChangePage={props.onChangePage}
            /** Sort */
            onSort={props.onSort}
            sortServer
            /** progress spinner */
            progressComponent
            selectableRowsComponent={Checkbox}
            contextActions={contextActions}
            actions={handleEditEvent}
            onSelectedRowsChange={handleChange}
            selectableRows={props.selectableRows}
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
            conditionalRowStyles={props.conditionalRowStyles}
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
