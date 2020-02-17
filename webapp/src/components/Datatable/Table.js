/**
 *
 * DataTable
 * Higher Order Component that Shows data in Rows and Columns 
 * Users can sort data ASC and DESC and also filter data.
 *
 */

import React from "react";
import DataTable from 'react-data-table-component';
import Checkbox from '@material-ui/core/Checkbox';
import styled from 'styled-components';
import IconButton from '@material-ui/core/IconButton';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import Button from '@material-ui/core/Button';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import { TextField } from '@material-ui/core';
function deleteFunction() {
  alert('Delete Data!!!!');
}


function EditFunction() {
  alert('Edit Data!!!!');
}


const column = [
  {
    cell: () => <IconButton aria-label="Edit" onClick={EditFunction}><EditOutlinedIcon /></IconButton>,
    button: true,
  },
  {
    cell: () => <IconButton aria-label="Edit" onClick={deleteFunction} ><DeleteOutlineOutlinedIcon /></IconButton>,
    button: true,
  },
  {
    cell: () => <Button variant="contained" color="primary">Action</Button>,
    button: true,
  },
]

const FilterComponent = ({ filterText, onFilter, onClear, props }) => (
  <>{console.log("props ", props)}
    <TextField id="search" type="text" placeholder={"Search By Name"} value={filterText} onChange={onFilter} />
    <Button onClick={onClear} className={"ClearButton"}> Search</Button>
  </>
);

const makeColumns = (columns) => {
  for (let i in column) {
    columns.push(column[i])
  }
}

const Table = (props) => {
  console.log("props", props);
  const [filterText, setFilterText] = React.useState('');
  console.log("props.filterby ", props.filterby);
  let filteredItems;
  if (props.filterData) {
    filteredItems = props.data.filter(item => item[props.filterBy] && (item[props.filterBy]).includes(filterText));
  } else {
    filteredItems = props.data;
  }
  const [selectedRows] = React.useState([]);
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return <FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} />;
  }, [filterText, resetPaginationToggle]);
  const contextActions = React.useMemo(() => {
    const handleDelete = () => {

      if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map(r => r.name)}?`)) {
        console.log('dsjgasdjgasd')
      }
    };

    return <Button key="delete" onClick={handleDelete} style={{ backgroundColor: 'red' }}>Delete</Button>;
  }, [selectedRows]);

  let columns = [];
  if (props.column.length > 0) {
    columns = makeColumns(props.column);
  }

  return (
    <DataTable
      data={filteredItems}
      title={props.title}
      columns={props.column}
      pagination
      paginationResetDefaultPage={resetPaginationToggle}
      subHeader
      subHeaderComponent={subHeaderComponentMemo}
      selectableRowsComponent={Checkbox}
      actions={props.actions}
      contextActions={contextActions}
      selectableRows
      highlightOnHover
      persistTableHead
    />

  );
};

export default Table;