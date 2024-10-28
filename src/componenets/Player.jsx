import React, { useState, useRef, useEffect } from 'react';
import './Player.css';

const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [songs, setSongs] = useState([]);
    const [newSong, setNewSong] = useState({ title: '', artist: '', file: null });
    const audioRef = useRef(null);

    const fetchSongs = async () => {
        const response = await fetch('/songs');
        const data = await response.json();
        setSongs(data);
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    // Function to play the current song
    const playCurrentSong = () => {
        const currentSong = songs[currentSongIndex];
        if (currentSong && audioRef.current) {
            audioRef.current.src = currentSong.src; // Set the audio source
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((error) => console.error('Error trying to play audio:', error));
        }
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
        playCurrentSong();
    };

    const nextSong = () => {
        const nextIndex = (currentSongIndex + 1) % songs.length;
        setCurrentSongIndex(nextIndex);
        playCurrentSong();
    };

    const previousSong = () => {
        const prevIndex = (currentSongIndex === 0) ? songs.length - 1 : currentSongIndex - 1;
        setCurrentSongIndex(prevIndex);
        playCurrentSong();
    };

    const handleUploadChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setNewSong({ ...newSong, file: files[0] });
        } else {
            setNewSong({ ...newSong, [name]: value });
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('song', newSong.file);
        formData.append('title', newSong.title);
        formData.append('artist', newSong.artist);

        await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        fetchSongs(); // Refresh song list
        setNewSong({ title: '', artist: '', file: null }); // Reset form
    };

    return (
        <div className="music-player">
            <h2>{songs[currentSongIndex]?.title || 'Select a song'}</h2>
            <p>{songs[currentSongIndex]?.artist || ''}</p>
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)}></audio>
            <div className="controls">
                <button onClick={previousSong}>&lt;&lt; Prev</button>
                <button onClick={() => {
                    if (isPlaying) {
                        audioRef.current.pause();
                        setIsPlaying(false);
                    } else {
                        playCurrentSong();
                    }
                }}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={nextSong}>Next &gt;&gt;</button>
            </div>

            <h3>Song List</h3>
            <ul>
                {songs.length > 0 ? songs.map((song, index) => (
                    <li key={index} onClick={() => handleSongClick(index)} className={currentSongIndex === index ? 'active' : ''}>
                        {song.title} - {song.artist}
                    </li>
                )) : (<li>No Songs Available</li>)}
            </ul>

            <form onSubmit={handleUploadSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Song Title"
                    value={newSong.title}
                    onChange={handleUploadChange}
                    required
                />
                <input
                    type="text"
                    name="artist"
                    placeholder="Artist"
                    value={newSong.artist}
                    onChange={handleUploadChange}
                    required
                />
                <input
                    type="file"
                    name="file"
                    accept="audio/*"
                    onChange={handleUploadChange}
                    required
                />
                <button type="submit">Upload Song</button>
            </form>
        </div>
    );
};

export default Player;
