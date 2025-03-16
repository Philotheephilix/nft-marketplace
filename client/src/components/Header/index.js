import React from "react";
import { useSelector } from "react-redux";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CssBaseline from "@material-ui/core/CssBaseline";
import Button from "@material-ui/core/Button";
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Logo from "../../assets/logo.png";

import {useStyles} from './styles.js'
import { useHistory } from "react-router-dom";

const Header = () => {
  const classes = useStyles();
  const account = useSelector((state) => state.allNft.account);

  const history = useHistory();

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={classes.header}>
        <Toolbar>
          <div className={classes.buttonGroup} style={{ display: 'flex', alignItems: 'center' }}>
            <img src={Logo} alt="Logo" className={classes.logo} onClick={() => history.push('/')} style={{ cursor: 'pointer' ,height:'5rem',width:'5rem'}} />
            <Button color="inherit" onClick={() => history.push('/buy-nft')} className={classes.button}>Buy</Button>
            <Button color="inherit" onClick={() => history.push('/sell-nft')} className={classes.button}>Sell</Button>
          </div>
          <div className={classes.account}>
            <AccountBalanceWalletIcon titleAccess="Wallet Address" className={classes.walletIcon}/>
            <Typography variant="subtitle1">{account.slice(0,7)}...{account.slice(-4)}</Typography>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </React.Fragment>
  );
};

export default Header;
