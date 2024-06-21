import React, {useState, useEffect,} from "react";
import { BrowserRouter as Router, Routes, Route,} from 'react-router-dom';
import axios from 'axios';
import './style.css';
import Home from './component/Home';
import YoutubeUi from "./component/youtube";
import Words from "./component/Words"
import LearnWord from "./component/LearnWord";


export default function App() {
  const [playList, setPlayList] = useState({});
  const [videoData, setVideoData] = useState({});
  const getPlayListItem = async (playlistId) => {
    try {
      const response = await axios.post('http://localhost:5000/item', { playlistId });
      const newVideoData = response.data.items.reduce((acc, item) => {
        acc[item.snippet.resourceId.videoId] = {
          thumbnail: item.snippet.thumbnails.default.url,
          title: item.snippet.title
        };
        return acc;
      }, {});

      setVideoData(prev => ({
        ...prev,
        [playlistId]: newVideoData
      }));
      console.log("videoData: ", videoData)
    } catch (error) {
      console.error('getPlayListItem:', error);
    }
  };


  const handlePlayList = (data) => {
    setPlayList(data);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home playList={playList} videoData={videoData} handlePlayList={handlePlayList} getPlayListItem={getPlayListItem} />} />
        <Route path="/Youtube" element={<YoutubeUi />} />
        <Route path="/Words" element={<Words />} />
        <Route path="/LearnWord" element={<LearnWord />}/>
      </Routes>
    </Router>
  );
}
