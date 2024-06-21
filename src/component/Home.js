// Home.js
import React from 'react';
import GoogleLoginComponent from './GoogleLoginComponent';
import { useNavigate } from 'react-router-dom';
const Home = ({ playList, videoData, handlePlayList, getPlayListItem }) => {
    const navigate = useNavigate();

    const handleVideoClick = (videoId) => {
        navigate('/Youtube', { state: { videoId } });
    };
    const handleWordsClick = (videoId) => {
        navigate('/Words');
    };

    return (
        <div className='container'>
            <div style={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'baseline'}}>
            <GoogleLoginComponent onReceive={handlePlayList}/>
            <button onClick={() => handleWordsClick()}>
                단어장
            </button>
            </div>
            <div className='thumbnail-container'>
                {playList.items && playList.items.map((item, index) => (
                    <div className='item'
                         onClick={() => getPlayListItem(item.id)}
                         key={index}
                         style={{cursor: 'pointer'}}
                    >
                        {videoData[item.id]
                            ? (
                                Object.entries(videoData[item.id]).map(([videoId, data], idx) => (
                                    <div className='thumbnail-wrapper' key={idx}
                                         onClick={() => handleVideoClick(videoId)}
                                         style={{cursor: 'pointer'}}>
                                        <img src={data.thumbnail} alt={`Thumbnail for video ${videoId}`} key={idx}/>
                                        <div className='video-title'>{data.title}</div>
                                    </div>
                                ))
                            )
                            : item.snippet.title
                        }
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
