import React, { useState, useRef, useEffect } from 'react';
import './Player.css';

const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [songs, setSongs] = useState([]);
    const [newSong, setNewSong] = useState({ title: '', artist: '', file: null });
    const audioRef = useRef(null);
    const [flag,setFlag]=useState(false);

    const fetchSongs = async () => {
        const response = await fetch('http://localhost:5000/songs');
        const data = await response.json();
        setSongs(data);
        if (data.status){
            setFlag(true);
        }
        else{
            setFlag(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

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

        await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        });

        fetchSongs(); // Refresh song list
        setNewSong({ title: '', artist: '', file: null }); // Reset form

        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear file input value
        }
    };

    const handleSongClick = (index) => {
        setCurrentSongIndex(index);
        setIsPlaying(true);
        audioRef.current.play();
    };

    return (
        <div className="music-player">
            <h2>{songs[currentSongIndex]?.title || 'Select a song'}</h2>
            <p>{songs[currentSongIndex]?.artist || ''}</p>
            <audio ref={audioRef} src={songs[currentSongIndex]?.src} onEnded={nextSong}></audio>
            <div className="controls">
                <button onClick={previousSong}>&lt;&lt; Prev</button>
                <button onClick={playPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={nextSong}>Next &gt;&gt;</button>
            </div>
            
            <h3>Song List</h3>
            <ul>
                { songs.length>0 ? songs.map((song, index) => (
                    <li key={index} onClick={() => handleSongClick(index)}  className={currentSongIndex === index ? 'active' : ''}>
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
