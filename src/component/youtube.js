import React, {useState, useEffect, useRef} from "react";
import YouTube from 'react-youtube';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function YoutubeVideo({videoId, startTime, onPlayerReady}) {

    const opts = {
        height: '200',
        width: '400',
        playerVars: {
            autoplay: 1,
            start: startTime,
        },
    };
    return <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady}/>;
}

const YoutubeUi = () => {
    const TextButtonColor = "#D8D8D8"
    const backgroundColor = "#2E2E2E"
    const width = "400px"

    const location = useLocation();
    const { videoId: receivedVideoId } = location.state || {};

    const [data, setData] = useState([])
    const [previousData, setPreviousData] = useState(null);
    const [clickIndex, newClickIndex] = useState(-1);
    const [startTime, setStartTime] = useState(0)

    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const playerRef = useRef(null);
    const autoPlayIntervalRef = useRef(null);

    const [autoPlayTextId, setAutoPlayTextId] = useState(null);

    const [tempTranslatedWord, setTempTranslatedWord] = useState('');
    const [textStartTime, setTextStartTime] = useState(0);
    const [selectedWord, setSelectedWord] = useState('');
    const [selectedTextIndex, setSelectedTextIndex] = useState(null);
    const [TranslatedWord, setTranslatedWord] = useState('');

    useEffect(() => {
        if (receivedVideoId) {
            axios.post('http://localhost:5000/transcript_json', { receivedVideoId })
                .then(response => {
                    setData(response.data);
                })
                .catch(error => {
                });
        }
    }, [receivedVideoId]);

    const handleClick = (index, time) => {
        if (clickIndex === index){

        setStartTime(data[clickIndex].start)
            return -1;
        }
        if (previousData){
            data[previousData['index']].text = previousData['text']
        }
        setData(prevData => {
            setPreviousData({'index': index, 'text': data[index].text});
            const newData = [...prevData];
            const words = newData[index].text.split(" ");
            newData[index].text = words.map((word, i) => (
               <button style={{backgroundColor: TextButtonColor}} key={i} onClick={() => handleClickWord(index, word, time)}>{word}</button>
            ));
            newClickIndex(index);
            return newData;
        });
    };

    const handleClickWord = (index, word, time) => {
        setSelectedWord(word);
        setSelectedTextIndex(index);
        setTextStartTime(time)

        axios.post('http://localhost:5000/translate_word', { word })
                .then(response => {
                setTempTranslatedWord(`${word}: ${response.data.translated_word}`);
                setTranslatedWord(response.data.translated_word);
            })
                .catch(error => {
                console.error("Error translating word:", error);
            });
    };

    const handleSaveWord = () => {
            const temp = {
            word: selectedWord,
            videoId: receivedVideoId,
            textIndex: selectedTextIndex,
            textStartTime: textStartTime,
            translatedWord: TranslatedWord,
        };
            axios.post('http://localhost:5000/word', temp)
            .then(response => {
                console.log("handleSaveWord(): Word saved successfully");
            })
            .catch(error => {
                console.error("Error saving word:", error);
            });
    }

    useEffect(() => {
            autoPlayIntervalRef.current = setInterval(() => {
                if (playerRef.current) {
                    const currentTime = playerRef.current.getCurrentTime();
                    const activeIndex = data.findIndex(item => item.start <= currentTime && currentTime < (item.start + item.duration)); // 현재 시간에 맞는 자막 인덱스 찾기
                    if (activeIndex !== -1) {
                        const element = document.getElementById(`index-${activeIndex}`);
                        if (element) {
                            if (isAutoPlaying){
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            if(autoPlayTextId != null){
                                document.getElementById(`index-${autoPlayTextId}`).style.color = TextButtonColor
                            }
                            element.style.color = '#81BEF7';
                            setAutoPlayTextId(activeIndex)
                        }
                    }
                }
            }, 1000);

        return () => clearInterval(autoPlayIntervalRef.current); // 컴포넌트 언마운트 시 interval 해제
    }, [isAutoPlaying, data, autoPlayTextId]);

    const autoPlay = () => {
        setIsAutoPlaying(!isAutoPlaying);
    }
    const onPlayerReady = (event) => {
        playerRef.current = event.target;
    }
        const centerDivStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px'

    };
    const videoStyle = {

        backgroundColor: "#2E2E2E",
        color: "#FFFFFF"
    };
    const listStyle = {
        width: width,
        overflowY: 'auto', // Allows scrolling if the list is long
        maxHeight: 'calc(100vh - 240px)', // Ensures the list does not overflow the screen
        backgroundColor: "#2E2E2E",
        color: TextButtonColor,
    };
    const SecondTO = ({index ,start}) => {
        const number = start.toString().match(/^\d+/);
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
            <button id="time" onClick={() => handleClick(index, number)}
                    style={{
                        backgroundColor: clickIndex === index ? 'lightgreen' : TextButtonColor
                    }}>
                {format(number)}
            </button>
        )
    }

    return (
        <div style={centerDivStyle}>
            <div style={videoStyle}>
                <YoutubeVideo videoId={receivedVideoId} startTime={startTime} onPlayerReady={onPlayerReady}/>
            </div>
            <div className='transcript' style={listStyle}>
                {data.map((item, index) => (
                    <div key={index} id={`index-${index}`}>
                        <SecondTO index={index} start={item.start}/>
                        : {item.text}
                    </div>
                ))}
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',

                width: width,
                backgroundColor: backgroundColor,
                color: TextButtonColor
            }}>
                <button onClick={() => autoPlay()}>auto_play</button>
                {tempTranslatedWord && (
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <p style={{marginRight: '10px'}}>{tempTranslatedWord}</p>
                        <button onClick={handleSaveWord}>저장</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default YoutubeUi;
