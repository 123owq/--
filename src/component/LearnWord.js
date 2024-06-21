import React, {useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import YouTube from 'react-youtube';
function YoutubeVideo({videoId, startTime, autoplay}) {

    const opts = {
        height: '180',
        width: '400',
        playerVars: {
            autoplay: autoplay,
            start: startTime,
        },
    };
    return <YouTube videoId={videoId} opts={opts}/>;
}
const VideoWithTranscript = ({item}) => {

    const [transcript, setTranscript] = useState(null);
    const videoId = item.video_id
    //---------------------임시-------------------------
    const [startTime, setStartTime] = useState(item.text_start_time)
    const [uStartTime, setUStartTime] = useState(item.text_start_time)
    const textIndex = item.text_index;
    const TextButtonColor = "#D8D8D8"
    const [activeIndex, setActiveIndex] = useState(null);
    const [autoPlay, setAutoPlay] = useState(0);

    useEffect(() => {
        axios.post(`http://localhost:5000/post_transcript`, {videoId})
            .then(response => {
                setTranscript(response.data);
            })
            .catch(error => {
                console.error('Error fetching transcript:', error);
            });
        console.log("0")
    }, [videoId]);

    useEffect(() => {
        if (transcript) {
            const index = transcript.findIndex(tranItem => tranItem.start <= startTime && startTime < (tranItem.start + tranItem.duration))
            setActiveIndex(index)
            console.log("1: ", startTime)
        }
    }, [startTime, transcript]);

    useEffect(() => {
        if (activeIndex) {
            const element = document.getElementById(`index-${activeIndex}`);
            if (element) {
               element.scrollIntoView({ behavior: 'smooth', block: 'center' });
               console.log("3: ")
            }
        }
    }, [activeIndex]);

    const handleClick = (time) => {
        setUStartTime(time)
        setAutoPlay(1)
    }
    const SecondTO = ({index ,start}) => {

    const number= start.toString().match(/^\d+/);
    const format = (seconds) => {
        seconds = parseInt(seconds, 10);
        const minute = Math.floor(seconds / 60);
        const second = seconds%60;
        if(second>=10){
            return `${minute}:${second}`
        }else {
            return `${minute}:0${second}`
        }
    }
    return (
        <button onClick={() => handleClick(start.toString().match(/^\d+/))}
                style={{
                    backgroundColor: index === textIndex ? 'lightgreen' : TextButtonColor
                }}>
            {format(number)}
        </button>
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',

            padding: '5px'
        }}>
            <div>

            </div>
            <YoutubeVideo videoId={item.video_id} startTime={uStartTime} autoplay={autoPlay} />
            {transcript && (
                <div style={{
                    width: '400px',
                    overflowY: 'auto',
                    maxHeight: '110px',
                    backgroundColor: "#2E2E2E",
                    color: TextButtonColor,

                }}>
                    {transcript.map((item, index) => (
                        <div key={index} id={`index-${index}`}  style={{color: index === textIndex ? 'lightgreen' : TextButtonColor}}>
                            <SecondTO index={index} start={item.start}/>
                            : {item.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LearnWord = () => {
    const location = useLocation();
    const {word, wordData} = location.state;
    const backgroundColor = "#2E2E2E"

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div>
                {word}: {wordData[0]["translated_word"]}
            </div>
            <div>
                {wordData.map((item, index) => (
                    <VideoWithTranscript item={item}/>
                ))}
            </div>
        </div>
    );
}

export default LearnWord;