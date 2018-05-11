
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { db } from '../firebase';
import termHighlights from "../highlights/term-highlights";

import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';

class AdminPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: null,
    };

    this.syncLocalHighlights = this.syncLocalHighlights.bind(this);

  }

  componentDidMount() {
    db.onceGetUsers().then(snapshot =>
      this.setState(() => ({ users: snapshot.val() }))
    );
  }

  syncLocalHighlights() {

    // To reset highlights: Only remove highlights with highlight.metadata.type = "generated", to not remove custom selected highlights
    console.log("Syncing highlights...")

    for (const highlight of termHighlights) {
      db.onceGetHighlight(highlight.pid, highlight.id).then((snapshot) => {
        const dbHighlight = snapshot.val()

        // If highlight hasn't been imported
        if (!dbHighlight) db.doCreateHighlight(highlight.id, highlight)
      })
      .catch(error => {
        console.log('Error:', error);
      });
    }
  }

  render() {
    const { users } = this.state;

    return (

      <Grid container spacing={24} alignItems="center" direction="row" justify="center">
        <Grid item xs={8}>
          <Paper className="Basic__paper">
            <h1>Admin Page</h1>
            { !!users && <UserList users={users} /> }

            <h3>Sync Highlights</h3>
            <Button className="Submit__button" onClick={() => this.syncLocalHighlights() } varian="raised">
              Sync Local Highlights with Firebase Database
            </Button>
          </Paper>
        </Grid>
      </Grid>
        
    );
  }
}

const UserList = ({ users }) =>
  <div>
    <h3>List of Usernames of Firebase Users</h3>

    <ul>
    {Object.keys(users).map(key =>
      <li key={key}>{users[key].username}</li>
    )}
    </ul>
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AdminPage);