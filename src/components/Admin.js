
import React, { Component } from 'react';

import withAuthorization from './withAuthorization';
import { auth, db } from '../firebase';
import termHighlights from "../highlights/term-highlights";

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
      db.onceGetHighlight(highlight.id).then((snapshot) => {
        const dbHighlight = snapshot.val()

        // If highlight hasn't been imported
        if (!dbHighlight) db.doCreateHighlight(highlight.id, highlight)
      })
      .catch(error => {
        console.log('Error', error);
      });
    }
  }

  render() {
    const { users } = this.state;

    return (
      <div>
        <h1>Admin Page</h1>
        <p>The Home Page is accessible by every signed in user.</p>
        { !!users && <UserList users={users} /> }

        <h2>Sync Highlights</h2>
        <button onClick={() => this.syncLocalHighlights() } >
          Sync Local Highlights with Firebase Database
        </button>

      </div>


    );
  }
}

const UserList = ({ users }) =>
  <div>
    <h2>List of Usernames of Users</h2>
    <p>(Saved on Sign Up in Firebase Database)</p>

    {Object.keys(users).map(key =>
      <div key={key}>{users[key].username}</div>
    )}
  </div>

const authCondition = (authUser) => !!authUser;

export default withAuthorization(authCondition)(AdminPage);