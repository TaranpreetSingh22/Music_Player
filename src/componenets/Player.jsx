import React, { useState, useRef } from 'react';
import './Player.css';

const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const audioRef = useRef(null);

    const songs = [
        {
            title: 'Song 1',
            artist: 'Artist 1',
            src: '',
        },
        {
            title: 'Song 2',
            artist: 'Artist 2',
            src: '',
        },
    ];

    const playPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const previousSong = () => {
        setCurrentSongIndex((prevIndex) => 
            prevIndex === 0 ? songs.length - 1 : prevIndex - 1
        );
        audioRef.current.pause();
        setIsPlaying(false);
    };

    return (
        <div className="music-player">
            <h2>{songs[currentSongIndex].title}</h2>
            <p>{songs[currentSongIndex].artist}</p>
            <audio ref={audioRef} src={songs[currentSongIndex].src}></audio>
            <div className="controls">
                <button onClick={previousSong}>&lt;&lt; Prev</button>
                <button onClick={playPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={nextSong}>Next &gt;&gt;</button>
            </div>
        </div>
    );
};

export default Player;
