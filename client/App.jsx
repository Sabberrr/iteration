/**
 * ************************************
 *
 * @module  App.jsx
 * @author
 * @date
 * @description
 *
 * ************************************
 */
import React, { Component } from 'react';
import MainContainer from './containers/MainContainer.jsx';
import TrailContainer from './containers/TrailContainer.jsx';
import TrailContainerModal from './containers/TrailContainerModal.jsx';
import NavContainer from './containers/NavContainer.jsx';
import { Redirect, Link } from 'react-router-dom';

//state includes data retrieved from REI API, selects selected trail
// holds trail specific comments pulled from database

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trailData: [],
      selectedTrail: null,
      comments: [],
      diffKey: false,
      displayTrailModal: false,
      favorites: [],
      currentUsername: '',
      loggedOut: false,
      rerender: false
    };
    this.getTrail = this.getTrail.bind(this);
    this.noTrail = this.noTrail.bind(this);
    this.postComment = this.postComment.bind(this);
    this.displayTrail = this.displayTrail.bind(this);
    this.showKey = this.showKey.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    this.getFavorites = this.getFavorites.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  //fetches data from REI API and sets to state when the page loads
  componentDidMount() {
    // OBTAINING CLIENT'S BROWSER LOCATION
    function getClientBrowserLocation(position) {
      const { latitude, longitude } = position.coords;
      const latlon = { latitude, longitude };
      // modify THIS ROUTE depending on backend
      fetch('/data', {
        method: 'POST',
        body: JSON.stringify(latlon),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(json => {
          this.setState({ trailData: json.trails });
        })
        .catch(e => console.error('unable to post', e));
    }

    function handleErrorGettingBrowserLocation() {
      const latlon = { latitude: 34.383966, longitude: -118.537239 };
      fetch('/data', {
        method: 'POST',
        body: JSON.stringify(latlon),
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(json => {
          this.setState({ trailData: json.trails });
        })
        .catch(e => console.error('unable to post', e));
    }
    navigator.geolocation.getCurrentPosition(
      getClientBrowserLocation.bind(this),
      handleErrorGettingBrowserLocation.bind(this)
    );

    fetch('/gettingUser')
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (data !== 'nothing') {
          this.setState({ currentUsername: data });
        } else {
          this.setState({ rerender: true });
        }
      });
  }

  componentDidUpdate() {
    this.getFavorites();
  }

  addFavorite(username, id) {
    fetch('/favorites', {
      method: 'POST',
      body: JSON.stringify({ username: username, trailid: id }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  getFavorites() {
    fetch('/getfavorites', {
      method: "POST",
      body: JSON.stringify({username: this.state.currentUsername}),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json)
      .then(data => {
        console.log('get favorites data', data);
        // this.setState({favorites : data})
        // this.setState({ favorites: data.favorites })
      });
  }

  //invoked by on-click function in TrailDisplay, sets selected trail in state
  getTrail(id) {
    // console.log('in getTrail', this.state.selectedTrail)
    let trailsArr = this.state.trailData.slice();
    for (let i = 0; i < trailsArr.length; i++) {
      if (trailsArr[i].id === +id) {
        this.setState({
          selectedTrail: trailsArr[i],
          displayTrailModal: true
        });
      }
    }
    fetch('/comments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        id: id
      }
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        this.setState(state => {
          return {
            ...state,
            comments: res
          };
        });
      });
  }
  //closes TrailDisplay overlay
  noTrail() {
    this.setState({
      selectedTrail: null,
      displayTrailModal: false,
      comments: []
    });
  }
  //invoked when clicking on the map popups
  displayTrail(selectedHike) {
    this.setState({
      selectedTrail: selectedHike,
      displayTrailModal: true
    });
  }
  //toggle that is invoked when clicking on the "difficulty" in the list items
  showKey() {
    this.setState(state => {
      return { diffKey: state.diffKey ? false : true };
    });
  }
  //adds comment and author to database and pulls back all comments for specified trail and sets to state
  postComment(id, comment) {
    fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        comment: comment,
        author: this.state.currentUsername
      })
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        this.setState(state => {
          return {
            ...state,
            comments: res
          };
        });
      });
  }

  logOut() {
    fetch('/logout');
    this.setState({ loggedOut: true });
  }

  //renders MainContainer and conditionally renders TrailContainer
  render() {
    // if (this.state.rerender) {
    //   return <Redirect to='/' />;
    // }

    if (this.state.loggedOut || this.state.rerender) {
      return <Redirect to='/' />;
    }
    return (
      <div className='appContainer'>
        <NavContainer logOut={this.logOut} />
        <MainContainer
          displayTrailModal={this.state.displayTrailModal}
          noTrail={this.noTrail}
          className='mainContainer'
          trailData={this.state.trailData}
          getTrail={this.getTrail}
          selectedTrail={this.state.selectedTrail}
          displayTrail={this.displayTrail}
          showKey={this.showKey}
          diffKey={this.state.diffKey}
          addFavorite={this.addFavorite}
          displayTrailModal={this.state.displayTrailModal}
          currentUsername={this.state.currentUsername}
        />
        <TrailContainerModal
          // className='modal'
          trailData={this.state.trailData}
          displayTrailModal={this.state.displayTrailModal}
          noTrail={this.noTrail}
          selectedTrail={this.state.selectedTrail}
          postComment={this.postComment}
          comments={this.state.comments}
          getTrail={this.getTrail}
        />
        {/* {this.state.selectedTrail && (
          <TrailContainer
            className='modal'
            trailData={this.state.trailData}
            selectedTrail={this.state.selectedTrail}
            noTrail={this.noTrail}
            postComment={this.postComment}
            comments={this.state.comments}
            getTrail={this.getTrail}
          />
        )} */}
      </div>
    );
  }
}

export default App;
