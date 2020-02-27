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
    title={'Users List'}
    filterData={true}
    filterBy={["email", "name"]}
    data={data} "Using Api"
    column={Usercolumns}
  />
|*****************************************************************************|
|*** Example for CallBack Function for delete data modal on Parent Component**| 
*******************************************************************************
  DeleteData = (cellid) => {
    **Delete Data Function 
    console.log("Data to be Deleted!!!", cellid);
  }

  ****** For Examples 
  https://www.npmjs.com/package/react-data-table-component

**/

import React from "react";
import DataTable, { TableHeader } from 'react-data-table-component';
import Button from '@material-ui/core/Button';
import Modal from '../UI/Modal/Modal.js';
import differenceBy from 'lodash/differenceBy';
import style from './Datatable.module.css';
import SearchInput from '../SearchInput';
import {
  Card,
  Checkbox,
} from '@material-ui/core';

const Table = (props) => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const row = selectedRows.map(r => r.id);
  const [cellId, setcellId] = React.useState([]);
  const handleChange = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);
  const editData = (event) => {
    /*Function for onClick Edit data  */
  }
  const DeleteAllData = (event) => {
    /*Function for onClick DeleteAllData  */
  }
  console.log("ALL SELECTED ROWS", selectedRows);

  const deleteDataModal = (event) => {
    setisDeleteShowing(!isDeleteShowing);
    setcellId(event.target.id);
  }

  let DataID = cellId;

  const handleLangChange = () => {
    setisDeleteShowing(!isDeleteShowing);
    props.DeleteData(DataID);
  }

  const closeDeleteModalHandler = () => {
    setisDeleteShowing(!isDeleteShowing);
  }

  const [isDeleteShowing, setisDeleteShowing] = React.useState(false);

  const column = [
    {
      cell: (cell) => <i className="material-icons" id={cell.id} onClick={editData}>edit</i>,
      button: true,
    },
    {
      cell: (cell) => <i className="material-icons" id={cell.id} onClick={deleteDataModal}>delete_outline</i>,
      button: true,
    },
  ];

  const makeColumns = (columns) => {
    for (let i in column) {
      columns.push(column[i])
    }
  }

  const [filterText, setFilterText] = React.useState('');

  let filteredItems = [];
  let filteredData = [];
  const [data, setData] = React.useState(props.filterBy);
  if (props.filterData) {
    for (let i in data) {
      filteredItems.push(props.data.filter(item => item[data[i]] && (item[data[i]].toLowerCase()).includes(filterText.toLowerCase())));
    }
    for (let i in filteredItems) {
      filteredData = filteredData.concat(filteredItems[i])
    }
    let temp = [];
    for (let i in filteredData) {
      if (temp.indexOf(filteredData[i]) <= -1) {
        temp.push(filteredData[i])
      }
    }
    filteredData = temp;
  } else {
    filteredData = props.data;
  }

  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const [toggleCleared, setToggleCleared] = React.useState(false);


  const onFilter = e => setFilterText(e.target.value);

  const contextActions = React.useMemo(() => {
    const handleDelete = () => {

      if (window.confirm(`Are you sure you want to delete:\r ${row}?`)) {
        setToggleCleared(!toggleCleared);
        setData(differenceBy(data, selectedRows, 'name'));
      }
    };
    return <Button key="delete" onClick={handleDelete} style={{ backgroundColor: 'red' }}>Delete</Button>;
  }, [data, selectedRows, toggleCleared]);

  let columns = [];
  if (props.column.length > 0) {
    columns = makeColumns(props.column);
  }
  const [noHeader, setNoHeader] = React.useState(true);
  return (
    <>
      <div>
        <div className={style.row}>
          <SearchInput
            placeholder="Search user"
            value={filterText}
            onChange={onFilter}
            type="search"
          />
        </div>
        <Card>
          <DataTable
            data={filteredData}
            title={props.title}
            columns={props.column}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            selectableRowsComponent={Checkbox}
            actions={props.actions}
            contextActions={contextActions}
            onSelectedRowsChange={handleChange}
            selectableRows
            highlightOnHover
            persistTableHead
            noHeader={noHeader}
          />
        </Card>
        <Modal
          className="modal"
          show={isDeleteShowing}
          close={closeDeleteModalHandler}
          header="SESTA FMS"
          displayCross={{ display: "none" }}
          handleEventChange={true}
          event={handleLangChange}
          footer={{
            footerSaveName: "OKAY", footerCloseName: "CLOSE",
            displayClose: { display: "true" }, displaySave: { display: "true" }
          }}
        >
          Delete Data?
          </Modal>

      </div>
    </>
  );
};

export default Table;