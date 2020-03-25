/**
 * DataTable
 * Higher Order Component that Shows data in Rows and Columns 
 * Users can sort data ASC and DESC and also filter data.
 * Datatable has following child attributes:
 * Column: (function call) for displaying column,
 * Data:(function call) for Showing Data,
 * Title:(text) for setting Datatable header,
 * Actions:(function) for passing actions,
 * Pagination:(BOOLEAN FUNCTION)
 * Sortable:(BOOLEAN FUNCTION)
**Sample code for using Datatable**
  const Usercolumns = [
    {
      name: 'Table Head Name',
      selector: 'row Name',
      sortable: BOOLEAN FUNCTION,
      width: '""Styling""'
    },
  ];
  <Table
    title={"Villages"}
    showSearch={false}
    filterData={true}
    noDataComponent={"No Records To be shown"}
    Searchplaceholder={"Seacrh by Village Name"}
    filterBy={["name"]}
    data={data}
    column={Usercolumns}
    DeleteMessage={"Are you Sure you want to Delete"}
  />
|*****************************************************************************|
|*** Example for CallBack Function for delete data modal on Parent Component**| 
*******************************************************************************
  DeleteData = (cellid) => {
    **Delete Data Function 
    console.log("Data to be Deleted!!!", cellid);
  }
  ****** For More Examples 
  https://www.npmjs.com/package/react-data-table-component
**/

import React from "react";
import DataTable from "react-data-table-component";
import Button from "../UI/Button/Button.js";
import Modal from "../UI/Modal/Modal.js";
import style from "./Datatable.module.css";
import SearchInput from "../SearchInput";
import differenceBy from "lodash/differenceBy";

import { Card, Checkbox } from "@material-ui/core";

const Table = props => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const row = selectedRows.map(r => r.id);
  const [cellId, setcellId] = React.useState([]);
  const [cellName, setcellName] = React.useState([]);
  const handleChange = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);
  const deleteDataModal = event => {
    setisDeleteAllShowing(!isDeleteAllShowing);
    setcellId(event.target.id);
    setcellName(event.target.value);
  };

  let searchFilter = props.filters;
  let selected = selectedRows;
  let dataName = cellName;
  let DataID = cellId;

  const editData = event => {
    props.editData(event.target.id);
  };

  const handleDeleteAllEvent = () => {
    props.DeleteAll(row, DataID, setisDeleteShowing(!isDeleteShowing));
    props.DeleteData(DataID, row, setToggleCleared(!toggleCleared));
  };

  const handleEditEvent = () => {
    setisDeleteShowing(!isDeleteShowing);
    props.editData(DataID, selectedId);
  };

  const closeDeleteAllModalHandler = () => {
    setisDeleteAllShowing(!isDeleteAllShowing);
  };

  let valueformodal = props.columnsvalue;

  const [isDeleteShowing, setisDeleteShowing] = React.useState(false);
  const [isDeleteAllShowing, setisDeleteAllShowing] = React.useState(false);

  const column = [
    {
      cell: cell => (
        <button
          className="material-icons"
          className={style.editButton}
          id={cell.id}
          value={cell[valueformodal]}
          onClick={editData}
        >
          edit
        </button>
      ),
      button: true
    },
    {
      cell: cell => (
        <button
          className="material-icons"
          className={style.deleteButton}
          id={cell.id}
          value={cell[valueformodal]}
          onClick={deleteDataModal}
        >
          delete
        </button>
      ),
      button: true
    }
  ];

  const makeColumns = columns => {
    for (let i in column) {
      columns.push(column[i]);
    }
  };

  const [filterText, setFilterText] = React.useState("");
  const [noHeader, setNoHeader] = React.useState(true);
  let filteredItems = [];
  let filteredData = [];
  const [data, setData] = React.useState(props.filterBy);
  if (props.filterData) {
    for (let i in data) {
      filteredItems.push(
        props.data.filter(
          item =>
            item[data[i]] &&
            item[data[i]].toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }
    for (let i in filteredItems) {
      filteredData = filteredData.concat(filteredItems[i]);
    }
    let temp = [];
    for (let i in filteredData) {
      if (temp.indexOf(filteredData[i]) <= -1) {
        temp.push(filteredData[i]);
      }
    }
    filteredData = temp;
  } else {
    filteredData = props.data;
  }
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState();

  let selectedId = [];
  for (let i in selected) {
    selectedId.push(selected[i]["id"]);
  }
  let SelectedId = selectedId.join("");
  let SelectedIds = SelectedId.substring(0, SelectedId.length - 1);

  const onFilter = e => {
    setFilterText(e.target.value);
  };

  const [toggleCleared, setToggleCleared] = React.useState(false);
  const contextActions = React.useMemo(() => {
    const handledelete = () => {
      setisDeleteAllShowing(true);
      setData(differenceBy(data, selectedRows, "name"));
    };
    return (
      <Button
        key="delete"
        onClick={handledelete}
        style={{ backgroundColor: "#d63447", color: "white" }}
      >
        Delete
      </Button>
    );
  }, [data, selectedRows, toggleCleared]);

  let columns = [];
  if (props.column.length > 0) {
    columns = makeColumns(props.column);
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
        <Card>
          <DataTable
            data={filteredData}
            title={props.title}
            columns={props.column}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
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
            displaySave: { display: "true" }
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
      </div>
    </>
  );
};

export default Table;