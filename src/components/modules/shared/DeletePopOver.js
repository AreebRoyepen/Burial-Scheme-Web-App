import React, { useState, useRef, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import "../../../styles/eventCard.css";

const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function SimplePopover(props) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [data] = useState(props.content);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (x) => {
    if (x == true) {
      props.message(data);
    }
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className=" u-float-right">
      <Button
        aria-describedby={id}
        variant="contained"
        color="primary"
        onClick={handleClick}
        className=" cardButtons"
      >
        Delete
      </Button>
      <Popover
        className="popOverOverlay custopm-pop-over1 "
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Typography className={classes.typography}>
          Are you sure you want to delete{" "}
          <strong>
            {data.name} {data.surname}
          </strong>
          ?
        </Typography>
        <input
          type="submit"
          value="confirm"
          name="button"
          onClick={() => {
            handleClose(true);
          }}
          className="cardButtons event-right-delete card-link u-float-right"
          id={JSON.stringify(data.active)}
        />
        <input
          type="submit"
          value="cancel"
          name="button"
          className="cardButtons event-right-delete  card-link u-float-right"
          id={JSON.stringify(data.active)}
          onClick={handleClose}
        />
      </Popover>
    </div>
  );
}
