import React, { useState } from 'react';
import './AddNotice.css';

const AddNotice = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newNotice = { title, description, category };

        try {
            const response = await fetch('http://localhost:5001/api/addNotice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotice)
            });

            const data = await response.json();
            setMessage(data.message);
            setTitle('');
            setDescription('');
            setCategory('');
        } catch (error) {
            setMessage('Error adding notice');
            console.error("Error adding notice:", error);
        }
    };

    return (
        <div className="container">
            <h2 className="header">Post New Notice</h2>
            <div className="form-wrapper">
                {message && <p className="message">{message}</p>}
                <form onSubmit={handleSubmit} className="notice-form">
                    <label>Notice Title:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Type Title Here" 
                        required 
                    />
                    <label>Notice Description:</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Type Description Here" 
                        required 
                    ></textarea>
                    <label>Select Category:</label>
                    <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        required 
                    >
                        <option value="">Select Category</option>
                        <option value="Notice">Notice</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Lost & Found">Lost & Found</option>
                    </select>
                    <button type="submit" className="submit-button">
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddNotice;