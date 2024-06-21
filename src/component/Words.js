import React, {useState, useEffect,} from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



const Words = () => {
    const [wordsData, setWordsData] = useState({});
    const navigate = useNavigate();

    const TextButtonColor = "#D0F5A9"
    const backgroundColor = "#2E2E2E"

    useEffect(() => {
        axios.get('http://localhost:5000/get_word_json')
            .then(response => {
                setWordsData(response.data);
            })
            .catch(error => {
                console.error('Error fetching words data:', error);
            });
    }, []);

    const handleWordClick = (word) => {
        navigate('/LearnWord', { state: {word, wordData: wordsData[word]} });
    };
    const listStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
    };

    const buttonStyle = {
        backgroundColor: TextButtonColor,
        color: "black",
        margin: '5px',
        padding: '10px',
        border: 'none',
        cursor: 'pointer'
    };
    const boxStyle = {
        border: '1px solid #ccc',
        padding: '10px',
        marginBottom: '5px',
        display: 'flex',
        borderRadius: '5px',
        width: "400px",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    };

    return (
        <div style={listStyle}>
            {Object.keys(wordsData).map((word, index) => (
                <div style={boxStyle} key={index}>
                    <button
                        key={index}
                        style={buttonStyle}
                        onClick={() => handleWordClick(word)}
                    >
                        {word}
                    </button>
                    <div>
                        {wordsData[word][0]["translated_word"]}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Words;