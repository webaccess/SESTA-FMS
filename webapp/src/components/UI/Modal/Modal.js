/**
Modal has following child attributes:
show: (function call) for displaying Modal,
close:(function call) for closing Modal,
header:(text) for setting modal header,
event:(function) for passing event,
footer: (object) footer object contains multiple attributes of footer buttons (i.e close and save(event) button)
{footerSaveName/footerCloseName:(text) for saving button name,
footerHref:(text) for setting link to button,
displayClose/displaySave:(property) for passing css property to show button or not.}

**Sample code for using modal**

        <Modal
          className="modal"
          show={BOOLEAN FUNCTION}
          close={BOOLEAN FUNCTION}
          header="SESTA FMS"
          event={EVENT FUNCTION}
          footer={{
            footerSaveName: "OKAY", footerCloseName: "CLOSE",
            footerHref: "#LINK",
            displayClose: { display: "true" }, displaySave: { display: "true" }
          }}
        >
          Maybe aircrafts fly very high because they don't want to be seen in plane sight?
        </Modal>
      
**/

import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


const Modal = (props) => {
  function _onClick(e, close) {
    if (!props.event) {
      return;
    }
    props.event(e);
    props.close(close);

  }

  return (
    <Dialog
      open={props.show}
      onClose={props.close}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{props.header}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {props.children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.close} style={props.footer.displayClose} color="primary">
          {props.footer.footerCloseName}
        </Button>
        <Button onClick={_onClick} href={props.footer.footerHref} style={props.footer.displaySave} color="primary" autoFocus>
          {props.footer.footerSaveName}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Modal;

